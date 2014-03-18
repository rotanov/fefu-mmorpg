#pragma once

#include <QObject>
#include <QMap>

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
    void setWSAddress(QString address);

private:
    typedef void (GameServer::*HandlerType)(const QVariantMap& request, QVariantMap& response);
    QMap<QString, HandlerType> requestHandlers_;

    void HandleClearDB(const QVariantMap& request, QVariantMap& response);
    void HandleLogin(const QVariantMap& request, QVariantMap& response);
    void HandleLogout(const QVariantMap& request, QVariantMap& response);
    void HandleRegister(const QVariantMap& request, QVariantMap& response);

    void HandleExamine(const QVariantMap& request, QVariantMap& response);
    void HandleGetDictionary(const QVariantMap& request, QVariantMap& response);
    void HandleLook(const QVariantMap& request, QVariantMap& response);
    void HandleMove(const QVariantMap& request, QVariantMap& response);

    void WriteResult_(QVariantMap& response, const EFEMPResult result);

    static const int minPrasswordLength_ = 6;
    static const int maxPrasswordLength_ = 36;
    static const int minLoginLength_ = 2;
    static const int maxLoginLength_ = 36;
    int lastId = 1;

    struct Player
    {
        float x;
        float y;
        int id;
        QString login;
    };

    std::vector<Player> players_;

    char levelMap_[512][512];
    QMap<QString, QString> loginToPass_;
    QMap<QByteArray, QString> sids_;

    QString wsAddress_;
};
