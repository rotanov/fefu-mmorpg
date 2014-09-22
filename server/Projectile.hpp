#pragma once

#include "Creature.hpp"
#include "Player.hpp"

class Projectile : public Actor
{
public:
  Projectile();
  virtual ~Projectile();

  virtual void OnCollideWorld();
  virtual bool OnCollideActor(Actor* actor);
  virtual void Update(float dt);
  void SetPoint(Vector2 p);
  void SetPlayer(Player* p);
  Player* GetPlayer();
  Vector2 GetPoint();
  bool death;
private:
  Vector2 point_attack_ = Const::Math::V2_ZERO;
  float blow_ = 10.0f;
  Player* player_;
  float speed_ = 0.35;
  float radius_ = 1.5;
};
