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
  virtual bool Update(float);
  void SetPoint(Vector2 p);
  void SetPlayer(Player* p);
  void GetCoord();
  Player* GetPlayer();
  Vector2 GetPoint();
  bool death;
private:
  Vector2 point_attack_ = Const::Math::V2_ZERO;
  float blow_ = 10.0f;
  Player* player_;
  float speed_ = 0.5;
  float radius_ = 1.5;
  bool signx_;
  bool signy_;
  int signxx_ = 0;
  int signyy_ = 0;
};
