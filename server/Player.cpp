#include "Player.hpp"

Player::Player()
{
  type_ = EActorType::PLAYER;
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
  actor->SetHealth(actor->GetHealth() - 50); // for Alexander's tests
  QVariantMap ans;
  ans["dealtDamage"] = val;
  ans["target"] = actor->GetId();
  ans["blowType"] = blows.attack;
  ans["attacker"] = GetId();
  QVariantMap ans1;
  ans1["attack"] = ans;
  return ans1;
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

void Player::SetExperience(int exp)
{
  experience_ = exp;
}

int Player::GetExperience()
{
  return experience_;
}
void Player::SetLevel(int lev)
{
  level_ = lev;
}

int Player::GetLevel()
{
  return level_;
}

void Player::SetClass(QString clas)
{
  if (clas == "warrior")
   class_ = warrior;
  else if (clas == "rouge")
   class_ = rouge;
  else
   class_ = mage;
}

QString Player::GetClass()
{
  if (class_ == warrior)
   return  "warrior";
  else if (class_ == rouge)
   return "rouge";
  else
   return "mage";
}

void Player::AddStat()
{
  if (class_ == warrior)
  {
    SetStat(EStatConst::STRENGTH, GetStatValue(EStatConst::STRENGTH) + 2);
    SetStat(EStatConst::INTELLIGENCE, GetStatValue(EStatConst::INTELLIGENCE) + 1);
    SetStat(EStatConst::DEXTERITY, GetStatValue(EStatConst::DEXTERITY) + 1);
  }
  if (class_ == rouge)
  {
    SetStat(EStatConst::STRENGTH, GetStatValue(EStatConst::STRENGTH) + 1);
    SetStat(EStatConst::INTELLIGENCE, GetStatValue(EStatConst::INTELLIGENCE) + 2);
    SetStat(EStatConst::DEXTERITY, GetStatValue(EStatConst::DEXTERITY) + 1);
  }
  if (class_ == mage)
  {
    SetStat(EStatConst::STRENGTH, GetStatValue(EStatConst::STRENGTH) + 1);
    SetStat(EStatConst::INTELLIGENCE, GetStatValue(EStatConst::INTELLIGENCE) + 1);
    SetStat(EStatConst::DEXTERITY, GetStatValue(EStatConst::DEXTERITY) + 2);
  }
}

void Player::UpdateStat()
{
  SetStat(EStatConst::MAX_HP, GetStatValue(EStatConst::MAX_HP)
          + 5 * GetStatValue(EStatConst::STRENGTH)
          + GetStatValue(EStatConst::INTELLIGENCE));
  SetStat(EStatConst::MAX_MP, GetStatValue(EStatConst::MAX_MP)
          + GetStatValue(EStatConst::DEXTERITY)
          + 4 * GetStatValue(EStatConst::INTELLIGENCE));
}

bool Player::GetItemId(int id)
{
  for (auto& item: items_)
  {
    if (item->GetId() == id)
    {
      return true;
    }
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

bool Player::DropItemFromSlot(int id)
{
  bool result = false;
  for (auto slot = slots_.begin(); slot != slots_.end(); ++slot)
  {
    if (slot.value()->GetId() == id)
    {
      slots_.erase(slots_.find(slot.key()));
      result = true;
      break;
    }
  }
  return result;
}
