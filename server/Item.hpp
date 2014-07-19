#pragma once

#include "Actor.hpp"
#include <QStringList>
#include <QVariant>
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
  int GetTime();

  void SetName(QString str);
  void SetWeight(int str);
  void SetTime(int str);
  void SetTypeItem(QString str);
  void SetTypeItem(int str);
  void SetSubtype(QString str);
  void SetClass(QString str);
  void SetMessage(QString str);

  QStringList Flags;
  QMap <Stat_const, QMap <QString, QVariant> > bonuses;
  Damage damage;

private:
  int time_;
  int weight_;
  QString name_;
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
