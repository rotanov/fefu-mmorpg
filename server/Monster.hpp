#pragma once

#include "Creature.hpp"

#include <QVector>
#include <QString>
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

class Monster : public Creature
{
public:
    Monster();
    virtual ~Monster();

    virtual void OnCollideWorld();
    virtual void OnCollideActor(Actor* actor);
    virtual void Update(float dt);
    QString GetName();
    QString name;
    QString description;
    QString symbol;
    QStringList Flags;
    QStringList Slot;
private:
    QString race_;
};
