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
    switch (dir)
    {
    case EActorDirection::EAST:
        SetDirection(EActorDirection::SOUTH);
        break;

    case EActorDirection::WEST:
        SetDirection(EActorDirection::NORTH);
        break;

    case EActorDirection::SOUTH:
        SetDirection(EActorDirection::WEST);
        break;

    case EActorDirection::NORTH:
        SetDirection(EActorDirection::EAST);
        break;

    case EActorDirection::NONE:
        SetDirection(EActorDirection::NORTH);
        break;
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

QVariantMap Monster::atack(Creature* actor)
{
  int val = rand();
  QStringList s;
  s << Blows[0].split ("|");
  if (s.length () == 3)
  {
    QStringList d;
    d << s[2].split ("d");
    val = (val % (d[1].toInt()*d[0].toInt ()));
  } else {
    val = 2.0f;
  }
  actor->SetHealth(actor->GetHealth() - val);
  QVariantMap ans;
  ans["dealtDamage"] = val;
  ans["target"] = actor->GetId();
  ans["blowType"] = s[0];
  ans["attacker"] = GetId();
  return ans;
}

