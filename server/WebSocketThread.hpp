#pragma once

#include <QtNetwork>
#include <QThread>

//#include "QWsSocket.h"
#include <QtWebSockets/QtWebSockets>

class SocketThread : public QThread
{
    Q_OBJECT

signals:
    void newFEMPRequest(const QVariantMap& request, QVariantMap& response);

public:
    SocketThread(QWebSocket* wsSocket);
    ~SocketThread();

    QWebSocket* socket;
    void run();

private slots:
    void processMessage(QString message, bool lastFrame);
    void sendMessage(QString message);
    void processPong(quint64 elapsedTime);
    void socketDisconnected();
    void finished();

signals:
    void messageReceived(QString frame);

private:

};
