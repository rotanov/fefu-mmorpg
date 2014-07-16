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
  virtual void SetRace();
  virtual void SetRace(QString r);
  QString GetRace();
  virtual QVariantMap atack(Creature* actor);
  QString GetName();
  void SetAlertness(float al);
  float GetAlertness();
  QString name;
  QString description;
  QString symbol;
  QStringList Flags;
  QStringList Blows;
  Creature* target = 0;
private:
    int damage_;
    float alertness_;
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
