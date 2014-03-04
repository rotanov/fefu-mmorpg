#pragma once

#include <vector>
#include <unordered_map>
#include <functional>

#include <QObject>
#include <QMap>
#include <QString>

#include "qhttpserverfwd.h"

class Server : public QObject
{
    Q_OBJECT

public:
    Server();
    virtual ~Server();

    void Start();
    void Stop();

signals:
    void newFEMPRequest(const QVariantMap& request, QVariantMap& response);

private slots:
    void handleRequest(QHttpRequest *request, QHttpResponse *response);
    void dataEnd();
    void data(const QByteArray& data);

private:
    QHttpServer* httpServer_;
    QHttpResponse* response_ = NULL;
    QByteArray data_;
    bool running_ = false;

    static const quint16 port_ = 6543;
};

enum class EFEMPResult
{
    OK,
    BAD_SID,
    BAD_PASS,
    BAD_LOGIN,
    LOGIN_EXISTS,
    INVALID_CREDENTIALS,
    BAD_ID,
    INVALID_REQUEST,
};

const std::vector<QString> fempResultToString =
{
    [EFEMPResult::OK] = "ok",
    [EFEMPResult::BAD_SID] = "badSid",
    [EFEMPResult::BAD_PASS] = "badPassword",
    [EFEMPResult::BAD_LOGIN] = "badLogin",
    [EFEMPResult::LOGIN_EXISTS] = "loginExists",
    [EFEMPResult::INVALID_CREDENTIALS] = "invalidCredentials",
    [EFEMPResult::BAD_ID] = "badId",
    [EFEMPResult::INVALID_REQUEST] = "invalidRequest",
};

// TODO: separate module
// TODO: proper class name
class GameServer : public QObject
{
    Q_OBJECT

public:
    GameServer();
    virtual ~GameServer();

public slots:
    void handleFEMPRequest(const QVariantMap& request, QVariantMap& response);

private:
    typedef void (GameServer::*HandlerType)(const QVariantMap& request, QVariantMap& response);
    QMap<QString, HandlerType> requestHandlers_;

    void HandleRegister(const QVariantMap& request, QVariantMap& response);
    void HandleLogin(const QVariantMap& request, QVariantMap& response);
    void HandleLogout(const QVariantMap& request, QVariantMap& response);
    void HandleClearDB(const QVariantMap& request, QVariantMap& response);

    void WriteResult_(QVariantMap& response, const EFEMPResult result);

    static const int minPrasswordLength_ = 6;
    static const int maxPrasswordLength_ = 36;
    static const int minLoginLength_ = 2;
    static const int maxLoginLength_ = 36;

    QMap<QString, QString> db;
    QMap<QByteArray, QString> sids;
};
