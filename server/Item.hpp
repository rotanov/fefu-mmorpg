#pragma once

#include "Actor.hpp"
#include <QStringList>
#include <QMap>



class Item : public Actor
{
public:
  Item();
  virtual ~Item();
  QString Getname();
  int GetWeight();
  QString GetTypeItem();
  QString GetSubtype();
  QString GetClass();
  QString GetMessage();
  void SetName(QString str);
  void SetWeight(int str);
  void SetTypeItem(QString str);
  void SetTypeItem(int str);
  void SetSubtype(QString str);
  void SetClass(QString str);
  void SetMessage(QString str);
  QStringList Flags;
  QMap <Stat_const, float> bonus;
private:
  QString name_;
  int weight_;
  QString type_item_;
  QString class_item_;
  QString subtype_;
  QString massege_;
  std::vector<QString> class_ =
  {
    "garment",
    "consumable",

  };

  std::vector<QString> type =
  {
    "amulet",
    "ring",
    "armor",
    "shield",
    "helm",
    "gloves",
    "boots",
    "weapon",
    "expendable",
  };
  std::vector<QString> subtype =
  {
    "one-handed",
    "two-handed",
    "bow",
  };

};
