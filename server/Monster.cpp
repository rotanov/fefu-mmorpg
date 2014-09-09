#include "Monster.hpp"


Monster::Monster()
{
  type_ = "monster";
}

Monster::~Monster()
{

}

void Monster::OnCollideWorld()
{
  if (Flags.lastIndexOf("PASS_WALL") == -1)
  {
    SetDirection(static_cast<EActorDirection>(rand() % 4 + 1));
    return;
  }
}

bool Monster::OnCollideActor(Actor* /*actor*/)
{
  OnCollideWorld();
}

void Monster::Update(float dt)
{
  if (Flags.lastIndexOf("NEVER_MOVE") == -1)
  {
    position_ += velocity_ * dt;
  }
}

QString Monster::GetName()
{
  return name;
}

QString Monster::GetRace()
{
  return race_;
}

void Monster::SetRace(QString r)
{
  for (auto& race: Races)
  {
    if (race == r)
    {
      race_ = r;
      return;
    }
  }
}

void Monster::SetRace()
{
  for (auto& r: Races)
  {
    if (Flags.lastIndexOf(r) != -1)
    {
      race_ = r;
      return;
    }
  }
}

void Monster::SetAlertness(float al)
{
  alertness_ = al;
}

float Monster::GetAlertness()
{
  return alertness_;
}

QVariantMap Monster::atack(Creature* actor)
{
  int val = rand();
  val = 2.0f;
  actor->SetHealth(actor->GetHealth() - val);
  QVariantMap ans;
  ans["dealtDamage"] = val;
  ans["target"] = actor->GetId();
  //ans["blowType"] = s[0];
  ans["attacker"] = GetId();
  return ans;
}

