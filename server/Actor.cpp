#include "Actor.hpp"

#include <unordered_map>
#include <string>

Actor::Actor()
{

}

Actor::~Actor()
{

}

void Actor::SetPosition(const Vector2& position)
{
    position_ = position;
}

Vector2 Actor::GetVelocity() const
{
    return velocity_;
}

void Actor::SetVelocity(const Vector2& velocity)
{
    velocity_ = velocity;
}

Vector2 Actor::GetPosition() const
{
    return position_;
}

EActorDirection Actor::GetDirection() const
{
    return direction_;
}

void Actor::SetDirection(const QString direction)
{
    static std::unordered_map<std::string, EActorDirection> stringToDirection =
    {
        { "north", EActorDirection::NORTH },
        { "east", EActorDirection::EAST },
        { "south", EActorDirection::SOUTH },
        { "west", EActorDirection::WEST },
    };

    auto it = stringToDirection.find(direction.toStdString());
    if (it != stringToDirection.end())
    {
        direction_ = it->second;
    }
    else
    {
        direction_ = EActorDirection::NONE;
    }
}

void Actor::SetDirection(const EActorDirection direction)
{
    direction_ = direction;
}

float Actor::GetSize() const
{
    return size_;
}

void Actor::SetSize(const float size)
{
    size_ = size;
}

void Actor::Update(float dt)
{
    position_ += velocity_ * dt;
}
