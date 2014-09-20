#pragma once

#include "Creature.hpp"

#include <QVector>
#include <QString>
#include <QMap>
#include <QStringList>


class Projectile : public Actor
{
public:
  Projectile();
  virtual ~Projectile();

  virtual void OnCollideWorld();
  virtual bool OnCollideActor(Actor* actor);
  virtual void Update(float dt);

  QString GetName();
  void SetPoint(Vector2 p);

private:
  Vector2 point_attack_ = Const::Math::V2_ZERO;
  float blow_ = 10.0f;
};
