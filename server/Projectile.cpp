#include "Projectile.hpp"

Projectile::Projectile()
{
  type_ = PROJECTILE;
  death = false;
}

Projectile::~Projectile()
{

}

void Projectile::OnCollideWorld()
{

}

bool Projectile::OnCollideActor(Actor* actor)
{
  if ((actor->GetType() == MONSTER || actor->GetType() == PLAYER)
      && actor != player_)
  {
    Creature* a = static_cast<Creature*>(actor);
    a->SetHealth(a->GetHealth() - blow_);
  }
  return false;
}

void Projectile::SetPlayer(Player* p)
{
  player_ = p;
}

Player* Projectile::GetPlayer()
{
  return player_;
}

void Projectile::Update(float dt)
{
  if (dt != 1)
    dt = speed_;
  if (abs(position_.x - point_attack_.x) < dt)
  {
    position_.x = point_attack_.x;
    SetDirection(EActorDirection::NONE);
  }
  if (abs(position_.y - point_attack_.y) < dt)
  {
    position_.y = point_attack_.y;
    SetDirection(EActorDirection::NONE);
  }
  if (position_.x < point_attack_.x)
  {
    SetDirection(EActorDirection::WEST);
  }
  else if (position_.x > point_attack_.x)
  {
    SetDirection(EActorDirection::EAST);
  }
  if (position_.x != point_attack_.x)
  {
    SetVelocity(directionToVector[static_cast<unsigned>(GetDirection())]);
    position_ +=  velocity_*dt;
  }
  if (position_.y < point_attack_.y)
  {
    SetDirection(EActorDirection::NORTH);
  }
  else if (position_.y > point_attack_.y)
  {
    SetDirection(EActorDirection::SOUTH);
  }
  if (position_.y != point_attack_.y)
  {
    SetVelocity(directionToVector[static_cast<unsigned>(GetDirection())]);
    position_ +=  velocity_*dt;
  }
}

void Projectile::SetPoint(Vector2 p)
{
  point_attack_ = p;
}

Vector2 Projectile::GetPoint()
{
  return point_attack_;
}
