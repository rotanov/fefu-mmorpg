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
    auto dir = GetDirection();
    if (Flags.lastIndexOf("PASS_WALL") == -1)
    {
        SetDirection(static_cast<EActorDirection>(rand() % 4 + 1));
        return;
    }
}

bool Monster::OnCollideActor(Actor* actor)
{
  if (actor->GetType () == "monster" || actor->GetType () == "player")
  {
    QStringList str = Flags.filter ("HATE");
    for (auto& a: str)
    {
      if (Hates[a] == race_ )
        return true;
    }
  }
  OnCollideWorld();
  return false;
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
void Monster::SetRace()
{
  for (auto& r: Races)
  {
    if (Flags.lastIndexOf (r) != -1)
    {
      race_ = r;
      return;
    }
  }
}
void Monster::atack(Creature* actor)
{
  int val = rand();
  val = val % Blows[0]->damage.to + Blows[0]->damage.from;
  actor->SetHealth(actor->GetHealth () - val);
}

