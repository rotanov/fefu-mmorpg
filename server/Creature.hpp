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
  float GetMaxHealth() const;
  void SetSpeed(const float health);
  float GetSpeed() const;
  void SetMaxHealth(const float maxHealth);
  virtual QVariantMap atack(Creature* actor);
  virtual void SetRace();
  void SetStat(bool flag, Item* item);
  QString race_ = "NONE";
 private:
   QMap <Stat_const, float> Stat =
  {
    {STRENGTH, 10},
    {INTELLIGENCE, 10},
    {DEXTERITY, 10},
    {SPEED, 0.5},
    {DEFENSE, 10},
    {MAGIC_RESISTANCE, 5},
    {CAPACITY, 5},
    {HP, 100},
    {MAX_HP, 100},
    {MP, 500},
    {MAX_MP, 500},
  };
};
