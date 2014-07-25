#include "Actor.hpp"

#include <unordered_map>
#include <string>

#include "utils.hpp"

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
  SetDirection(EActorDirection::NONE);
}

int Actor::GetId() const
{
  return id_;
}

void Actor::SetId(int id)
{
  id_ = id;
}

void Actor::OnCollideWorld()
{
  SetDirection(EActorDirection::NONE);
}

bool Actor::OnCollideActor(Actor* /*actor*/)
{
  return false;
}

QString Actor::GetType() const
{
  return type_;
}

void Actor::SetType(QString type)
{
  type_ = type;
}

std::vector<std::pair<int, int>> Actor::GetOccupiedCells() const
{
  std::vector<std::pair<int, int>> result;
  Vector2 dp[4];
  for (int i = 0; i < 4; i++)
  {
    Vector2 p = GetPosition()
        + GetSize()
        * 0.5
        * Deku2D::Const::Math::V2_DIRECTIONS_DIAG[i];

    int column = GridRound(p.x);
    int row = GridRound(p.y);

    result.push_back(std::make_pair(column, row));
  }
  return result;
}
