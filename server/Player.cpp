#include "Player.hpp"

Player::Player()
{
  type_ = "player";
  SetRace ();
  SetBlows();
}

Player::~Player()
{

}

QString Player::GetLogin() const
{
  return login_;
}

void Player::SetLogin(const QString login)
{
  login_ = login;
}

unsigned Player::GetClientTick() const
{
  return clientTick_;
}

void Player::SetClientTick(const unsigned clientTick)
{
  clientTick_ = clientTick;
}

void Player::SetRace()
{
  race_ = "PLAYER";
}

void Player::SetBlows()
{
  Blows.attack = "BITE";
  Blows.damage.from = 1;
  Blows.damage.to = 3;
  Blows.effect = "HURT";
}

QVariantMap Player::atack(Creature* actor)
{
  int val = rand();
  val = actor->GetHealth() - (val % Blows.damage.to + Blows.damage.from);
  actor->SetHealth(val);
  QVariantMap ans;
  ans["dealtDamage"] = val;
  ans["target"] = actor->GetId();
  ans["blowType"] = Blows.attack;
  ans["attacker"] = GetId();
  return ans;
}
