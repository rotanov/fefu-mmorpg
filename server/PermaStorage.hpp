#pragma once

#include <QSqlDatabase>
#include "Monster.hpp"
#include "Item.hpp"

class PermaStorage
{
public:
  PermaStorage();
  bool Connect();
  void Disconnect();
  void Reset();
  void DropAll();
  void InitSchema();
  void AddUser(const QString login, const QString passHash, const QString salt, const QString class_);
  QString GetSalt(const QString login);
  QString GetPassHash(const QString login);
  QString GetClass(const QString login);
  void GetMonster(Monster* m, const int id);
  void GetItem (Item* i, const int id );
  bool IfLoginPresent(const QString login);

private:
  QSqlDatabase db_;
  QMap <QString,EStatConst> Stats
  {
    {"STR", EStatConst::STRENGTH },
    {"INT", EStatConst::INTELLIGENCE},
    {"DEF", EStatConst::DEFENSE},
    {"DEX", EStatConst::DEXTERITY},
    {"MR", EStatConst::MAGIC_RESISTANCE},
    {"SPEED", EStatConst::SPEED},
    {"CAP", EStatConst::CAPACITY},
    {"HP", EStatConst::MAX_HP},
    {"MP", EStatConst::MAX_MP},
  };
  bool ExecQuery_(QSqlQuery& query);
  bool ExecQuery_(QString query);
};
