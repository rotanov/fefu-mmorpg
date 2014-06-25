#pragma once

#include "Creature.hpp"

class Monster : public Creature
{
public:
  Monster();
  virtual ~Monster();

  virtual void OnCollideWorld();
  virtual void OnCollideActor(Actor* actor);
  virtual void Update(float dt);

private:

};
