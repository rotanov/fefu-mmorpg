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
  blows.attack = "BITE";
  blows.damage = new Damage();
  blows.damage->count = 1;
  blows.damage->to = 5;
  blows.effect = "HURT";
}
void Player::SetDamage(QString str, bool b)
{
  QStringList s2;
  s2 << str.split("d");
  Damage* result = new Damage;
  if (b)
  {
    result->count = s2[0].toInt() + blows.damage->count;
    result->count = s2[1].toInt() + blows.damage->to;
  } else {
    result->count = s2[0].toInt() - blows.damage->count;
    result->count = s2[1].toInt() - blows.damage->to;
  }
  blows.damage = result;
}

QVariantMap Player::atack(Creature* actor)
{
  int val = rand();
  val = (val % (blows.damage->count*blows.damage->to));
  actor->SetHealth(actor->GetHealth()- val);
  QVariantMap ans;
  ans["dealtDamage"] = val;
  ans["target"] = actor->GetId();
  ans["blowType"] = blows.attack;
  ans["attacker"] = GetId();
  return ans;
}

Item* Player::GetSlot(Slot st)
{
  return slot_[st];
}

void Player::SetSlot(Slot st, Item* item)
{
  slot_[st] = item;
}

