#include "GameServer.hpp"

#include <QRegExp>
#include <QJsonDocument>
#include <QCryptographicHash>
#include <QTime>
#include <QVariant>
#include <QDebug>

#include "PermaStorage.hpp"

bool ExactMatch(QString pattern, QString str)
{
    QRegExp rx(pattern);
    return rx.exactMatch(str);
}

GameServer::GameServer()
{
    QTime midnight(0, 0, 0);
    qsrand(midnight.secsTo(QTime::currentTime()));

    timer_ = new QTimer(this);
    connect(timer_
            , &QTimer::timeout
            , this
            , &GameServer::tick);
    timer_->setInterval(1000.0f / static_cast<float>(ticksPerSecond_));

    requestHandlers_["startTesting"] = &GameServer::HandleStartTesting;
    requestHandlers_["setUpConst"] = &GameServer::HandleSetUpConstants;
    requestHandlers_["login"] = &GameServer::HandleLogin;
    requestHandlers_["logout"] = &GameServer::HandleLogout;
    requestHandlers_["register"] = &GameServer::HandleRegister;

    requestHandlers_["examine"] = &GameServer::HandleExamine;
    requestHandlers_["getDictionary"] = &GameServer::HandleGetDictionary;
    requestHandlers_["look"] = &GameServer::HandleLook;
    requestHandlers_["move"] = &GameServer::HandleMove;

    for (int i = 0; i < 512; i++)
    {
        levelMap_[0][i] = '#';
        levelMap_[511][i] = '#';
        levelMap_[i][0] = '#';
        levelMap_[i][511] = '#';
    }

    for (int i = 1; i < 511; i++)
    {
        for (int j = 1; j < 511; j++)
        {
            levelMap_[i][j] = std::vector<char>({'#', '.', '.', ','})[rand() % 4];
        }
    }

    players_.reserve(1000);
}

GameServer::~GameServer()
{

}

bool GameServer::Start()
{
    if (storage_.Connect())
    {
        storage_.InitSchema();
        timer_->start();
        time_.start();
        lastTime_ = time_.elapsed();
        return true;
    }
    return false;
}

void GameServer::Stop()
{
    storage_.Reset();
    storage_.Disconnect();
    timer_->stop();
}

void GameServer::handleFEMPRequest(const QVariantMap& request, QVariantMap& response)
{
    auto actionIt = request.find("action");
    if (actionIt == request.end())
    {
        WriteResult_(response, EFEMPResult::INVALID_REQUEST);
        return;
    }

    QString action = actionIt.value().toString();
    qDebug() << "FEMP action: " << action;
    auto handlerIt = requestHandlers_.find(action);

    if (handlerIt == requestHandlers_.end())
    {
        WriteResult_(response, EFEMPResult::INVALID_REQUEST);
        return;
    }

    if (action != "register"
        && action != "login"
        && action != "startTesting"
        && action != "setUpConst")
    {
        if (request.find("sid") == request.end()
            || sids_.find(request["sid"].toByteArray()) == sids_.end())
        {
            WriteResult_(response, EFEMPResult::BAD_SID);
            return;
        }
    }

    auto handler = handlerIt.value();
    (this->*handler)(request, response);

    response["action"] = request["action"];

    if (response.find("result") == response.end())
    {
        WriteResult_(response, EFEMPResult::OK);
    }
}

void GameServer::HandleRegister(const QVariantMap& request, QVariantMap& response)
{
    QString login = request["login"].toString();
    QString password = request["password"].toString();

    bool passHasInvalidChars = false;

    for (int i = 0; i < password.size(); i++)
    {
        if (!password[i].isPrint())
        {
            passHasInvalidChars = true;
            break;
        }
    }

    if (loginToPass_.find(login) != loginToPass_.end())
    {
        WriteResult_(response, EFEMPResult::LOGIN_EXISTS);
    }
    else if (!ExactMatch("[0-9a-zA-Z]{2,36}", login))
    {
        WriteResult_(response, EFEMPResult::BAD_LOGIN);
    }
    else if (!ExactMatch(".{6,36}", password)
             || passHasInvalidChars)
    {
        WriteResult_(response, EFEMPResult::BAD_PASS);
    }
    else
    {
        loginToPass_.insert(login, password);
    }

    for (auto i = loginToPass_.begin(); i != loginToPass_.end(); ++i)
    {
        qDebug() << i.key() << ":" << i.value();
    }
}

void GameServer::setWSAddress(QString address)
{
    wsAddress_ = address;
}

void GameServer::tick()
{
    float dt = (time_.elapsed() - lastTime_) * 0.001f;
    lastTime_ = time_.elapsed();
    qDebug() << "tick: " << dt;
}

void GameServer::HandleSetUpConstants(const QVariantMap& request, QVariantMap& response)
{
    playerVelocity_ = request["playerVelocity"].toFloat();
    slideThreshold_ = request["slideThreshold"].toFloat();
    ticksPerSecond_ = request["ticksPerSecond"].toInt();
    screenRowCount_ = request["screenRowCount"].toInt();
    screenColumnCount_ = request["screenColumnCount"].toInt();
}

void GameServer::HandleLogin(const QVariantMap& request, QVariantMap& response)
{
    auto login = request["login"].toString();
    auto password = request["password"].toString();

    if (loginToPass_.find(login) == loginToPass_.end()
        || loginToPass_[login] != password)
    {
        WriteResult_(response, EFEMPResult::INVALID_CREDENTIALS);
    }
    else
    {
        QByteArray id = QString(qrand()).toLatin1();
        QByteArray sid = QCryptographicHash::hash(id, QCryptographicHash::Sha1);
        sids_.insert(sid.toHex(), login);
        response["sid"] = sid.toHex();
        response["webSocket"] = wsAddress_;

        // TODO: take out
        {
            Player player;
            player.id = lastId;
            lastId++;
            player.login = login;

            int x;
            int y;
            do
            {
                x = rand() % 510 + 1;
                y = rand() % 510 + 1;
            } while (levelMap_[x][y] == '#');
            player.x = x;
            player.y = y;
            players_.push_back(player);

            response["id"] = player.id;
        }
    }
}

void GameServer::HandleLogout(const QVariantMap& request, QVariantMap& response)
{
    auto sid = request["sid"].toByteArray();
    auto iter = sids_.find(sid);
    sids_.erase(iter);
}

void GameServer::HandleStartTesting(const QVariantMap& request, QVariantMap& response)
{
    loginToPass_.clear();
    storage_.Reset();
}

void GameServer::HandleGetDictionary(const QVariantMap& request, QVariantMap& response)
{
    QVariantMap dictionary;
    dictionary["#"] = "wall";
    dictionary["."] = "grass";
    response["dictionary"] = dictionary;
}

void GameServer::HandleMove(const QVariantMap& request, QVariantMap& response)
{
    auto sid = request["sid"].toByteArray();
    auto login = sids_[sid];

    auto direction = request["direction"].toString();

    for (auto& p : players_)
    {
        if (p.login == login)
        {
            if (direction == "north")
            {
                p.y -= 0.1f;
            }
            else if (direction == "south")
            {
                p.y += 0.1f;
            }
            else if (direction == "west")
            {
                p.x -= 0.1f;
            }
            else if (direction == "east")
            {
                p.x += 0.1f;
            }
            return;
        }
    }

    WriteResult_(response, EFEMPResult::BAD_ID);
}

void GameServer::HandleLook(const QVariantMap& request, QVariantMap& response)
{
    auto sid = request["sid"].toByteArray();
    auto login = sids_[sid];
    for (auto& p : players_)
    {
        if (p.login == login)
        {
//            int [9][7] area;
            QVariantList rows;

            for (int j = p.y - 3; j <= p.y + 3; j++)
            {
                QVariantList row;
                for (int i = p.x - 4; i <= p.x + 4; i++)
                {
                    if (j < 0 || j > 511 || i < 0 || i > 511)
                    {
                        row.push_back("#");
                    }
                    else
                    {
                        row.push_back(QString(levelMap_[i][j]));
                    }
                }
                rows.push_back(row);
            }

            response["map"] = rows;
            return;
        }
    }
}

void GameServer::HandleExamine(const QVariantMap& request, QVariantMap& response)
{
    auto id = request["id"].toInt();
    for (auto& p : players_)
    {
        if (p.id == id)
        {
            response["type"] = "player";
            response["login"] = p.login;
            response["x"] = p.x;
            response["y"] = p.y;
            response["id"] = p.id;
            return;
        }
    }

    WriteResult_(response, EFEMPResult::BAD_ID);
}

void GameServer::WriteResult_(QVariantMap& response, const EFEMPResult result)
{
    response["result"] = fempResultToString[static_cast<unsigned>(result)];
}
