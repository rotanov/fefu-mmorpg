#include "GameServer.hpp"

#include <QRegExp>
#include <QJsonDocument>
#include <QCryptographicHash>
#include <QTime>
#include <QVariant>
#include <QDebug>
#include <QImage>
#include <QPixmap>
#include <QFile>

#include "PermaStorage.hpp"
#include "utils.hpp"

//==============================================================================
GameServer::GameServer()
  : levelMap_(64,64)
{
  QTime midnight(0, 0, 0);
  qsrand(midnight.secsTo(QTime::currentTime()));

  timer_ = new QTimer(this);
  connect(timer_
          , &QTimer::timeout
          , this
          , &GameServer::tick);
  timer_->setInterval(1000.0f / static_cast<float>(ticksPerSecond_));

  GenRandSmoothMap(levelMap_);
  levelMap_.ExportToImage("generated-level-map.png");
  LoadLevelFromImage_("generated-level-map.png");
}

//==============================================================================
GameServer::~GameServer()
{
  for (auto actor : actors_)
  {
    delete actor;
  }
}

//==============================================================================
bool GameServer::Start()
{
  if (storage_.Connect())
  {
    storage_.InitSchema();
    timer_->start();
    time_.start();
    lastTime_ = time_.elapsed();
    GenMonsters_();
    return true;
  }
  return false;
}

//==============================================================================
void GameServer::Stop()
{
  storage_.Reset();
  storage_.Disconnect();
  timer_->stop();
}

//==============================================================================
void GameServer::handleFEMPRequest(const QVariantMap& request, QVariantMap& response)
{
  response["action"] = request["action"];

  auto actionIt = request.find("action");
  if (actionIt == request.end())
  {
    WriteResult_(response, EFEMPResult::BAD_ACTION);
    return;
  }

  QString action = actionIt.value().toString();
  //qDebug() << "FEMP action: " << action;
  auto handlerIt = requestHandlers_.find(action);

  if (handlerIt == requestHandlers_.end())
  {
    WriteResult_(response, EFEMPResult::BAD_ACTION);
    return;
  }

  // TODO: extract into unordered_map
  if (sidCheckExceptions_.count(action.toStdString()) == 0)
  {
    if (request.find("sid") == request.end()
        || sidToPlayer_.find(request["sid"].toByteArray()) == sidToPlayer_.end())
    {
      WriteResult_(response, EFEMPResult::BAD_SID);
      return;
    }
  }

  auto handler = handlerIt.value();
  (this->*handler)(request, response);

  if (response.find("result") == response.end())
  {
    WriteResult_(response, EFEMPResult::OK);
  }
}

//==============================================================================
void GameServer::HandleRegister_(const QVariantMap& request, QVariantMap& response)
{
  QString login = request["login"].toString();
  QString password = request["password"].toString();

  bool passHasInvalidChars = false;

  for (int i = 0; i < password.size(); i++)
  {
    if (!password[i].isPrint())
    {
      passHasInvalidChars = true;
      break;
    }
  }

  if (storage_.IfLoginPresent(login))
  {
    WriteResult_(response, EFEMPResult::LOGIN_EXISTS);
  }
  else if (!QRegExp("[0-9a-zA-Z]{2,36}").exactMatch(login))
  {
    WriteResult_(response, EFEMPResult::BAD_LOGIN);
  }
  else if (!QRegExp(".{6,36}").exactMatch(password)
           || passHasInvalidChars)
  {
    WriteResult_(response, EFEMPResult::BAD_PASS);
  }
  else
  {
    QByteArray salt = QString::number(qrand()).toLatin1();
    QByteArray passwordWithSalt = password.toUtf8();
    passwordWithSalt.append(salt);
    QByteArray hash = QCryptographicHash::hash(passwordWithSalt, QCryptographicHash::Sha3_256);
    storage_.AddUser(login, QString(hash.toBase64()), QString(salt.toBase64()));
  }
}

//==============================================================================
void GameServer::HandleDestroyItem_(const QVariantMap& request, QVariantMap& response)
{
#define BAD_ID(COND)\
  if (COND)\
  {\
    WriteResult_(response, EFEMPResult::BAD_ID);\
    return;\
  }\

  BAD_ID(request.find("id") == request.end());
  BAD_ID(!request["id"].toInt());

  int id = request["id"].toInt();
  Player* p = sidToPlayer_[request["sid"].toByteArray()];
  BAD_ID((idToActor_.find(id) == idToActor_.end()) && !p->GetItemId(id));

  if (p->GetItemId(id))
  {//destroy item from inventory
    for (auto& item: p->items_)
    {
      if (item->GetId() == id)
      {
        p->items_.erase(std::remove(p->items_.begin(), p->items_.end(), item), p->items_.end());
        break;
      }
    }
  }
  else
  {//item is on the ground
    Item* item = static_cast<Item*>(idToActor_[id]);
    BAD_ID(!item);
    Vector2 player_pos = p->GetPosition();
    Vector2 item_pos = item->GetPosition();
    float distance = sqrt((player_pos.x - item_pos.x)*(player_pos.x - item_pos.x) +
                          (player_pos.y - item_pos.y)*(player_pos.y - item_pos.y));
    BAD_ID(distance > pickUpRadius_)
    KillActor_(item);
  }

  // TODO: implement
#undef BAD_ID
}

//==============================================================================
void GameServer::setWSAddress(QString address)
{
  wsAddress_ = address;
}

//==============================================================================
void GameServer::tick()
{
  lastTime_ = time_.elapsed();
  if (actors_.size() < 100 && !testingStageActive_)
    GenMonsters_();
  auto collideWithGrid = [=](Actor* actor)
  {
    auto& p = *actor;
    int col = 0;
    for (int i = 0; i < 4; i++)
    {
      float x = p.GetPosition().x;
      float y = p.GetPosition().y;
      EActorDirection dir = actor->GetDirection();
      bool collided = false;

      if (dir == EActorDirection::EAST && levelMap_.GetCell(x + 0.5f, y) == '#')
      {
        // p.SetPosition(Vector2(round(x + 0.5f) - 0.5f, p.GetPosition().y));
        collided = true;
        col++;
      }

      if (dir == EActorDirection::WEST && levelMap_.GetCell(x - 0.6f, y) == '#')
      {
        // p.SetPosition(Vector2(round(x - 0.6f) + 0.5f, p.GetPosition().y));
        collided = true;
        col++;
      }

      if (dir == EActorDirection::SOUTH && levelMap_.GetCell(x, y + 0.5f) == '#')
      {
        // p.SetPosition(Vector2(p.GetPosition().x, round(y + 0.5f) - 0.5f));
        collided = true;
        col++;
      }

      if (dir == EActorDirection::NORTH &&  levelMap_.GetCell(x, y - 0.6f) == '#')
      {
        // p.SetPosition(Vector2(p.GetPosition().x, round(y - 0.6f) + 0.5f));
        collided = true;
        col++;
      }

      if (collided)
      {
        actor->OnCollideWorld();
      }
    }
    if (col > 3)
      p.SetDirection(EActorDirection::NONE);
  };
  for (Actor* actor: actors_)
  {
   /* for (Actor* a: actors_)
    {
      if (actor == a || a->GetType() == "item")
      {
        break;
      }
      Monster * m = static_cast<Monster*>(actor);
      if (m->GetType() == "monster" && (!m->target || m->target->GetHealth() <= 20))
      {
        m->target = 0;
        Box box0(m->GetPosition(), 12.0f, 12.0f);
        Box box1(a->GetPosition(), 5.0f, 5.0f);
        if (box0.Intersect(box1) && m->OnCollideActor(a))
        {
          if (static_cast<Creature*>(a))
          {
            //m->target = static_cast<Creature*>(a);
          }
        }
      }
      if (m->GetType() == "monster" && m->target && m->target->GetHealth() > 0)
      {
        Vector2 player = m->GetPosition();
        Vector2 targets = m->target->GetPosition();
        Vector2 vec = Vector2((player.x - targets.x), (player.y - targets.y));
        if (sqrt(vec.x*vec.x + vec.y*vec.y) <= pickUpRadius_)
        {
          if (m->target->GetHealth() > 20 && m->GetHealth () > 0)
          {
            events_ << m->atack(m->target);
            break;
          }
        }
         else
        {
          if (m->GetPosition().x < a->GetPosition().x)
            m->SetDirection(EActorDirection::WEST);
          else if (m->GetPosition().x > a->GetPosition().x)
            m->SetDirection(EActorDirection::EAST);
          else if (m->GetPosition().y > a->GetPosition().y)
            m->SetDirection(EActorDirection::SOUTH);
          else if (m->GetPosition().y < a->GetPosition().y)
            m->SetDirection(EActorDirection::NORTH);
        }
      }
    }*/
    collideWithGrid(actor);
    auto v = directionToVector[static_cast<unsigned>(actor->GetDirection())];

    actor->SetVelocity(v);
    levelMap_.RemoveActor(actor);
    actor->Update(static_cast<Creature*>(actor)->GetSpeed());
    if (actor->GetType() == "player" )
    {
      Creature* a  = static_cast<Creature*>(actor);
      if (a->GetHealth() < a->GetMaxHealth())
      {
        a->SetHealth(a->GetHealth() + 1);
      }
    }
    levelMap_.IndexActor(actor);
  }
  QVariantMap tickMessage;
  tickMessage["tick"] = tick_;
  tickMessage["events"] = events_;
  events_.clear();
  emit broadcastMessage(QString(QJsonDocument::fromVariant(tickMessage).toJson()));
  tick_++;
}

//==============================================================================
void GameServer::HandleSetUpConstants_(const QVariantMap& request, QVariantMap& response)
{
  if (!testingStageActive_
      || !request["playerVelocity"].toFloat()
      || !request["slideThreshold"].toFloat()
      || !request["ticksPerSecond"].toInt()
      || !request["screenRowCount"].toInt()
      || !request["screenColumnCount"].toInt()
      || !request["pickUpRadius"].toFloat()) {
    WriteResult_(response, EFEMPResult::BAD_ACTION);
    return;
  }

  playerVelocity_ = request["playerVelocity"].toFloat();
  slideThreshold_ = request["slideThreshold"].toFloat();
  ticksPerSecond_ = request["ticksPerSecond"].toInt();
  screenRowCount_ = request["screenRowCount"].toInt();
  screenColumnCount_ = request["screenColumnCount"].toInt();
  pickUpRadius_ = request["pickUpRadius"].toFloat();
}

//==============================================================================
void GameServer::HandleSetUpMap_(const QVariantMap& request, QVariantMap& response)
{
#define BAD_MAP(COND)\
  if (COND)\
  {\
    WriteResult_(response, EFEMPResult::BAD_MAP);\
    return;\
  }\

  if (!testingStageActive_)
  {
    WriteResult_(response, EFEMPResult::BAD_ACTION);
    return;
  }

  auto rows = request["map"].toList();
  int rowCount = rows.size();
  BAD_MAP(rowCount == 0);

  int columnCount = rows[0].toList().size();
  BAD_MAP(columnCount == 0);

  levelMap_.Resize(columnCount, rowCount);

  for (int i = 0; i < rowCount; i++)
  {
    auto row = rows[i].toList();
    BAD_MAP(row.size() != columnCount);

    for (int j = 0; j < columnCount; j++)
    {
      int value = row[j].toByteArray()[0];
      BAD_MAP(value != '#' && value != '.');
      levelMap_.SetCell(j, i, value);
    }
  }
  actors_.clear();
#undef BAD_MAP
}

//==============================================================================
void GameServer::HandleGetConst_(const QVariantMap& request, QVariantMap& response)
{
  Q_UNUSED(request);

  response["playerVelocity"] = playerVelocity_;
  response["slideThreshold"] = slideThreshold_;
  response["ticksPerSecond"] = ticksPerSecond_;
  response["screenRowCount"] = screenRowCount_;
  response["screenColumnCount"] = screenColumnCount_;
  response["pickUpRadius"] = pickUpRadius_;
}

//==============================================================================
void GameServer::HandleLogin_(const QVariantMap& request, QVariantMap& response)
{
  auto login = request["login"].toString();
  auto password = request["password"].toString();
  // qDebug() << login;
  if (!storage_.IfLoginPresent(login))
  {
    WriteResult_(response, EFEMPResult::INVALID_CREDENTIALS);
    return;
  }

  QByteArray salt = QByteArray::fromBase64(storage_.GetSalt(login).toLatin1());
  QByteArray refPassHash = QByteArray::fromBase64(storage_.GetPassHash(login).toLatin1());

  QByteArray passwordWithSalt = password.toUtf8();
  passwordWithSalt.append(salt);
  QByteArray passHash = QCryptographicHash::hash(passwordWithSalt, QCryptographicHash::Sha3_256);

  if (passHash != refPassHash)
  {
    WriteResult_(response, EFEMPResult::INVALID_CREDENTIALS);
    return;
  }

  QByteArray sid;

  do
  {
    QByteArray id = QString::number(qrand()).toLatin1();
    sid = QCryptographicHash::hash(id, QCryptographicHash::Sha1);
  } while (sidToPlayer_.find(sid) != sidToPlayer_.end());

  sid = sid.toHex();

  Player* player = CreatePlayer_(login);
  sidToPlayer_.insert(sid, player);
  response["sid"] = sid;
  response["webSocket"] = wsAddress_;
  response["fistId"] = FistId_;
  response["id"] = player->GetId();
}

//==============================================================================
void GameServer::HandleLogout_(const QVariantMap& request, QVariantMap& response)
{
  Q_UNUSED(response);

  auto sid = request["sid"].toByteArray();
  auto it = sidToPlayer_.find(sid);
  Player* p = it.value();
  qDebug() << "Logging out, login: " << p->GetLogin();
  sidToPlayer_.erase(it);
  KillActor_(p);
}

//==============================================================================
void GameServer::HandleStartTesting_(const QVariantMap& request, QVariantMap& response)
{
  Q_UNUSED(request);

  if (testingStageActive_)
  {
    WriteResult_(response, EFEMPResult::BAD_ACTION);
    return;
  }

  testingStageActive_ = true;
  storage_.Reset();
}

//==============================================================================
void GameServer::HandleStopTesting_(const QVariantMap& request, QVariantMap& response)
{
  Q_UNUSED(request);

  if (!testingStageActive_)
  {
    WriteResult_(response, EFEMPResult::BAD_ACTION);
    return;
  }

  testingStageActive_ = false;
}

//==============================================================================
void GameServer::HandleGetDictionary_(const QVariantMap& request, QVariantMap& response)
{
  Q_UNUSED(request);

  QVariantMap dictionary;
  dictionary["#"] = "wall";
  dictionary["."] = "grass";
  response["dictionary"] = dictionary;
}

//==============================================================================
void GameServer::HandleMove_(const QVariantMap& request, QVariantMap& response)
{
  Q_UNUSED(response);

  auto sid = request["sid"].toByteArray();
  unsigned tick = request["tick"].toUInt();
  //qDebug() << "tick diff: " << tick_ - tick;
  auto direction = request["direction"].toString();

  Player* p = sidToPlayer_[sid];
  p->SetDirection(direction);
  p->SetClientTick(tick);
}

//==============================================================================
void GameServer::HandleLook_(const QVariantMap& request, QVariantMap& response)
{
  auto sid = request["sid"].toByteArray();
  Player* p = sidToPlayer_[sid];

  QVariantList rows;

  auto pos = p->GetPosition();
  response["x"] = pos.x;
  response["y"] = pos.y;

  int x = GridRound(pos.x);
  int y = GridRound(pos.y);

  int xDelta = (screenColumnCount_ - 1) / 2;
  int yDelta = (screenRowCount_ - 1) / 2;

  int minX = x - xDelta;
  int maxX = x + xDelta;
  int minY = y - yDelta;
  int maxY = y + yDelta;

  QVariantList actors;
  std::unordered_set<Actor*> actorsInArea;

  for (int j = minY; j <= maxY; j++)
  {
    QVariantList row;
    for (int i = minX; i <= maxX; i++)
    {
      row.push_back(QString(levelMap_.GetCell(i, j)));
      auto& actorsInCell = levelMap_.GetActors(i, j);
      for (auto& a: actorsInCell)
      {
        actorsInArea.insert(a);
      }
    }
    rows.push_back(row);
  }

  for (auto& a: actorsInArea)
  {
    QVariantMap actor;
    actor["type"] = a->GetType();
    actor["x"] = a->GetPosition().x;
    actor["y"] = a->GetPosition().y;
    actor["id"] = a->GetId();

    if (actor["type"] == "monster")
    {
      auto m = static_cast<Monster*>(a);
      actor["mobType"] = m->GetName();
    }

    if (actor["type"] != "item")
    {
      auto m = static_cast<Creature*>(a);
      actor["health"] = m->GetHealth();
      actor["maxHealth"] = m->GetMaxHealth();
    }

    if (actor["type"] == "item")
    {
      actor["name"] = static_cast<Item*>(a)->Getname();
    }

    if (actor["health"] <= 0 && (actor["type"] == "monster"))
    {
      Creature* b = static_cast<Creature*>(a);
      KillActor_(b);
    }

    if (actor["type"] == "item" || actor["health"] > 0)
    {
      actors << actor;
    }
  }

  response["map"] = rows;
  response["actors"] = actors;
}

//==============================================================================
void GameServer::HandleSetLocation_(const QVariantMap& request, QVariantMap& response)
{
  Q_UNUSED(response);

  float x = request["x"].toFloat();
  float y = request["y"].toFloat();
  auto sid = request["sid"].toByteArray();
  Player* p = sidToPlayer_[sid];
  p->SetPosition(Vector2(x,y));
}

//==============================================================================
void GameServer::HandleExamine_(const QVariantMap& request, QVariantMap& response)
{
  if (!request["id"].toInt()
      || idToActor_.count(request["id"].toInt()) == 0)
  {
    WriteResult_(response, EFEMPResult::BAD_ID);
    return;
  }

  auto id = request["id"].toInt();
  Actor* actor = idToActor_[id];
  response["type"] = actor->GetType();
  if (actor->GetType() != "item")
  {
    auto m = static_cast<Creature*>(actor);
    response["health"] = m->GetHealth();
    response["maxHealth"] = m->GetMaxHealth();
  }

  if (actor->GetType() == "monster")
  {
    auto m = static_cast<Monster*>(actor);
    response["mobType"] = m->GetName();
  }

  if (actor->GetType() == "item")
  {
    auto m = static_cast<Item*>(actor);
    QVariantMap item;
    item["name"] = m->Getname();
    item["type"] = m->GetTypeItem();
    item["class"] = m->GetClass();
    item["subtype"] = m->GetSubtype();
    item["weight"] = m->GetWeight();
    response["item"] = item;
  }

  if (actor->GetType() == "player")
  {
    auto p = static_cast<Player*>(actor);
    response["login"] = p->GetLogin();

    QVariantList items;
    for (auto& a: p->items_)
    {
      QVariantMap item;
      item["id"] = a->GetId();
      item["name"] = a->Getname();
      item["type"] = a->GetTypeItem();
      item["class"] = a->GetClass();
      item["subtype"] = a->GetSubtype();
      item["weight"] = a->GetWeight();
      items << item;
    }
    response["inventory"] = items;

    QVariantMap id_slot;
    for (auto i = SlotToString.begin(); i != SlotToString.end(); i++)
    {
      Item* k = p->GetSlot(i.value());
      if (k && k->GetId() != -1)
      {
        id_slot[i.key()] = k->GetId();
      }
    }
    response["slots"] = id_slot;
  }

  response["x"] = actor->GetPosition().x;
  response["y"] = actor->GetPosition().y;
  response["id"] = actor->GetId();
}

//==============================================================================
void GameServer::HandlePickUp_(const QVariantMap& request, QVariantMap& response)
{
  auto sid = request["sid"].toByteArray();
  Player* player = sidToPlayer_[sid];

  if (!request["id"].toInt()
      || !idToActor_[request["id"].toInt()]
      || player->GetItemId(request["id"].toInt()))
  {
    WriteResult_(response, EFEMPResult::BAD_ID);
    return;
  }

  Actor* item = idToActor_[request["id"].toInt()];
  if (item->GetType() != "item")
  {
    WriteResult_(response, EFEMPResult::BAD_ID);
    return;
  }

  Vector2 player_pos = player->GetPosition();
  Vector2 item_pos = item->GetPosition();
  float distance = sqrt((player_pos.x - item_pos.x)*(player_pos.x - item_pos.x) +
                        (player_pos.y - item_pos.y)*(player_pos.y - item_pos.y));
  if (distance > pickUpRadius_)
  {
    WriteResult_(response, EFEMPResult::BAD_ID);
    return;
  }

  levelMap_.RemoveActor(item);
  actors_.erase(std::remove(actors_.begin(), actors_.end(), item), actors_.end());
  player->items_.push_back(static_cast<Item*>(item));
}

//==============================================================================
void GameServer::HandleUnequip_(const QVariantMap& request, QVariantMap& response)
{
  if (request["slot"].toString() == "")
  {
    WriteResult_(response, EFEMPResult::BAD_SLOT);
    return;
  }

  auto sid = request["sid"].toByteArray();
  Player* player = sidToPlayer_[sid];

  QString str = request["slot"].toString();
  if (SlotToString.find(str) == SlotToString.end())
  {
    WriteResult_(response, EFEMPResult::BAD_SLOT);
    return;
  }

  Slot slot = SlotToString[str];
  Item* item = player->GetSlot(slot);
  if (!item)
  {
    WriteResult_(response, EFEMPResult::BAD_ID);
    return;
  }
  player->items_.push_back(item);
  player->SetSlot(slot);
  player->SetStat(false, item);
}

//==============================================================================
void GameServer::HandleUse_(const QVariantMap& request, QVariantMap& response)
{
  auto sid = request["sid"].toByteArray();
  Player* p = sidToPlayer_[sid];

  if (!request["id"].toInt())
  {
    WriteResult_(response, EFEMPResult::BAD_ID);
    return;
  }
  int id = request["id"].toInt();

  Item* item = static_cast<Item*>(idToActor_[request["id"].toInt()]);

  if (request.find("x") == request.end() && request.find("y") == request.end())
  {
    if (item->GetSubtype() != "consumable")
    {
      WriteResult_(response, EFEMPResult::BAD_ID);
      return;
    }
    else
    {
      p->SetHealth(p->GetHealth() + item->bonus[HP]);
      WriteResult_(response, EFEMPResult::OK);
      return;
    }
  }

  if ((item != p->GetSlot(left_hand) || item != p->GetSlot(right_hand))
      && (p->GetSlot(left_hand) != 0 || p->GetSlot(right_hand)!= 0 ) && id != FistId_)
  {
    WriteResult_(response, EFEMPResult::BAD_SLOT);
    return;
  }

  if (!request["x"].toFloat() || !request["y"].toFloat())
  {
    WriteResult_(response, EFEMPResult::BAD_PLACING);
    return;
  }

  float x = request["x"].toFloat();
  float y = request["y"].toFloat();

  for (Actor* actor: actors_)
  {
    if (actor->GetType() != "monster" && actor->GetType() != "player")
    {
      continue;
    }
    Creature* target = static_cast<Creature*>(actor);
   // Box box0(actor->GetPosition(), 1f, 1f);
   // Box box1(Vector2(x, y), 1f, 1f);
    if ((p->GetId() != target->GetId()) && (target->GetHealth() > 0))
    {
      Vector2 player_pos = p->GetPosition();
      Vector2 target_pos = target->GetPosition();
      float distance = sqrt((player_pos.x - target_pos.x)*(player_pos.x - target_pos.x) +
                            (player_pos.y - target_pos.y)*(player_pos.y - target_pos.y));
      if (distance <= pickUpRadius_)
      {
        QVariantMap a = p->atack(target, id);
        events_ << a;
        a = target->atack(p);
        if (target->GetHealth() < 0)
        {
          GetItems(target);
        }
        events_ << a;
        WriteResult_(response, EFEMPResult::OK);
        return;
      }
    }
  }
}

//==============================================================================
void GameServer::HandleDrop_(const QVariantMap& request, QVariantMap& response)
{
  if (!request["id"].toInt())
  {
    WriteResult_(response, EFEMPResult::BAD_ID);
    return;
  }

  int id = request["id"].toInt();
  auto sid = request["sid"].toByteArray();
  Player* p = sidToPlayer_[sid];

  for (auto& item: p->items_)
  {
    if (item->GetId() == id)
    {
      idToActor_[item->GetId()] = item;
      actors_.push_back(item);
      item->SetPosition(p->GetPosition());
      levelMap_.IndexActor(item);
      p->items_.erase(std::remove(p->items_.begin(), p->items_.end(), item), p->items_.end());
      WriteResult_(response, EFEMPResult::OK);
      return;
    }
  }
  WriteResult_(response, EFEMPResult::BAD_ID);
}

//==============================================================================
void GameServer::HandleEquip_(const QVariantMap& request, QVariantMap& response)
{
#define BAD_ID(COND)\
  if (COND)\
  {\
    WriteResult_(response, EFEMPResult::BAD_ID);\
    return;\
  }\

  BAD_ID(request.find("id") == request.end());
  BAD_ID(!request["id"].toInt());

  QString slot = request["slot"].toString();
  if (SlotToString.find(slot) == SlotToString.end())
  {
    WriteResult_(response, EFEMPResult::BAD_SLOT);
    return;
  }

  int id = request["id"].toInt();
  auto sid = request["sid"].toByteArray();
  Player* p = sidToPlayer_[sid];

  BAD_ID((idToActor_.find(id) == idToActor_.end()) && !p->GetItemId(id));

  if (p->GetItemId(id))
  {//equip item from inventory
    for (auto& item: p->items_)
    {
      if (item->GetId() == id)
      {
        Item* i = p->GetSlot(SlotToString[slot]);
        if (i)
        {
          p->items_.push_back(i);
        }
        if (!p->SetSlot(SlotToString[slot], item))
        {
          WriteResult_(response, EFEMPResult::BAD_SLOT);
          return;
        }
        p->SetStat(true, item);
        p->items_.erase(std::remove(p->items_.begin(), p->items_.end(), item), p->items_.end());
        WriteResult_(response, EFEMPResult::OK);
        return;
      }
    }
  }
  else
  {//item is on the ground
    Item* item = static_cast<Item*>(idToActor_[id]);
    BAD_ID(!item);
    Vector2 player_pos = p->GetPosition();
    Vector2 item_pos = item->GetPosition();
    float distance = sqrt((player_pos.x - item_pos.x)*(player_pos.x - item_pos.x) +
                          (player_pos.y - item_pos.y)*(player_pos.y - item_pos.y));
    BAD_ID(distance > pickUpRadius_)
    if (!p->SetSlot(SlotToString[slot], item))
    {
      WriteResult_(response, EFEMPResult::BAD_SLOT);
      return;
    }
    p->SetStat(true, item);
    KillActor_(item);
  }
#undef BAD_ID
}

//==============================================================================
void GameServer::HandlePutItem_(const QVariantMap& request, QVariantMap& response)
{
  if (!testingStageActive_)
  {
    WriteResult_(response, EFEMPResult::BAD_ACTION);
    return;
  }

  if (!request["x"].toFloat() || !request["y"].toFloat())
  {
    WriteResult_(response, EFEMPResult::BAD_PLACING);
    return;
  }

  float x = request["x"].toFloat();
  float y = request["y"].toFloat();

  if (levelMap_.GetCell(x, y) != '.')
  {
    WriteResult_(response, EFEMPResult::BAD_PLACING);
    return;
  }

  Item* item = CreateActor_<Item>();
  SetActorPosition_(item, Vector2(x, y));
  SetItemDescription(request["item"].toMap(), item);
  response["id"] = item->GetId();
}

//==============================================================================
void GameServer::HandlePutMob_(const QVariantMap& request, QVariantMap& response)
{
  if (!testingStageActive_)
  {
    WriteResult_(response, EFEMPResult::BAD_ACTION);
    return;
  }

  if (!request["x"].toFloat() || !request["y"].toFloat())
  {
    WriteResult_(response, EFEMPResult::BAD_PLACING);
    return;
  }

  float x = request["x"].toFloat();
  float y = request["y"].toFloat();

  Monster* m = CreateActor_<Monster>();
  SetActorPosition_(m, Vector2(x, y));
  m->SetDirection(EActorDirection::SOUTH);
  if (IsIncorrectPosition(x, y, m))
  {
    KillActor_(m);
    WriteResult_(response, EFEMPResult::BAD_PLACING);
    return;
  }

  auto flag = request["flags"].toList();
  for (auto a: flag)
  {
    if (m->Flag_.lastIndexOf(a.toString()) == -1)
    {
      WriteResult_(response, EFEMPResult::BAD_FLAG);
      return;
    }
     m->Flags.push_back(a.toString());
  }

  m->SetRace(request["race"].toString());
  if(m->GetRace() == "NONE")
  {
    WriteResult_(response, EFEMPResult::BAD_RACE);
    return;
  }
  QStringList str ;
  str << request["dealtDamage"].toString().split("d");
  if (str.length() < 2 || !str[0].toInt() || !str[2].toInt() || str[1] != "d")
  {
    WriteResult_(response, EFEMPResult::BAD_DAMAGE);
    return;
  }
  response["id"] = m->GetId();
  WriteResult_(response, EFEMPResult::OK);
}

//==============================================================================
void GameServer::HandlePutPlayer_(const QVariantMap&  request, QVariantMap& response)
{
  if (!testingStageActive_)
  {
    WriteResult_(response, EFEMPResult::BAD_ACTION);
    return;
  }

  if (!request["x"].toFloat() || !request["y"].toFloat())
  {
    WriteResult_(response, EFEMPResult::BAD_PLACING);
    return;
  }

  float x = request["x"].toFloat();
  float y = request["y"].toFloat();

  Player* p = CreateActor_<Player>();
  SetActorPosition_(p, Vector2(x, y));

  if (IsIncorrectPosition(x, y, p))
  {
    KillActor_(p);
    WriteResult_(response, EFEMPResult::BAD_PLACING);
    return;
  }

  auto inventory = request["inventory"].toList();
  for (auto a: inventory)
  {
    Item* item = CreateActor_<Item>();
    SetItemDescription(a.toMap(), item);
    p->items_.push_back(item);
    actors_.erase(std::remove(actors_.begin(), actors_.end(), item), actors_.end());
  }

  QVariantList items;
  for (auto& a: p->items_)
  {
    QVariantMap item;
    item["id"] = a->GetId();
    item["name"] = a->Getname();
    item["type"] = a->GetTypeItem();
    item["class"] = a->GetClass();
    item["subtype"] = a->GetSubtype();
    item["weight"] = a->GetWeight();
    items << item;
  }
  response["inventory"] = items;

  auto slot = request["slots"].toMap();
  QVariantMap id_slot;
  for (auto i = SlotToString.begin(); i != SlotToString.end(); i++)
  {
    if (slot.find(i.key()) != slot.end())
    {
      Item* item = CreateActor_<Item>();
      SetItemDescription(slot[i.key()].toMap(), item);
      p->items_.push_back(item);
      p->SetSlot(i.value(), item);
      id_slot[i.key()] = item->GetId();
    }
  }
  response["slots"] = id_slot;
  response["id"] = p->GetId();

  QByteArray sid;
  do
  {
    QByteArray id = QString::number(qrand()).toLatin1();
    sid = QCryptographicHash::hash(id, QCryptographicHash::Sha1);
  } while (sidToPlayer_.find(sid) != sidToPlayer_.end());
  sid = sid.toHex();

  sidToPlayer_.insert(sid, p);
  response["sid"] = sid;
}

//==============================================================================
void GameServer::HandleEnforce_(const QVariantMap &request, QVariantMap &response)
{
  QVariantMap res;
  QVariantMap req;
  req = QVariantMap(request["enforcedAction"].toMap());
  handleFEMPRequest(req, res);
  response["actionResult"] = res;
  //qDebug() << req["action"].toString();
  //qDebug() << res;
  //qDebug() << response;
}


//==============================================================================
void GameServer::WriteResult_(QVariantMap& response, const EFEMPResult result)
{
  response["result"] = fempResultToString[static_cast<unsigned>(result)];
}

//==============================================================================
void GameServer::LoadLevelFromImage_(const QString filename)
{
  QFile levelImage(filename);
  if (levelImage.exists())
  {
    QImage map;
    map.load(filename, "png");
    levelMap_.Resize(map.width(), map.height());
    for (int i = 0; i < map.height(); i++)
    {
      for (int j = 0; j < map.width(); j++)
      {
        auto color = map.pixel(j, i);
        int summ = qRed(color) + qGreen(color) + qBlue(color);
        int value = summ > (255 * 3 / 2) ? '.' : '#';
        levelMap_.SetCell(j, i, value);
      }
    }
  }
}

//==============================================================================
void GameServer::GenMonsters_()
{
  int monsterCounter = 0;
  for (int i = 0; i < levelMap_.GetRowCount(); i++)
  {
    for (int j = 0; j < levelMap_.GetColumnCount(); j++)
    {
      if (levelMap_.GetCell(j, i) == '.')
      {
        monsterCounter++;
        if (monsterCounter % 10 == 0)
        {
          Monster* monster = CreateActor_<Monster>();
          Monster& m = *monster;
          SetActorPosition_(monster, Vector2(j + 0.5f, i + 0.5f));
          m.SetDirection(static_cast<EActorDirection>(rand() % 4 + 1));
          storage_.GetMonster(monster, monster->GetId() % 32 + 1);
        }
      }
    }
  }
}

//==============================================================================
Player* GameServer::CreatePlayer_(const QString login)
{
  Player* player = CreateActor_<Player>();
  Player& p = *player;
  p.SetLogin(login);

  int x = 0;
  int y = 0;
  int c = 10;
  int r = 10;

  while (true)
  {
    if (levelMap_.GetCell(c, r) == '.')
    {
      x = c;
      y = r;
      break;
    }
    c++;
    if (c >= levelMap_.GetColumnCount())
    {
      c = 0;
      r++;
      if (r >= levelMap_.GetRowCount())
      {
        break;
      }
    }
  }

  SetActorPosition_(player, Vector2(x + 0.5f, y + 0.5f));

  return player;
}

//==============================================================================
void GameServer::GetItems(Creature* actor)
{
  if (actor->GetType() == "player")
  {
    for(Item* item: static_cast<Player*>(actor)->items_)
    {
      item->SetPosition(actor->GetPosition());
      actors_.push_back(item);
    }
  } else
  {
    Item* item = CreateActor_<Item>();
    SetActorPosition_(item, actor->GetPosition());
    storage_.GetItem(item, (item->GetId() % 31) + 1);
  }
}

//==============================================================================
void GameServer::SetActorPosition_(Actor* actor, const Vector2& position)
{
  levelMap_.RemoveActor(actor);
  actor->SetPosition(position);
  levelMap_.IndexActor(actor);
}

//==============================================================================
void GameServer::SetItemDescription(const QVariantMap& request, Item* item)
{
  item->SetSubtype(request["subtype"].toString());
  item->SetClass(request["class"].toString());
  item->SetTypeItem(request["type"].toString());
  item->SetWeight(request["weight"].toInt());
  //item->bonus = request["bonus"];
}

//==============================================================================
bool GameServer::IsIncorrectPosition(float x, float y, Actor* actor)
{
  if (levelMap_.GetCell(x, y) != '.')
  {
    return true;
  }
  for (auto p: actors_)
  {
    if (p == actor || p->GetType() == "item")
    {
      continue;
    }

    Box box0(actor->GetPosition(), actor->GetSize(), actor->GetSize());
    Box box1(p->GetPosition(), p->GetSize(), p->GetSize());
    if (box0.Intersect(box1))
    {
      return true;
    }
  }
  return false;
}
