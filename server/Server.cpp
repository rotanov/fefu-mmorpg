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
            , SIGNAL(newRequest(QHttpRequest*, QHttpResponse*))
            , this
            , SLOT(handleRequest(QHttpRequest*, QHttpResponse*)));
}

Server::~Server()
{
    delete httpServer_;
}

void Server::handleRequest(QHttpRequest *request, QHttpResponse *response)
{
    auto method = request->method();

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
            connect(request, SIGNAL(end()), this, SLOT(dataEnd()));
            connect(request, SIGNAL(data(QByteArray)), this, SLOT(data(QByteArray)));
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

    response_->writeHead(QHttpResponse::STATUS_OK);
    auto responseJSON = QJsonDocument::fromVariant(response).toJson();
    qDebug() << "response JSON: " << responseJSON;
    response_->end(responseJSON);

    response_ = NULL;
    data_.clear();
}

void Server::data(const QByteArray& data)
{
    data_.append(data);
}

void Server::Start()
{
    if (!running_)
    {
        running_ = httpServer_->listen(port_);

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
    QRegExp rx("[0-9a-zA-Z]+");

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

    if (db.find(login) != db.end())
    {
        WriteResult_(response, EFEMPResult::LOGIN_EXISTS);
    }
    else if (!rx.exactMatch(login)
             || login.size() < minLoginLength_
             || login.size() > maxLoginLength_)
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
        db.insert(login, password);
    }

    for (auto i = db.begin(); i != db.end(); ++i)
    {
        qDebug() << i.key() << ":" << i.value();
    }
}

void GameServer::HandleLogin(const QVariantMap& request, QVariantMap& response)
{
    auto login = request["login"].toString();
    auto password = request["password"].toString();

    if (db.find(login) == db.end()
        || db[login] != password)
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
        sids.insert(sid.toHex(), login);
        response["sid"] = sid.toHex();
    }
}

void GameServer::HandleLogout(const QVariantMap& request, QVariantMap& response)
{
    auto sid = request["sid"].toByteArray();

    if (sids.find(sid) == sids.end())
    {
        WriteResult_(response, EFEMPResult::BAD_SID);
    }
    else
    {
        WriteResult_(response, EFEMPResult::OK);
        auto iter = sids.find(sid);
        sids.erase(iter);
    }
}

void GameServer::HandleClearDB(const QVariantMap& request, QVariantMap& response)
{
    db.clear();
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
