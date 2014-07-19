#include "Item.hpp"

Item::Item()
{
  type_ = "item";
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
  return type_item_;
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
  return class_item_;
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

void Item::SetMessage (QString str)
{
  massege_ = str;
}

void Item::SetTypeItem(QString str)
{
  type_item_ = str;
}

void Item::SetTypeItem(int str)
{
  type_item_ = type[str];
}

void Item::SetTime(int str)
{
  time_= str;
}

void Item::SetSubtype(QString str)
{
  int i = str.toInt () > 0?str.toInt ():0;
  subtype_ = subtype[i];
}

void Item::SetClass(QString str)
{
  int i = str.toInt () > 0?str.toInt ():0;
  class_item_ = class_[i];
}
