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
  Blows["attack"] = "BITE";
  Blows["damage"] = "1d5";
  Blows["effect"] = "HURT";
}
void Player::SetDemage(QString str, bool b)
{
  QStringList s1;
  s1 << Blows["damage"].toString().split("d");
  QStringList s2;
  s2 << str.split("d");
  QString result;
  if (b)
  {
    int d1 = s1[0].toInt() + s2[0].toInt();
    int d2 = s1[1].toInt() + s2[1].toInt();
    result = QString(d1) + "d" + QString(d2);
  } else {
    int d1 = s1[0].toInt() - s2[0].toInt();
    int d2 = s1[1].toInt() - s2[1].toInt();
    result = QString(d1) + "d" + QString(d2);
  }
  Blows["damage"] = result;
}

QVariantMap Player::atack(Creature* actor)
{
  int val = rand();
  QStringList s;
  QString str = Blows["damage"].toString();
  s << str.split ("d");
  val = actor->GetHealth() - (val % s[0].toInt()+ s[1].toInt ());
  actor->SetHealth(val);
  QVariantMap ans;
  ans["dealtDamage"] = val;
  ans["target"] = actor->GetId();
  ans["blowType"] = Blows["attack"];
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

