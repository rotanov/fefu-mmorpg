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
  BAD_SLOT,
  BAD_PLACING,
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
  [EFEMPResult::BAD_SLOT] = "badSlot",
  [EFEMPResult::BAD_PLACING] = "badPlacing",
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
    {"putItem", &GameServer::HandlePutItem_},
    {"putMob", &GameServer::HandlePutMob_},
    {"putPlayer", &GameServer::HandlePutPlayer_},
    {"setLocation", &GameServer::HandleSetLocation_},
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
    {"attack", &GameServer::HandleAttack_},
    {"pickUp", &GameServer::HandlePickUp_}, //взять
    {"unequip", &GameServer::HandleUnequip_}, // снять
    {"use", &GameServer::HandleUse_},// использовать
    {"drop", &GameServer::HandleDrop_},// положить
    {"equip", &GameServer::HandleEquip_},// одеть
    {"enforce", &GameServer::HandleEnforce_},
  };

  void HandleStartTesting_(const QVariantMap& request, QVariantMap& response);
  void HandleStopTesting_(const QVariantMap& request, QVariantMap& response);
  void HandleSetUpConstants_(const QVariantMap& request, QVariantMap& response);
  void HandleSetUpMap_(const QVariantMap& request, QVariantMap& response);
  void HandleGetConst_(const QVariantMap& request, QVariantMap& response);
  void HandlePutItem_(const QVariantMap& request, QVariantMap& response);
  void HandlePutMob_(const QVariantMap& request, QVariantMap& response);
  void HandlePutPlayer_(const QVariantMap& request, QVariantMap& response);
  void HandleEnforce_(const QVariantMap& request, QVariantMap& response);
  void HandleSetLocation_(const QVariantMap& request, QVariantMap& response);

  void HandleLogin_(const QVariantMap& request, QVariantMap& response);
  void HandleLogout_(const QVariantMap& request, QVariantMap& response);
  void HandleRegister_(const QVariantMap& request, QVariantMap& response);

  void HandleDestroyItem_(const QVariantMap& request, QVariantMap& response);
  void HandleExamine_(const QVariantMap& request, QVariantMap& response);
  void HandleGetDictionary_(const QVariantMap& request, QVariantMap& response);
  void HandleLook_(const QVariantMap& request, QVariantMap& response);
  void HandleMove_(const QVariantMap& request, QVariantMap& response);
  void HandleAttack_(const QVariantMap& request, QVariantMap& response);
  void HandlePickUp_(const QVariantMap& request, QVariantMap& response);
  void HandleUnequip_(const QVariantMap& request, QVariantMap& response);
  void HandleUse_(const QVariantMap& request, QVariantMap& response);
  void HandleDrop_(const QVariantMap& request, QVariantMap& response);
  void HandleEquip_(const QVariantMap& request, QVariantMap& response);
//==============================================================================

  void WriteResult_(QVariantMap& response, const EFEMPResult result);

  void LoadLevelFromImage_(const QString filename);
  void GenMonsters_();
  void GetItems(Creature* actor);
  Player* CreatePlayer_(const QString login);
  void SetActorPosition_(Actor* actor, const Vector2& position);
  void SetItemDescription (const QVariantMap &request, Item* item);
  bool IsCorrectPosition(float x, float y, Actor *actor);
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
  QVariantList events_;
  float playerVelocity_ = 2.2;
  float slideThreshold_ = 0.1;
  int ticksPerSecond_ = 30;
  int screenRowCount_ = 7;
  int screenColumnCount_ = 9;
  float epsilon_ = 0.00001;
  float pickUpRadius_ = 1.5f;

  bool testingStageActive_ = false;

  const std::unordered_set<std::string> sidCheckExceptions_ =
  {
    "register",
    "login",
  };
  QMap <QString, Slot> SlotToString =
  {
    {"ammo", ammo},
    {"body", body},
    {"feet", feet},
    {"forearm", forearm},
    {"head" ,head},
    {"left-finger", left_finger},
    {"left-hand", left_hand},
    {"neck", neck},
    {"right-finger", right_finger},
    {"right-hand", right_hand}
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
