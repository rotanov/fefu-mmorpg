#include "server.hpp"

#include <QFile>
#include <QJsonDocument>

#include <qhttpserver.h>
#include <qhttprequest.h>
#include <qhttpresponse.h>

#include <cstdio>
#include <cstdlib>
#include <iostream>

QMap<QString, QString> db;
void Authentication(QByteArray data_, QHttpResponse *resp);

/// Server

MyServer::MyServer()
{
    QHttpServer *server = new QHttpServer(this);
    connect(server, SIGNAL(newRequest(QHttpRequest*, QHttpResponse*)),
            this, SLOT(handleRequest(QHttpRequest*, QHttpResponse*)));

    server->listen(QHostAddress::Any, 6543);
}

MyServer::~MyServer()
{

}

void MyServer::handleRequest(QHttpRequest *req, QHttpResponse *resp)
{
//    Q_UNUSED(req);

    connect(req, SIGNAL(end()), this, SLOT(dataEnd()));
    connect(req, SIGNAL(data(QByteArray)), this, SLOT(data(QByteArray)));

    response_ = resp;

    auto uri = req->url();
    auto& headers = req->headers();
    auto path = req->path();
    auto method = req->method();
    auto data = req->body();

    resp->setHeader("Cache-control", "no-cache, no-store");

    std::cerr << path.toStdString() << std::endl;
    QFile index("static" + path);

    if (!data_.isEmpty())
    {
        Authentication(data_, resp);
        return;
    }

//    resp->setHeader("Content-Type", "text/html; charset=utf-8");

    QByteArray body;

    if (!index.open(QIODevice::ReadOnly))
    {
        body = "404 not found";
        resp->setHeader("Content-Length", QString::number(body.size()));
        resp->setHeader("Content-Type", "text/plain; charset=utf-8");
        resp->writeHead(404);
        resp->end(body);
        return;
    }

    body = index.readAll();
    resp->setHeader("Content-Length", QString::number(body.size()));
    resp->writeHead(200);
    resp->end(body);
}

void MyServer::dataEnd()
{
    response_;
}

void MyServer::data(const QByteArray& data)
{
    data_ = data;
}


void Authentication(QByteArray data_, QHttpResponse *resp)
{
    QVariant qVariant = QJsonDocument::fromJson(data_).toVariant();
    QVariantMap jsonData = qVariant.toMap();

    QMap<QString, QVariant>::iterator iter = jsonData.find("action");
    QString userLogin = jsonData.find("login").value().toString();
    QString userPassword = jsonData.find("password").value().toString();

    if (!QString::compare(iter.value().toString(), QString("register")))
    {
        if (db.find(userLogin) != db.end())
        {
             resp->writeHead(200);
             resp->end("{\"result\": \"loginExists\"}");
             return;
        }

        db.insert(userLogin, userPassword);
        QMap<QString, QString>::const_iterator i;
        for (i = db.constBegin(); i != db.constEnd(); ++i)
            qDebug() << i.key() << ":" << i.value();
    }

    if (!QString::compare(iter.value().toString(), QString("login")))
    {
        if (db.find(userLogin) == db.end())
        {
             resp->writeHead(200);
             resp->write("{\"result\": \"badLogin\"}");
             return;
        }
        else if (QString::compare(db[userLogin], userPassword))
        {
            resp->writeHead(200);
            resp->write("{\"result\": \"badPassword\"}");
            return;
        }
    }
    resp->writeHead(200);
    resp->end("{\"result\": \"ok\"}");
    return;
}
