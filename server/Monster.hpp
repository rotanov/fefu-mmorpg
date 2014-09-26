#pragma once

#include "Creature.hpp"

#include <QVector>
#include <QString>
#include <QMap>
#include <QStringList>

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
  [Race::GIANTS] = "GIANT",
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
  virtual bool Update(float dt);

  virtual void SetRace();
  virtual void SetRace(QString r);
  QString GetRace();

  void SetAlertness(float al);
  float GetAlertness();

  QString GetName();

  virtual QVariantMap atack(Creature* actor);

  QString name;
  QString symbol;
  QString description;
  QVector<Item*> items;

  QStringList Flags;
  QStringList Blows;
  Creature* target = 0;

  QStringList possibleFlags =
  {
    "CAN_BLOW",
    "CAN_MOVE",
    "PASS_WALL",
    "HATE_ORC",
    "HATE_EVIL",
    "HATE_TROLL",
    "HATE_GIANT",
    "HATE_DEMON",
    "HATE_METAL",
    "HATE_PLAYER",
    "HATE_DRAGON",
    "HATE_UNDEAD",
    "HATE_ANIMAL",
  };
private:
  int damage_;
  float alertness_;
};
