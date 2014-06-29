#pragma once

#include "Actor.hpp"
#include <QStringList>

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
  int Getammor();
  QString GetDemage();
  void SetName(QString str);
  void SetWeight(int str);
  void SetTypeItem(QString str);
  void SetSubtype(QString str);
  void SetClass(QString str);
  void SetMessage(QString str);
  void Setammor(int str);
  void SetDemage(QString str);
  QStringList Flags;
  QStringList bonus;
private:
  QString name_;
  int weight_;
  QString type_item;
  QString class_item;
  QString subtype_;
  QString massege_;
  int ammor_;
  QString demage_;
  std::vector<QString> class_ =
  {
    "garment",
    "food",
    "bow"
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
  };
  std::vector<QString> subtype =
  {
    "sword",
    "polearms",
    "bow",
  };
};
