#pragma once

#include <QtNetwork>
#include <QThread>

#include "QWsSocket.h"

class SocketThread : public QThread
{
    Q_OBJECT

signals:
    void newFEMPRequest(const QVariantMap& request, QVariantMap& response);

public:
    SocketThread(QtWebsocket::QWsSocket* wsSocket);
    ~SocketThread();

    QtWebsocket::QWsSocket* socket;
    void run();

private slots:
    void processMessage(QString message);
    void sendMessage(QString message);
    void processPong(quint64 elapsedTime);
    void socketDisconnected();
    void finished();

signals:
    void messageReceived(QString frame);

private:

};
