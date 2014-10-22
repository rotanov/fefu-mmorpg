#pragma once

#include <vector>
#include <QVariantMap>
#include <QMap>

#include "Actor.hpp"
#include "Item.hpp"

class Item;

struct Blow {
  QString attack;
  QString effect;
  Damage* damage;
};


class Creature : public Actor
{
public:
  Creature();
  virtual ~Creature();

  float GetHealth() const;
  void SetHealth(const float health);

  float GetSpeed() const;
  void SetSpeed(const float health);

  float GetMaxHealth() const;
  void SetMaxHealth(const float maxHealth);

  float GetStatValue(EStatConst key) const;
  void SetStat(bool flag, Item* item);
  void SetStat(EStatConst key, float value);

  float GetCarryingSapacity();

  virtual QVariantMap atack(Creature* actor);
  virtual void SetRace();
  virtual QString GetRace();

  QString race_ = "NONE";

private:
  QMap <EStatConst, float> Stat =
  {
    {EStatConst::STRENGTH, 10},
    {EStatConst::INTELLIGENCE, 10},
    {EStatConst::DEXTERITY, 10},
    {EStatConst::SPEED, 0.2},
    {EStatConst::DEFENSE, 10},
    {EStatConst::MAGIC_RESISTANCE, 5},
    {EStatConst::CAPACITY, 5},
    {EStatConst::HP, 100},
    {EStatConst::MAX_HP, 100},
    {EStatConst::MP, 500},
    {EStatConst::MAX_MP, 500},
  };
};
