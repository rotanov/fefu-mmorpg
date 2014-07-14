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
  //    qDebug() << "FEMP action: " << action;
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
//  qDebug() << login;
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

  int id = request["id"].toInt();
  Player* p = sidToPlayer_[request["sid"].toByteArray()];

  BAD_ID(idToActor_.find(id) == idToActor_.end() && !p->GetItemId(id));

  Item* it = NULL;

  if (p->GetItemId(id))
  {
    for (auto& item: p->items_)
    {
      if (item->GetId() == id)
      {
        it = item;
        break;
      }
    }

    p->items_.erase(std::remove(p->items_.begin(), p->items_.end(), it), p->items_.end());
  }
  else if (idToActor_.find(id) != idToActor_.end())
  {
    it = static_cast<Item*>(idToActor_[id]);
    Vector2 player = p->GetPosition();
    Vector2 item = it->GetPosition();
    float distance = sqrt((player.x - item.x)*(player.x - item.x) +
                          (player.y - item.y)*(player.y - item.y));
    BAD_ID(distance > pickUpRadius_)
    KillActor_(it);
  } else
  {
      WriteResult_(response, EFEMPResult::BAD_ID);
      return;
  }

  WriteResult_(response, EFEMPResult::OK);
  return;

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
  float dt = (time_.elapsed() - lastTime_) * 0.001f;
  lastTime_ = time_.elapsed();
  if (actors_.size () < 100)
    GenMonsters_ ();
  auto collideWithGrid = [=](Actor* actor)
  {
    auto& p = *actor;

    float x = p.GetPosition().x;
    float y = p.GetPosition().y;

    bool collided = false;

    if (levelMap_.GetCell(x + 0.5f, y) == '#')
    {
      p.SetPosition(Vector2(truncf(x + 0.5f) - 0.5f, p.GetPosition().y));
      collided = true;
    }

    if (levelMap_.GetCell(x - 0.5f, y) == '#')
    {
      p.SetPosition(Vector2(round(x - 0.5f) + 0.5f, p.GetPosition().y));
      collided = true;
    }

    if (levelMap_.GetCell(x, y + 0.5f) == '#')
    {
      p.SetPosition(Vector2(p.GetPosition().x, round(y + 0.5f) - 0.5f));
      collided = true;
    }

    if (levelMap_.GetCell(x, y - 0.5f) == '#')
    {
      p.SetPosition(Vector2(p.GetPosition().x, round(y - 0.5f) + 0.5f));
      collided = true;
    }

    if (collided)
    {
      actor->OnCollideWorld();
    }
  };
  for (Actor* actor : actors_)
  {
    auto v = directionToVector[static_cast<unsigned>(actor->GetDirection())]
        * playerVelocity_;

    actor->SetVelocity(v);
    levelMap_.RemoveActor(actor);
    actor->Update(dt);
    if (actor->GetType () == "player" )
    {
      Creature* a  = static_cast<Creature*> (actor);
      if (a->GetHealth() < a->GetMaxHealth())
      {
        a->SetHealth(a->GetHealth() + 1);
      }
    }
    collideWithGrid(actor);

    auto cells = actor->GetOccupiedCells();
    for (auto p : cells)
    {
      auto neighbours = levelMap_.GetActors(p.first, p.second);
      // TODO: repetition of neighbours
      for (auto neighbour : neighbours)
      {
        if (neighbour == actor)
        {
          continue;
        }
        Box box0(actor->GetPosition(), actor->GetSize(), actor->GetSize());
        Box box1(neighbour->GetPosition(), neighbour->GetSize(), neighbour->GetSize());
        if (box0.Intersect(box1))
        {
         if (actor->OnCollideActor(neighbour))
          {
               QVariantMap a = static_cast<Creature*>(actor)->atack(static_cast<Creature*>(neighbour));
               events_ << a;
          }
          if (neighbour->OnCollideActor(actor))
          {
                QVariantMap a = static_cast<Creature*>(neighbour)->atack(static_cast<Creature*>(actor));
                events_ << a;
          }
        }
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
void GameServer::HandleAttack_(const QVariantMap& request, QVariantMap& response)
{
    for (Actor* actor : actors_)
    {
      if (actor->GetType () == "monster" || actor->GetType () == "player")
      {
        Creature* target = static_cast<Creature*>(actor);
        Box box0(actor->GetPosition(), 0.5f, 0.5f);
        auto pos = request["target"].toList();
        Box box1(Vector2(pos[0].toFloat(),pos[1].toFloat()) , 0.5f, 0.5f);
        auto sid = request["sid"].toByteArray();
        auto it = sidToPlayer_.find(sid);
        Player* p = it.value();
        if (box1.Intersect(box0) && p->GetId () != target->GetId () && target->GetHealth () > 0)
        {
          Vector2 player = p->GetPosition ();
          Vector2 targets = target->GetPosition ();
          Vector2 vec = Vector2((player.x - targets.x),(player.y - targets.y));
          if (sqrt(vec.x*vec.x + vec.y*vec.y) < pickUpRadius_)
          {
            QVariantMap a = p->atack (target);
            events_ << a;
            a = target->atack (p);
            if (target->GetHealth () < 0)
            {
              GetItems(target);
            }
            events_ << a;
            WriteResult_(response, EFEMPResult::OK);
          }
        }
      }
    }

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
  //    qDebug() << "tick diff: " << tick_ - tick;
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
      for (auto& a : actorsInCell)
      {
        actorsInArea.insert(a);
      }
    }
    rows.push_back(row);
  }
    for (auto& a : actorsInArea)
    {
        QVariantMap actor;
        actor["type"] = a->GetType();
        if (a->GetType() == "monster")
        {
            auto m = static_cast<Monster*> (a);
            actor["mobType"] = m->GetName();
        }
        if (a->GetType() != "item")
        {
            auto m = static_cast<Creature*> (a);
            actor["health"] = m->GetHealth();
            actor["maxHealth"] = m->GetMaxHealth();
        } else {
          actor["name"] = static_cast<Item*> (a)->Getname ();
        }
        actor["x"] = a->GetPosition().x;
        actor["y"] = a->GetPosition().y;
        actor["id"] = a->GetId();
        if (actor["health"] < 0 && (actor["type"] == "monster" ) )
        {
          Creature* b = static_cast<Creature*>(a);
          KillActor_(b);
        }
        if (actor["type"] == "item" || actor["health"] > 0 )
          actors << actor;
   }

  response["map"] = rows;
  response["actors"] = actors;
}

//==============================================================================
void GameServer::HandleSetLocation_(const QVariantMap& request, QVariantMap& response)
{
  float x = request["x"].toFloat();
  float y = request["y"].toFloat();
  auto sid = request["sid"].toByteArray();
  Player* p = sidToPlayer_[sid];
  p->SetPosition (Vector2(x,y));
  WriteResult_(response, EFEMPResult::OK);
}

//==============================================================================
void GameServer::HandleExamine_(const QVariantMap& request, QVariantMap& response)
{
  auto id = request["id"].toInt();

  if (idToActor_.count(id) == 0)
  {
    WriteResult_(response, EFEMPResult::BAD_ID);
    return;
  }

  Actor* actor = idToActor_[id];
  response["type"] = actor->GetType();
  if (actor->GetType() != "item")
  {
      auto m = static_cast<Creature*> (actor);
      response["health"] = m->GetHealth();
      response["maxHealth"] = m->GetMaxHealth();
  }
  if (actor->GetType() == "monster")
  {
      auto m = static_cast<Monster*> (actor);
      response["mobType"] = m->GetName();
  }

  QVariantMap item;
  if (response["type"] == "item")
  {
    auto m = static_cast<Item*>(actor);
    item["name"] = m->Getname();
    item["type"] = m->GetTypeItem();
    item["class"] = m->GetClass();
    item["subtype"] = m->GetSubtype();
    item["weight"] = m->GetWeight();
  }
  if (actor->GetType () == "player")
  {
    QVariantList id;
    auto p = static_cast<Player*>(actor);
    for (auto& a: p->items_)
    {
      id << a->GetId();
    }
    response["inventory"] = id;
    QVariantMap id_slot;
    for(QMap<QString, Slot>::const_iterator i = SlotToString.begin(); i != SlotToString.end(); i++)
    {
      Item* k = p->GetSlot(i.value());
      if (k && k->GetId ()!= -1)
      {
        id_slot[i.key()] = k->GetId ();
      }
    }
    response["slots"] = id_slot;
  }
  response["x"] = actor->GetPosition().x;
  response["y"] = actor->GetPosition().y;
  response["id"] = actor->GetId();
  response["item"] = item;
  Player* p = dynamic_cast<Player*>(actor);
  if (p != NULL)
  {
    response["login"] = p->GetLogin();
  }
}

//==============================================================================
void GameServer::HandlePickUp_(const QVariantMap& request, QVariantMap& response)
{
  auto sid = request["sid"].toByteArray();
  Player* p = sidToPlayer_[sid];
  if (!idToActor_[request["id"].toInt()] || p->GetItemId(request["id"].toInt()))
  {
    WriteResult_(response, EFEMPResult::BAD_ID);
    return;
  }

  Actor* item = idToActor_[request["id"].toInt()];
  if (item->GetType() == "item")
  {
    Vector2 player = p->GetPosition();
    Vector2 items = item->GetPosition();
    float distance = sqrt((player.x - items.x)*(player.x - items.x) +
                          (player.y - items.y)*(player.y - items.y));
    if (distance > pickUpRadius_) {
      WriteResult_(response, EFEMPResult::BAD_ID);
      return;
    }

    levelMap_.RemoveActor(item);
    actors_.erase(std::remove(actors_.begin(), actors_.end(), item), actors_.end());
    p->items_.push_back(static_cast<Item*>(item));
    WriteResult_(response, EFEMPResult::OK);
    return;
  }
}

//==============================================================================
void GameServer::HandleUnequip_(const QVariantMap& request, QVariantMap& response)
{
  auto sid = request["sid"].toByteArray();
  Player* p = sidToPlayer_[sid];
  int id = request["id"].toInt();
  QString str = request["slot"].toString();
  if (SlotToString.find(str) == SlotToString.end())
  {
    WriteResult_(response, EFEMPResult::BAD_SLOT);
    return;
  }
   Slot slot = SlotToString[str];
   Item* item = p->GetSlot(slot);
   if (item)
   {
     p->items_.push_back (item);
     p->SetSlot (slot);
     p->SetStat(false, item);
     WriteResult_(response, EFEMPResult::OK);
     return;
    }
   WriteResult_(response, EFEMPResult::BAD_ID);
}

//==============================================================================
void GameServer::HandleUse_(const QVariantMap& request, QVariantMap& response)
{
  auto sid = request["sid"].toByteArray();
  Player* p = sidToPlayer_[sid];
  int id = request["id"].toInt();
  for (Actor* actor : actors_)
  {
    if (actor->GetType () == "monster" || actor->GetType () == "player")
    {
      Creature* target = static_cast<Creature*>(actor);
      Box box0(actor->GetPosition(), 0.5f, 0.5f);
      auto pos = request["target"].toList();
      Box box1(Vector2(pos[0].toFloat(),pos[1].toFloat()) , 0.5f, 0.5f);
      auto sid = request["sid"].toByteArray();
      auto it = sidToPlayer_.find(sid);
      Player* p = it.value();
      if (box1.Intersect(box0) && p->GetId () != target->GetId () && target->GetHealth () > 0)
      {
        Vector2 player = p->GetPosition ();
        Vector2 targets = target->GetPosition ();
        Vector2 vec = Vector2((player.x - targets.x),(player.y - targets.y));
        if (sqrt(vec.x*vec.x + vec.y*vec.y) < pickUpRadius_)
        {
          QVariantMap a = p->atack (target);
          events_ << a;
          a = target->atack (p);
          if (target->GetHealth () < 0)
          {
            GetItems(target);
          }
          events_ << a;
          WriteResult_(response, EFEMPResult::OK);
        }
      }
    }
  }
  WriteResult_(response, EFEMPResult::BAD_ID);
}

//==============================================================================
void GameServer::HandleDrop_(const QVariantMap& request, QVariantMap& response)
{
  auto sid = request["sid"].toByteArray();
  Player* p = sidToPlayer_[sid];
  int id = request["id"].toInt();
  for (auto& item: p->items_)
  {
    if (item->GetId() == id)
    {
      idToActor_[item->GetId()] = item;
      actors_.push_back(item);
      item->SetPosition (p->GetPosition ());
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
  auto sid = request["sid"].toByteArray();
  Player* p = sidToPlayer_[sid];
  int id = request["id"].toInt();
  for (auto& item: p->items_)
  {
    if (item->GetId() == id)
    {
      QString slot = request["slot"].toString();
      if (SlotToString.find(slot) == SlotToString.end())
      {
        WriteResult_(response, EFEMPResult::BAD_SLOT);
        return;
      }
      Item* i = p->GetSlot(SlotToString[slot]);
      if (i )
      {
        p->items_.push_back (i);
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
   WriteResult_(response, EFEMPResult::BAD_ID);
}

//==============================================================================
void GameServer::HandlePutItem_(const QVariantMap& request, QVariantMap& response)
{
  if (!testingStageActive_)
  {
    WriteResult_(response, EFEMPResult::BAD_ACTION);
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
  SetActorPosition_(item, Vector2(x,y));
  SetItemDescription (request, item);
  response["id"] = item->GetId ();
  WriteResult_(response, EFEMPResult::OK);
}

//==============================================================================
void GameServer::HandlePutMob_(const QVariantMap& request, QVariantMap& response)
{
  if (!testingStageActive_)
  {
    WriteResult_(response, EFEMPResult::BAD_ACTION);
    return;
  }
  float x = request["x"].toFloat();
  float y = request["y"].toFloat();
  Monster* m = CreateActor_<Monster>();
  SetActorPosition_(m, Vector2(x,y));
  auto flag = request["flags"].toList();
  for (auto a: flag)
    m->Flags.push_back (a.toString());
  if (IsCorrectPosition (x, y, m))
  {
    WriteResult_(response, EFEMPResult::BAD_PLACING);
    KillActor_(m);
    return;
  }
  m->SetRace (request["race"].toString());
  m->SetDamage (request["dealtDamage"].toInt());
  response["id"] = m->GetId ();
  WriteResult_(response, EFEMPResult::OK);
  /*action: "putMob"
    x: <mob's x coordinate>
    y: <mob's y coordinate>
    stats: {<Stats*>}
    inventory : [{<Item Description*>}, ...]
    flags: [<Flags*>, ...]
    race: <Race*>
    dealtDamage: <mob's dealt damage by single attack>*/

}

//==============================================================================
void GameServer::HandlePutPlayer_(const QVariantMap&  request, QVariantMap& response)
{
  if (!testingStageActive_)
  {
    WriteResult_(response, EFEMPResult::BAD_ACTION);
    return;
  }
  if (request["y"].toString() == "." || request["y"].toString() == ".")
  {
    WriteResult_(response, EFEMPResult::BAD_PLACING);
    return;
  }
  float x = request["x"].toFloat();
  float y = request["y"].toFloat();
  Player* p = CreateActor_<Player>();
  SetActorPosition_(p, Vector2(x,y));
  auto inventory = request["inventory"].toList();
  for (auto a: inventory)
  {
    Item* item =   CreateActor_<Item>();
    SetItemDescription (a.toMap(), item);
    p->items_.push_back (item);
  }
  if (IsCorrectPosition(x, y, p))
  {
    WriteResult_(response, EFEMPResult::BAD_PLACING);
    KillActor_(p);
    return;
  }
  auto slot = request["slots"].toMap();
  QVariantMap id_slot;
  for(QMap<QString, Slot>::const_iterator i = SlotToString.begin(); i != SlotToString.end(); i++)
  {
    if (slot.find(i.key()) != slot.end())
    {
      Item* item =   CreateActor_<Item>();
      SetItemDescription (slot[i.key()].toMap(), item);
      p->items_.push_back (item);
      p->SetSlot (i.value(), item);
      id_slot[i.key()] = item->GetId ();
    }
  }
  response["slots"] = id_slot;
  response["id"] = p->GetId ();
  QVariantList id;
  for (auto& a: p->items_)
  {
    id << a->GetId();
  }
  response["inventory"] = id;
  QByteArray sid;
  do
  {
    QByteArray id = QString::number(qrand()).toLatin1();
    sid = QCryptographicHash::hash(id, QCryptographicHash::Sha1);
  } while (sidToPlayer_.find(sid) != sidToPlayer_.end());
  sid = sid.toHex();
  sidToPlayer_.insert(sid, p);
  response["sid"] = sid;
  WriteResult_(response, EFEMPResult::OK);
 /* inventory: [{<Item Description*>}, ...]
slots: {<Slot name. Slots*> : {<Item Description*>}, ...}*/
}
//==============================================================================

void GameServer::HandleEnforce_(const QVariantMap &request, QVariantMap &response)
{
  QVariantMap res;
  QVariantMap req;
  req = QVariantMap(request["enforcedAction"].toMap());
  handleFEMPRequest(req, res);
  response["actionResult"] = res;
  WriteResult_ (response, EFEMPResult::OK);
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

void GameServer::GetItems (Creature* actor)
{
  if (actor->GetType () == "player")
  {
    for(Item* item: static_cast<Player*>(actor)->items_)
    {
      item->SetPosition (actor->GetPosition ());
      actors_.push_back (item);
    }
  } else {
    Item* item = CreateActor_<Item>();
    SetActorPosition_(item, actor->GetPosition ());
    storage_.GetItem (item, (item->GetId() % 31) + 1);
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
void GameServer::SetItemDescription (const QVariantMap& request, Item* item)
{
  item->SetSubtype (request["subtype"].toString());
  item->SetClass (request["class"].toString());
  item->SetTypeItem (request["type"].toString());
  item->SetWeight (request["weight"].toInt());
  //item->bonus = request["bonus"];
}

bool GameServer::IsCorrectPosition(float x, float y, Actor* actor)
{
  if (levelMap_.GetCell(x, y) != '.')
  {
    return true;
  }
  for (auto p : actors_)
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
