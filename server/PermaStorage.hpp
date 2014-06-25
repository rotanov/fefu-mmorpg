#pragma once

#include <QSqlDatabase>

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
  bool IfLoginPresent(const QString login);

private:
  QSqlDatabase db_;

  bool ExecQuery_(QSqlQuery& query);
  bool ExecQuery_(QString query);
};
