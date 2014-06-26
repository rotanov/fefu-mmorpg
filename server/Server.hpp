#pragma once

#include <vector>
#include <unordered_map>
#include <functional>

#include <QObject>
#include <QString>
#include <QtCore>

#include "qhttpserverfwd.h"
//#include "QWsServer.h"

#include <QtWebSockets/QtWebSockets>

class Server : public QObject
{
  Q_OBJECT

signals:
  void broadcastMessage(QString message);
  void newFEMPRequest(const QVariantMap& request, QVariantMap& response);
  void wsAddressChanged(QString address);

public slots:
  void processNewWSConnection();

public:
  static const quint16 HTTP_PORT = 6543;
  static const quint16 WS_PORT = 6544;

  Server();
  virtual ~Server();

  void Start();
  void Stop();

private slots:
  void handleRequest(QHttpRequest *request, QHttpResponse *response);
  void dataEnd();
  void data(const QByteArray& data);

private:
  QHttpServer* httpServer_;
  QWebSocketServer* wsServer_;
  //    QtWebsocket::QWsServer* wsServer_;

  QHttpResponse* response_ = NULL;
  QByteArray data_;
  bool running_ = false;
};
