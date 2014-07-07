#pragma once

#include <vector>
#include <QVariantMap>

#include "Actor.hpp"

class Item;

struct Damage {
  int count;
  int to;
};

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
  void SetMaxHealth(const float maxHealth);
  virtual QVariantMap atack(Creature* actor);
  virtual void SetRace();
  QString race_ = "NONE";
private:
  float health_ = 500.0f;
  float maxHealth_ = 500.0f;
};
