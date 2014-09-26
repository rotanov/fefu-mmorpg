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
enum Class
{
  warrior,
  rouge,
  mage
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
  void SetExperience(int exp);
  int GetExperience();

  void SetClass(QString clas);
  QString GetClass();

  void SetLevel(int lev);
  int GetLevel();

  void SetDamage(QString str, bool b);
  void AddStat();
  void UpdateStat();

  bool GetItemId (int id);

  int GetTotalWeigh();

  bool DropItemFromSlot(int);

  virtual void SetRace();

  virtual QVariantMap atack(Creature* actor, int id);

private:
  QString login_;
  unsigned clientTick_ = 0;
  QMap<Slot, Item*> slots_;
  int experience_ = 0;
  int level_ = 1;
  Class class_;
};
