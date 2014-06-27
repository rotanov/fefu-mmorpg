#pragma once

#include "Creature.hpp"

#include <QVector>
#include <QString>
#include <QMap>
#include <QStringList>
enum class Flag
{
      CAN_BLOW,
      CAN_MOVE,
      PASS_WALL,
      HATE_ORCS,
      HATE_EVILS,
      HATE_TROLLS,
      HATE_GIANTS,
      HATE_DEMONS,
      HATE_METALS,
      HATE_PLAYERS,
      HATE_DRAGONS,
      HATE_UNDEADS,
      HATE_ANIMALS,
};

enum class Race {
    ORCS,
    EVILS,
    TROLLS,
    GIANTS,
    DEMONS,
    METALS,
    PLAYERS,
    DRAGONS,
    UNDEADS,
    ANIMALS,
};

typedef struct Demage {
  int from;
  int to;
} Demage;

typedef struct Blow {
  QString attack;
  QString effect;
  Demage damage;
} Blow;

const std::vector<QString> Races =
{
  [Race::ORCS] = "ORC",
  [Race::EVILS] = "EVIL",
  [Race::TROLLS] = "TROLL",
  [Race::GIANTS] = "GIGANT",
  [Race::DEMONS] = "DEMON",
  [Race::METALS] = "METAL",
  [Race::PLAYERS] = "PLAYER",
  [Race::DRAGONS] = "DRAGON",
  [Race::UNDEADS] = "UNDEAD",
  [Race::ANIMALS] = "ANIMAL",
};

class Monster : public Creature
{
public:
  Monster();
  virtual ~Monster();
  virtual void OnCollideWorld();
  virtual bool OnCollideActor(Actor* actor);
  virtual void Update(float dt);
  virtual void atack(Creature* actor);
  virtual void SetRace();
  QString GetName();
  QString name;
  QString description;
  QString symbol;
  QStringList Flags;
  QVector <Blow*> Blows;
private:
    QString race_;
    QMap<QString,QString> Hates =
    {
      {"HATE_ORC","ORC"},
      {"HATE_EVIL","EVIL"},
      {"HATE_TROLL","TROLL"},
      {"HATE_GIGANT", "GIGANT"},
      {"HATE_DEMON", "DEMON"},
      {"HATE_METAL", "METAL"},
      {"HATE_PLAYER", "PLAYER"},
      {"HATE_DRAGON", "DRAGON"},
      {"HATE_UNDEAD", "UNDEAD"},
      {"HATE_ANIMAL", "ANIMAL"}
    };
};
