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
    } /*
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
    }*/
}

void Monster::OnCollideActor(Actor* /*actor*/)
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
