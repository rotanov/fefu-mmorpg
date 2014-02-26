#include "qhttpserverfwd.h"

#include <QObject>

/// Server

class MyServer : public QObject
{
    Q_OBJECT

public:
    MyServer();
    virtual ~MyServer();

private slots:
    void handleRequest(QHttpRequest *req, QHttpResponse *resp);
    void dataEnd();
    void data(const QByteArray& data);

private:
    QHttpRequest* request_;
    QHttpResponse* response_;
    QByteArray data_;
};
