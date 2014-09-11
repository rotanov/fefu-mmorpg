#include "Projectile.hpp"

Projectile::Projectile()
{
  type_ = "projectile";
}

Projectile::~Projectile()
{

}

void Projectile::OnCollideWorld()
{

}

bool Projectile::OnCollideActor(Actor* actor)
{
  if (actor->GetType () == "monster" || actor->GetType () == "player")
  {
    Creature * a = static_cast<Creature*>(actor);
    a->SetHealth (a->GetHealth () - blow_);
  }
  return false;
}

void Projectile::Update(float dt)
{
  if (position_.x < point_attack_.x )
     SetDirection (EActorDirection::EAST);
  if (position_.x > point_attack_.x )
     SetDirection (EActorDirection::WEST);
  if (position_.y < point_attack_.y )
     SetDirection (EActorDirection::NORTH);
  if (position_.y > point_attack_.y )
    SetDirection (EActorDirection::SOUTH);
  SetVelocity (directionToVector[static_cast<unsigned>(GetDirection())]);
  position_ +=  velocity_*dt;
}

void Projectile::SetPoint(Vector2 p)
{
  point_attack_ = p;
}
