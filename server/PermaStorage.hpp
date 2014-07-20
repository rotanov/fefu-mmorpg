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
  void AddUser(const QString login, const QString passHash, const QString salt);
  QString GetSalt(const QString login);
  QString GetPassHash(const QString login);
  void GetMonster(Monster* m, const int id);
  void GetItem (Item* i, const int id );
  bool IfLoginPresent(const QString login);

private:
  QSqlDatabase db_;
  QMap <QString,Stat_const> Stats
  {
    {"STR", STRENGTH },
    {"INT", INTELLIGENCE},
    {"DEF", DEFENSE},
    {"DEX", DEXTERITY},
    {"MR", MAGIC_RESISTANCE},
    {"SPEED", SPEED},
    {"CAP", CAPACITY},
    {"HP", MAX_HP},
    {"MP", MAX_MP},
  };
  bool ExecQuery_(QSqlQuery& query);
  bool ExecQuery_(QString query);
};
