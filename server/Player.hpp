#pragma once

#include <QString>

#include "Creature.hpp"

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
  virtual void SetRace();
  Blow Blows;
private:
  QString login_;
  unsigned clientTick_ = 0;
};
