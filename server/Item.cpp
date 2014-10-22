#include "Item.hpp"

Item::Item()
{
  type_ = EActorType::ITEM;
  isOnTheGround_ = true;
}

Item::~Item()
{

}

QString Item::Getname()
{
  return name_;
}

int Item::GetWeight()
{
  return weight_;
}

QString Item::GetTypeItem()
{
  return typeItem_;
}

QString Item::GetSubtype()
{
  return subtype_;
}

QString Item::GetMessage()
{
  return massege_;
}

QString Item::GetClass()
{
  return classItem_;
}

int Item::GetTime()
{
  return time_;
}

void Item::SetName(QString str)
{
  name_ = str;
}

void Item::SetWeight(int str)
{
  weight_ = str;
}

void Item::SetMessage(QString str)
{
  massege_ = str;
}

void Item::SetTypeItem(QString str)
{
  typeItem_ = str;
}

void Item::SetTypeItem(int str)
{
  typeItem_ = type[str];
}

void Item::SetTime(int str)
{
  time_= str;
}

bool Item::GetOnTheGround() const
{
  return isOnTheGround_;
}

void Item::SetOnTheGround(const bool isOnTheGround)
{
  isOnTheGround_ = isOnTheGround;
}

void Item::SetSubtype(QString str)
{
  int i = str.toInt() > 0 ? str.toInt() : 0;
  subtype_ = subtype[i];
}

void Item::SetClass(QString str)
{
  int i = str.toInt() > 0 ? str.toInt() : 0;
  classItem_ = class_[i];
}
