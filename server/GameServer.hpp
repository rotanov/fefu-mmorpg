#pragma once

#include <unordered_set>

#include <QObject>
#include <QMap>
#include <QVariantMap>
#include <QTimer>
#include <QTime>

#include "LevelMap.hpp"
#include "PermaStorage.hpp"
#include "Player.hpp"
#include "Monster.hpp"

enum class EFEMPResult
{
    OK,
    BAD_SID,
    BAD_PASS,
    BAD_LOGIN,
    LOGIN_EXISTS,
    INVALID_CREDENTIALS,
    BAD_ID,
    BAD_ACTION,
    BAD_MAP,
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
    [EFEMPResult::BAD_ACTION] = "badAction",
    [EFEMPResult::BAD_MAP] = "badMap",
};

// TODO: separate module
// TODO: proper class name
class GameServer : public QObject
{
    Q_OBJECT

signals:
    void broadcastMessage(QString message);

public:
    GameServer();
    virtual ~GameServer();

    bool Start();
    void Stop();

public slots:
    void handleFEMPRequest(const QVariantMap& request, QVariantMap& response);
    void setWSAddress(QString address);
    void tick();

private:
// Request Handlers
//==============================================================================
    typedef void (GameServer::*HandlerType)(const QVariantMap& request, QVariantMap& response);
    QMap<QString, HandlerType> requestHandlers_ =
    {
        // Testing
        {"startTesting", &GameServer::HandleStartTesting_},
        {"stopTesting", &GameServer::HandleStopTesting_},
        {"setUpConst", &GameServer::HandleSetUpConstants_},
        {"setUpMap", &GameServer::HandleSetUpMap_},
        {"getConst", &GameServer::HandleGetConst_},
        // Authorization
        {"login", &GameServer::HandleLogin_},
        {"logout", &GameServer::HandleLogout_},
        {"register", &GameServer::HandleRegister_},
        // Game Interaction
        {"destroyItem", &GameServer::HandleDestroyItem_},
        {"examine", &GameServer::HandleExamine_},
        {"getDictionary", &GameServer::HandleGetDictionary_},
        {"look", &GameServer::HandleLook_},
        {"move", &GameServer::HandleMove_},
    };

    void HandleStartTesting_(const QVariantMap& request, QVariantMap& response);
    void HandleStopTesting_(const QVariantMap& request, QVariantMap& response);
    void HandleSetUpConstants_(const QVariantMap& request, QVariantMap& response);
    void HandleSetUpMap_(const QVariantMap& request, QVariantMap& response);
    void HandleGetConst_(const QVariantMap& request, QVariantMap& response);

    void HandleLogin_(const QVariantMap& request, QVariantMap& response);
    void HandleLogout_(const QVariantMap& request, QVariantMap& response);
    void HandleRegister_(const QVariantMap& request, QVariantMap& response);

    void HandleDestroyItem_(const QVariantMap& request, QVariantMap& response);
    void HandleExamine_(const QVariantMap& request, QVariantMap& response);
    void HandleGetDictionary_(const QVariantMap& request, QVariantMap& response);
    void HandleLook_(const QVariantMap& request, QVariantMap& response);
    void HandleMove_(const QVariantMap& request, QVariantMap& response);
//==============================================================================

    void WriteResult_(QVariantMap& response, const EFEMPResult result);

    void LoadLevelFromImage_(const QString filename);
    void GenMonsters_();
    Player* CreatePlayer_(const QString login);
    void SetActorPosition_(Actor* actor, const Vector2& position);

    template <typename T>
    T* CreateActor_();

    template <typename T>
    void KillActor_(T*& actor);

    int lastId_ = 1;

    std::vector<Actor*> actors_;
    std::unordered_map<int, Actor*> idToActor_;
    QMap<QByteArray, Player*> sidToPlayer_;

    LevelMap levelMap_;

    QString wsAddress_;

    PermaStorage storage_;

    QTimer* timer_ = NULL;
    QTime time_;
    float lastTime_ = 0.0f;
    unsigned tick_ = 0;

    float playerVelocity_ = 4.0;
    float slideThreshold_ = 0.1;
    int ticksPerSecond_ = 60;
    int screenRowCount_ = 7;
    int screenColumnCount_ = 9;
    float epsilon_ = 0.00001;
    float pickUpRadius_ = 1.5f;

    bool testingStageActive_ = false;

    const std::unordered_set<std::string> sidCheckExcpetions_ =
    {
        "register",
        "login",
        "startTesting",
        "stopTesting",
        "setUpConst",
        "setUpMap",
        "getConst",
    };
};

template <typename T>
T* GameServer::CreateActor_()
{
    T* actor = new T();
    actor->SetId(lastId_);
    lastId_++;
    idToActor_[actor->GetId()] = actor;
    levelMap_.IndexActor(actor);
    actors_.push_back(actor);
    return actor;
}

template <typename T>
void GameServer::KillActor_(T*& actor)
{
    idToActor_.erase(actor->GetId());
    levelMap_.RemoveActor(actor);
    actors_.erase(std::remove(actors_.begin(), actors_.end(), actor), actors_.end());
    delete actor;
    actor = NULL;
}
