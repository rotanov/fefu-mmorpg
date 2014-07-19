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

void Creature::SetSpeed(const float speed)
{
  Stat[SPEED] = speed;
}

float Creature::GetSpeed() const
{
  return Stat[SPEED];
}

float Creature::GetStatValue(Stat_const key) const
{
  return Stat[key];
}

void Creature::SetRace()
{

}

void Creature::SetStat(bool flag, Item* item)
{
  for (auto i = item->bonuses.begin(); i != item->bonuses.end(); i++)
  {
    auto v = *i;
    if (flag)
    {
      if (v["effectCalculation"] == "const")
        Stat[i.key()] += v["value"].toFloat();
    }
    else
    {
      if (v["effectCalculation"] == "const")
        Stat[i.key()] -= v["value"].toFloat();
    }
  }
}

QVariantMap Creature::atack(Creature* /*actor*/)
{
  QVariantMap ans;
  ans["ok"]= "ok";
  return ans;
}
