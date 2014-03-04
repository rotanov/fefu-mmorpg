#pragma once

#include <QObject>

#include "qhttpserverfwd.h"

class Server : public QObject
{
    Q_OBJECT

public:
    Server();
    virtual ~Server();

    void Start();
    void Stop();

private slots:
    void handleRequest(QHttpRequest *req, QHttpResponse *resp);
    void dataEnd();
    void data(const QByteArray& data);

private:
    QHttpServer* httpServer_;
    QHttpRequest* request_ = NULL;
    QHttpResponse* response_ = NULL;
    QByteArray data_;
    bool running_ = false;

    static const quint16 port_ = 6543;
};
