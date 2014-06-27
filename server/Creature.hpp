#pragma once

#include <vector>
#include <QVariantMap>

#include "Actor.hpp"

class Item;

typedef struct Demage {
  int from;
  int to;
} Demage;

typedef struct Blow {
  QString attack;
  QString effect;
  Demage damage;
} Blow;

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
  float health_ = 100.0f;
  float maxHealth_ = 100.0f;

  // represents creature's inventory
  std::vector<Item*> items_;
};
