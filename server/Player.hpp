#pragma once

#include <QString>
#include <QVector>

#include "Creature.hpp"
#include "Item.hpp"

enum Slot
{
  left_hand,
  right_hand,
  ammo,
  left_finger,
  right_finger,
  neck,
  body,
  head,
  forearm,
  feet,
};

class Player : public Creature
{
public:
  Blow blows;
  QVector<Item*> items_;

  Player();
  virtual ~Player();

  QString GetLogin() const;
  void SetLogin(const QString login);

  unsigned GetClientTick() const;
  void SetClientTick(const unsigned clientTick);

  Item* GetSlot(Slot st);
  bool SetSlot(Slot st, Item* item);
  bool SetSlot(Slot st);

  void SetBlows();
 // void SetBlows();
 // void SetBlows();

  void SetDamage(QString str, bool b);

  bool GetItemId (int id);

  int GetTotalWeigh();

  bool DropItemFromSlot(int);

  virtual void SetRace();

  virtual QVariantMap atack(Creature* actor, int id);

private:
  QString login_;
  unsigned clientTick_ = 0;
  QMap<Slot, Item*> slots_;
  int opt_ = 0;
};
