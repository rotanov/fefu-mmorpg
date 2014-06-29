#pragma once

#include <QString>

#include "Creature.hpp"

enum Slot
{
  left_hand,
  right_hand,
  ammo,
  left_finger,
  right_finger,
  neck_amulet,
  body_armor,
  head_helmet,
  forearm_gloves,
  feet,
};

class Player : public Creature
{
public:
  Player();
  virtual ~Player();

  QString GetLogin() const;
  void SetLogin(const QString login);
  unsigned GetClientTick() const;
  void SetClientTick(const unsigned clientTick);
  virtual QVariantMap atack(Creature* actor);
  void SetBlows();
  Item* GetSlot(Slot st);
  void SetSlot(Slot st, Item* item);
  virtual void SetRace();
  void SetDemage(QString str, bool b);
  QVariantMap Blows;
  // represents creature's inventory
  std::vector<Item*> items_;

private:
  QString login_;
  unsigned clientTick_ = 0;
  QMap<Slot, Item*> slot_;
};
