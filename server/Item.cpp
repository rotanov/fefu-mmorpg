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
  return type_item;
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
  return class_item;
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
  type_item = type[str.toInt()];
}

int Item::Getammor()
{
  return ammor_;
}

QString Item::GetDemage()
{
  return demage_;
}

void Item::Setammor(int str)
{
  ammor_ = str;
}

void Item::SetDemage(QString str)
{
  demage_ = str;
}

void Item::SetSubtype(QString str)
{
  int i = str.toInt () > 0?str.toInt ():0;
  subtype_ = subtype[i];
}

void Item::SetClass(QString str)
{
  int i = str.toInt () > 0?str.toInt ():0;
  class_item = class_[i];
}
