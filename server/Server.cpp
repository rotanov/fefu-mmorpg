#include "Server.hpp"

#include <cstdio>
#include <cstdlib>
#include <iostream>
#include <vector>

#include <QFile>
#include <QFileInfo>

#include "qhttpserver.h"
#include "qhttprequest.h"
#include "qhttpresponse.h"

#include "WebSocketThread.hpp"

Server::Server()
{
    httpServer_ = new QHttpServer(this);

    connect(httpServer_
            , &QHttpServer::newRequest
            , this
            , &Server::handleRequest);

    wsServer_ = new QWebSocketServer("", QWebSocketServer::NonSecureMode, this);

    QObject::connect(wsServer_
                     , SIGNAL(newConnection())
                     , this
                     , SLOT(processNewWSConnection()));
}

Server::~Server()
{
    delete httpServer_;
}

void Server::handleRequest(QHttpRequest *request, QHttpResponse *response)
{
    auto method = request->method();

    QString host = "";
    QRegExp ipFromHost("(.*):.*");
    host = request->header("host");
    ipFromHost.indexIn(host);
    host = ipFromHost.cap(1);

    emit wsAddressChanged("ws://" + host + ":" + QString::number(Server::WS_PORT));

    switch (method)
    {
        case QHttpRequest::HTTP_GET:
        {
            auto path = request->path();
            if (path == "/")
            {
                path = "/index.html";
            }
            //qDebug() << path;

            response->setHeader("Access-Control-Allow-Origin", "*");
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
            QByteArray body;
            body = "404 not found";
            response->setHeader("Content-Length", QString::number(body.size()));
            response->setHeader("Content-Type", "text/plain; charset=utf-8");
            response->writeHead(QHttpResponse::STATUS_NOT_FOUND);
            response->end(body);
            qDebug() << "Unsupported HTTP method: " << method;
        }
    }
}

void Server::dataEnd()
{
//    qDebug() << "request JSON: " << data_;
    QVariantMap request = QJsonDocument::fromJson(data_).toVariant().toMap();
    QVariantMap response;

    emit newFEMPRequest(request, response);

    response_->setHeader("Access-Control-Allow-Origin", "*");
    response_->setHeader("Content-Type", "application/json; charset=utf-8");
    response_->writeHead(QHttpResponse::STATUS_OK);
    auto responseJSON = QJsonDocument::fromVariant(response).toJson();
//    qDebug() << "response JSON: " << responseJSON;
    response_->end(responseJSON);

    response_ = NULL;
    data_.clear();
}

void Server::processNewWSConnection()
{
    std::cout << QObject::tr("Client connected").toStdString() << std::endl;

    // Get the connecting socket
    QWebSocket* socket = wsServer_->nextPendingConnection();

    // Create a new thread and giving to him the socket
    SocketThread* thread = new SocketThread(socket);

    // connect for message broadcast
//    QObject::connect(socket, SIGNAL(frameReceived(QString)), this, SIGNAL(broadcastMessage(QString)));
    QObject::connect(this, SIGNAL(broadcastMessage(QString)), thread, SLOT(sendMessage(QString)));

    connect(thread
            , SIGNAL(newFEMPRequest(const QVariantMap&, QVariantMap&))
            , this
            , SIGNAL(newFEMPRequest(const QVariantMap&, QVariantMap&))
            , Qt::DirectConnection);

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
            return;
        }
        else
        {
            qDebug() << "Server started.";
        }

        if (!wsServer_->listen(QHostAddress::Any, WS_PORT))
        {
            std::cout << QObject::tr("Error: Can't launch server").toStdString() << std::endl;
            std::cout << QObject::tr("QWsServer error : %1").arg(wsServer_->errorString()).toStdString() << std::endl;
            httpServer_->close();
            running_ = false;
        }
        else
        {
            std::cout << QObject::tr("Server is listening port %1").arg(WS_PORT).toStdString() << std::endl;
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
        wsServer_->close();
        running_ = false;
        qDebug() << "Server stopped.";
    }
    else
    {
        qDebug() << "Attempt to stop server while it's not running.";
    }
}
