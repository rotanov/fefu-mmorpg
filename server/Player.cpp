#include "Player.hpp"

Player::Player()
{
  type_ = PLAYER;
  SetRace();
  SetMaxHealth(1000);
  SetHealth(1000);
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
  }
  else
  {
    result->count = s2[0].toInt() - blows.damage->count;
    result->count = s2[1].toInt() - blows.damage->to;
  }
  blows.damage = result;
}

QVariantMap Player::atack(Creature* actor, int id)
{
  int val = rand();
  int n = blows.damage->count, m = blows.damage->to;
  if (id == 1)
  {
    Item* item = GetSlot(left_hand);
    n = item->damage.count;
    m = item->damage.to;
  }
  else if (id == 2)
  {
    Item* item = GetSlot(right_hand);
    n = item->damage.count;
    m = item->damage.to;
  }
  val = (val % (n * m));
  actor->SetHealth(actor->GetHealth() - val);
  QVariantMap ans;
  ans["dealtDamage"] = val;
  ans["target"] = actor->GetId();
  ans["blowType"] = blows.attack;
  ans["attacker"] = GetId();
  return ans;
}

Item* Player::GetSlot(Slot st)
{
  return slots_[st];
}

bool Player::SetSlot(Slot st, Item* item)
{
  bool result = false;
  if ((st == left_hand || st == right_hand) &&
      (item->GetTypeItem() == "weapon" || item->GetTypeItem() == "shield"))
    result = true;
  else if ((st == left_finger || st == right_finger) && (item->GetTypeItem() == "ring"))
    result = true;
  else if (st == ammo && item->GetTypeItem() == "expendable")
    result = true;
  else if (st == neck && item->GetTypeItem() == "eamulet")
    result = true;
  else if (st == body && item->GetTypeItem() == "armor")
    result = true;
  else if (st == head && item->GetTypeItem() == "helm")
    result = true;
  else if (st == forearm && item->GetTypeItem() == "gloves")
    result = true;
  else if (st == feet && item->GetTypeItem() == "boots")
    result = true;
  if (result)
    slots_[st] = item;
  return result;
}

bool Player::SetSlot(Slot st)
{
  slots_[st] = 0;
  return true;
}

bool Player::GetItemId(int id)
{
  for (auto& item: items_)
  {
    if (item->GetId() == id)
      return true;
  }
  return false;
}

int Player::GetTotalWeigh()
{
  int totalWeigh = 0;
  for (auto& item: items_)
  {
    totalWeigh += item->GetWeight();
  }
  return totalWeigh;
}
