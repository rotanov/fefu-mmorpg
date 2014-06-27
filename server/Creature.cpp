#include "Creature.hpp"

Creature::Creature()
{

}

Creature::~Creature()
{

}

float Creature::GetHealth() const
{
  return health_;
}
void Creature::SetHealth(const float health)
{
  health_ = health;
}

float Creature::GetMaxHealth() const
{
  return maxHealth_;
}

void Creature::SetMaxHealth(const float maxHealth)
{
  maxHealth_ = maxHealth;
}

void Creature::SetRace()
{

}
void Creature::atack(Creature */* actor*/)
{

}
