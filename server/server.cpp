#include "server.hpp"

#include <QFile>
#include <QRegExp>
#include <QJsonDocument>


#include <qhttpserver.h>
#include <qhttprequest.h>
#include <qhttpresponse.h>

#include <cstdio>
#include <cstdlib>
#include <iostream>

QMap<QString, QString> db;
size_t minPrasswordLength = 3;
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

   if (method != 3)
   {
        body = index.readAll();
        resp->setHeader("Content-Length", QString::number(body.size()));
        resp->writeHead(200);
        resp->end(body);
    }
}

void MyServer::dataEnd()
{
    response_;
}

void MyServer::data(const QByteArray& data)
{
    data_ = data;
    Authentication(data_, response_);
}

void Authentication(QByteArray data_, QHttpResponse *resp)
{
    QVariant qVariant = QJsonDocument::fromJson(data_).toVariant();
    QVariantMap jsonData = qVariant.toMap();

    QMap<QString, QVariant>::iterator iter = jsonData.find("action");
    if (!QString::compare(iter.value().toString(), QString("clear")))
    {
        db.clear();
        return;
    }
    QString userLogin = jsonData.find("login").value().toString();
    QString userPassword = jsonData.find("password").value().toString();

    QRegExp rx("[A-Za-z0-9]+");
    QVariantMap answer;
    bool error = false;

    if (!QString::compare(iter.value().toString(), QString("register")))
    {
        if (db.find(userLogin) != db.end())
        {
            resp->writeHead(200);
            answer.insert("result", "loginExists");
            error = true;
        }
        else if (!rx.exactMatch(userLogin))
        {
            resp->writeHead(200);
            answer.insert("result", "badLogin");
            error = true;
        }
        else if (userPassword.length() < minPrasswordLength)
        {
            resp->writeHead(200);
            answer.insert("result", "badPassword");
            error = true;
        }
        else
        {
            db.insert(userLogin, userPassword);
        }

        QMap<QString, QString>::const_iterator i;
        for (i = db.constBegin(); i != db.constEnd(); ++i)
            qDebug() << i.key() << ":" << i.value();
    }

    if (!QString::compare(iter.value().toString(), QString("login")))
    {
        if (db.find(userLogin) == db.end() ||
            QString::compare(db[userLogin], userPassword))
        {
            resp->writeHead(200);
            answer.insert("result", "invalidCredentials");
            error = true;
        } 
    }

    if (!error)
    {
        resp->writeHead(200);
        answer.insert("result", "ok");
    }

    QJsonDocument json;
    json =  QJsonDocument::fromVariant(answer);
    resp->end(json.toJson());
    return;
}
