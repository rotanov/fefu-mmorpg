#include "Server.hpp"

#include <cstdio>
#include <cstdlib>
#include <iostream>

#include <QFile>
#include <QRegExp>
#include <QJsonDocument>
#include <QCryptographicHash>
#include <QTime>
#include <QFileInfo>

#include "qhttpserver.h"
#include "qhttprequest.h"
#include "qhttpresponse.h"

Server::Server()
{
    httpServer_ = new QHttpServer(this);
    connect(httpServer_
            , &QHttpServer::newRequest
            , this
            , &Server::handleRequest);

    int port = WS_PORT;
    wsServer_ = new QtWebsocket::QWsServer(this);
    if (!wsServer_->listen(QHostAddress::Any, port))
    {
        std::cout << QObject::tr("Error: Can't launch server").toStdString() << std::endl;
        std::cout << QObject::tr("QWsServer error : %1").arg(wsServer_->errorString()).toStdString() << std::endl;
    }
    else
    {
        std::cout << QObject::tr("Server is listening port %1").arg(port).toStdString() << std::endl;
    }
    QObject::connect(wsServer_
                     , SIGNAL(newConnection())
                     , this
                     , SLOT(processNewWSConnection()));
}

Server::~Server()
{
    delete httpServer_;
}

// KLUDGE: shall fail for multiple clients with different host
static QString host = "";

void Server::handleRequest(QHttpRequest *request, QHttpResponse *response)
{
    auto method = request->method();
    QRegExp ipFromHost("(.*):.*");
    host = request->header("host");
    ipFromHost.indexIn(host);
    host = ipFromHost.cap(1);

    switch (method)
    {
        case QHttpRequest::HTTP_GET:
        {
            auto path = request->path();
            qDebug() << path;

            response->setHeader("Cache-control", "no-cache, no-store");

            auto extension = QFileInfo(path).suffix();

            if (extension == "htm"
                || extension == "html")
            {
                response->setHeader("Content-Type", "text/html; charset=utf-8");
            }
            else if (extension == "css")
            {
                response->setHeader("Content-Type", "text/css; charset=utf-8");
            }
            else if (extension == "js")
            {
                response->setHeader("Content-Type", "application/javascript; charset=utf-8");
            }
            else
            {
                response->setHeader("Content-Type", "text/plain; charset=utf-8");
            }

            QFile index("../client" + path);
            QByteArray body;

            if (!index.open(QIODevice::ReadOnly))
            {
                body = "404 not found";
                response->setHeader("Content-Length", QString::number(body.size()));
                response->setHeader("Content-Type", "text/plain; charset=utf-8");
                response->writeHead(QHttpResponse::STATUS_NOT_FOUND);
                response->end(body);
            }
            else
            {
                body = index.readAll();
                response->setHeader("Content-Length", QString::number(body.size()));
                response->writeHead(QHttpResponse::STATUS_OK);
                response->end(body);
            }
        }
            break;

        case QHttpRequest::HTTP_POST:
        {
            response_ = response;
            connect(request
                    , &QHttpRequest::end
                    , this
                    , &Server::dataEnd);

            connect(request
                    , &QHttpRequest::data
                    , this
                    , &Server::data);
        }
            break;

        default:
        {
            qDebug() << "Unsupported HTTP method.";
        }
    }
}

void Server::dataEnd()
{
    qDebug() << "request JSON: " << data_;
    QVariantMap request = QJsonDocument::fromJson(data_).toVariant().toMap();
    QVariantMap response;

    emit newFEMPRequest(request, response);

    response_->setHeader("Content-Type", "application/json; charset=utf-8");
    response_->writeHead(QHttpResponse::STATUS_OK);
    auto responseJSON = QJsonDocument::fromVariant(response).toJson();
    qDebug() << "response JSON: " << responseJSON;
    response_->end(responseJSON);

    response_ = NULL;
    data_.clear();
}

void Server::processNewWSConnection()
{
    std::cout << QObject::tr("Client connected").toStdString() << std::endl;

    // Get the connecting socket
    QtWebsocket::QWsSocket* socket = wsServer_->nextPendingConnection();

    // Create a new thread and giving to him the socket
    SocketThread* thread = new SocketThread(socket);

    // connect for message broadcast
    QObject::connect(socket, SIGNAL(frameReceived(QString)), this, SIGNAL(broadcastMessage(QString)));
    QObject::connect(this, SIGNAL(broadcastMessage(QString)), thread, SLOT(sendMessage(QString)));

    // Starting the thread
    thread->start();
}


void Server::data(const QByteArray& data)
{
    data_.append(data);
}

void Server::Start()
{
    if (!running_)
    {
        running_ = httpServer_->listen(HTTP_PORT);

        if (!running_)
        {
            qDebug() << "Unable to start http server.";
        }
        else
        {
            qDebug() << "Server started.";
        }
    }
    else
    {
        qDebug() << "Server already running.";
    }
}


void Server::Stop()
{
    if (running_)
    {
        httpServer_->close();
        running_ = false;
        qDebug() << "Server stopped.";
    }
    else
    {
        qDebug() << "Attempt to stop server while it's not running.";
    }
}

////////////////////////////////////////////////////////////////////////////////

void GameServer::HandleRegister(const QVariantMap& request, QVariantMap& response)
{
    QRegExp rx("[0-9a-zA-Z]{2,36}");

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

    if (db_.find(login) != db_.end())
    {
        WriteResult_(response, EFEMPResult::LOGIN_EXISTS);
    }
    else if (!rx.exactMatch(login)
             /*|| login.size() < minLoginLength_
             || login.size() > maxLoginLength_*/)
    {
        WriteResult_(response, EFEMPResult::BAD_LOGIN);
    }
    else if (password.size() < minPrasswordLength_
             || password.size() > maxPrasswordLength_
             || passHasInvalidChars)
    {
        WriteResult_(response, EFEMPResult::BAD_PASS);
    }
    else
    {
        WriteResult_(response, EFEMPResult::OK);
        db_.insert(login, password);
    }

    for (auto i = db_.begin(); i != db_.end(); ++i)
    {
        qDebug() << i.key() << ":" << i.value();
    }
}

void GameServer::HandleLogin(const QVariantMap& request, QVariantMap& response)
{
    auto login = request["login"].toString();
    auto password = request["password"].toString();

    if (db_.find(login) == db_.end()
        || db_[login] != password)
    {
        WriteResult_(response, EFEMPResult::INVALID_CREDENTIALS);
    }
    else
    {
        WriteResult_(response, EFEMPResult::OK);
        QTime midnight(0,0,0);
        qsrand(midnight.secsTo(QTime::currentTime()));
        QByteArray id ;
        id.append(QString(qrand()));
        QByteArray sid = QCryptographicHash::hash(id, QCryptographicHash::Md5);
        sids_.insert(sid.toHex(), login);
        response["sid"] = sid.toHex();
        response["webSocket"] = "ws://" + host + ":" + QString::number(Server::WS_PORT);
    }
}

void GameServer::HandleLogout(const QVariantMap& request, QVariantMap& response)
{
    auto sid = request["sid"].toByteArray();

    if (sids_.find(sid) == sids_.end())
    {
        WriteResult_(response, EFEMPResult::BAD_SID);
    }
    else
    {
        WriteResult_(response, EFEMPResult::OK);
        auto iter = sids_.find(sid);
        sids_.erase(iter);
    }
}

void GameServer::HandleClearDB(const QVariantMap& request, QVariantMap& response)
{
    db_.clear();
}

GameServer::GameServer()
{
    requestHandlers_["register"] = &GameServer::HandleRegister;
    requestHandlers_["login"] = &GameServer::HandleLogin;
    requestHandlers_["logout"] = &GameServer::HandleLogout;
    requestHandlers_["clearDb"] = &GameServer::HandleClearDB;
}

GameServer::~GameServer()
{

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

    auto handler = handlerIt.value();
    (this->*handler)(request, response);
}

void GameServer::WriteResult_(QVariantMap& response, const EFEMPResult result)
{
    response["result"] = fempResultToString[static_cast<unsigned>(result)];
}

////////////////////////////////////////////////////////////////////////////////
SocketThread::SocketThread(QtWebsocket::QWsSocket* wsSocket) :
    socket(wsSocket)
{
    // Set this thread as parent of the socket
    // This will push the socket in the good thread when using moveToThread on the parent
    if (socket)
    {
        socket->setParent(this);
    }

    // Move this thread object in the thread himsleft
    // Thats necessary to exec the event loop in this thread
    moveToThread(this);
}

SocketThread::~SocketThread()
{
}

void SocketThread::run()
{
    std::cout << tr("connect done in thread : 0x%1")
        .arg(QString::number((unsigned int)QThread::currentThreadId(), 16))
        .toStdString() << std::endl;

    // Connecting the socket signals here to exec the slots in the new thread
    QObject::connect(socket, SIGNAL(frameReceived(QString)), this, SLOT(processMessage(QString)));
    QObject::connect(socket, SIGNAL(disconnected()), this, SLOT(socketDisconnected()));
    QObject::connect(socket, SIGNAL(pong(quint64)), this, SLOT(processPong(quint64)));
    QObject::connect(this, SIGNAL(finished()), this, SLOT(finished()), Qt::DirectConnection);

    // Launch the event loop to exec the slots
    exec();
}

void SocketThread::finished()
{
    this->moveToThread(QCoreApplication::instance()->thread());
    this->deleteLater();
}

void SocketThread::processMessage(QString message)
{
    // ANY PROCESS HERE IS DONE IN THE SOCKET THREAD !

    std::cout << tr("thread 0x%1 | %2")
        .arg(QString::number((unsigned int)QThread::currentThreadId(), 16))
        .arg(message).toStdString() << std::endl;
}

void SocketThread::sendMessage(QString message)
{
    socket->write(message);
}

void SocketThread::processPong(quint64 elapsedTime)
{
    std::cout << tr("ping: %1 ms").arg(elapsedTime).toStdString() << std::endl;
}

void SocketThread::socketDisconnected()
{
    std::cout << tr("Client disconnected, thread finished").toStdString() << std::endl;

    // Prepare the socket to be deleted after last events processed
    socket->deleteLater();

    // finish the thread execution (that quit the event loop launched by exec)
    quit();
}
