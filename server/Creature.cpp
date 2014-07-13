#include "Creature.hpp"

Creature::Creature()
{

}

Creature::~Creature()
{

}

float Creature::GetHealth() const
{
  return Stat[HP];
}
void Creature::SetHealth(const float health)
{
  Stat[HP] = health;
}

float Creature::GetMaxHealth() const
{
  return Stat[MAX_HP];
}

void Creature::SetMaxHealth(const float maxHealth)
{
  Stat[MAX_HP] = maxHealth;
}

void Creature::SetRace()
{

}
void Creature::SetStat(bool flag, Item* item)
{
  for (QMap<Stat_const, float>::const_iterator i = item->bonus.begin(); i != item->bonus.end(); i++)
  {
    if (flag)
      Stat[i.key()] += i.value ();
    else
      Stat[i.key()] -= i.value ();
  }
}

QVariantMap Creature::atack(Creature* /*actor*/)
{
  QVariantMap ans;
  ans["ok"]= "ok";
  return ans;
}
