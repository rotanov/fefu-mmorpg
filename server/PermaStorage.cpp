#include "PermaStorage.hpp"


#include <QSqlQuery>
#include <QSql>
#include <QSqlDriver>
#include <QSqlError>
#include <QDebug>
#include <QSqlRecord>

PermaStorage::PermaStorage()
{

}

bool PermaStorage::Connect()
{
  db_ = QSqlDatabase::addDatabase("QPSQL");
  if (!db_.isValid())
  {
    qDebug() << db_.lastError();
    return false;
  }

  db_.setHostName("localhost");
  db_.setPort(5432);
  db_.setUserName("server");
  db_.setPassword("123");
  db_.setDatabaseName("fefu-mmorpg");

  if (!db_.open())
  {
    qDebug() << "database wasn't opened";
    qDebug() << db_.lastError();
    return false;
  }

  return true;
}

void PermaStorage::Disconnect()
{
  db_.close();
}

void PermaStorage::Reset()
{
  DropAll();
  InitSchema();
}

void PermaStorage::DropAll()
{
  ExecQuery_("DROP TABLE users");
}

void PermaStorage::InitSchema()
{
  ExecQuery_(R"=(
    create table if not exists users
    (
      id serial NOT NULL PRIMARY KEY,
      login varchar(36) NOT NULL UNIQUE,
      pass varchar(128) NOT NULL,
      salt varchar(64) NOT NULL,
      sid varchar(40) NOT NULL DEFAULT '',
      x real NOT NULL DEFAULT 0.0,
      y real NOT NULL DEFAULT 0.0
    )
  )=");
}

void PermaStorage::AddUser(const QString login, const QString passHash, const QString salt)
{
  QSqlQuery q;
  q.prepare(R"=(
    INSERT INTO users (login, pass, salt)
    VALUES (:login, :passhash, :salt)
  )=");

  q.bindValue(":login", login);
  q.bindValue(":passhash", passHash);
  q.bindValue(":salt", salt);
  ExecQuery_(q);
}

QString PermaStorage::GetSalt(const QString login)
{
  QSqlQuery q;
  q.prepare("SELECT salt FROM users WHERE login = :login");
  q.bindValue(":login", login);
  if (ExecQuery_(q))
  {
    q.next();
    return q.value("salt").toString();
  }
  else
  {
    return "";
  }
}

QString PermaStorage::GetPassHash(const QString login)
{
  QSqlQuery q;
  q.prepare("SELECT pass FROM users WHERE login = :login");
  q.bindValue(":login", login);
  if (ExecQuery_(q))
  {
    q.next();
    return q.value("pass").toString();
  }
  else
  {
    return "";
  }
}
void PermaStorage::GetMonster (Monster * m, const int id)
{
    QSqlQuery q;
    q.prepare("SELECT * FROM monsters WHERE id = :id");
    q.bindValue(":id", id);
    if (ExecQuery_(q))
    {
        q.next();
        m->name = q.value("name").toString();
        m->symbol = q.value("symbol").toString();
        m->description = q.value("description").toString();
        QString str = q.value("flags").toString();
        m->Flags << str.split("|");
        QString st = q.value("blow_method").toString();
        m->Blows << st.split("@");
        QStringList s ;
        s << q.value("info").toString().split("|");
        m->SetMaxHealth(s[1].toFloat());
        m->SetHealth(s[1].toFloat());
        m->SetRace ();
    }
}

void PermaStorage::GetItem(Item* i, const int id )
{
  QSqlQuery q;
  q.prepare("SELECT * FROM items WHERE id = :id");
  q.bindValue(":id", id);
  if (ExecQuery_(q))
  {
    q.next();
    i->SetName(q.value("name").toString());
    i->SetWeight(q.value("weight").toInt());
    i->SetMessage (q.value("message").toString () );
    QString str = q.value("flags").toString();
    i->Flags << str.split("|");
    QString st = q.value("bonus").toString();
    i->bonus << st.split("@");
    QStringList s ;
    s << q.value("atype").toString().split(":");
    i->SetClass (s[0]);
    i->SetTypeItem (s[1].toInt());
    i->SetSubtype (s[2]);
    QStringList power_info;
    power_info << q.value("power_info").toString().split(":") ;
    if (power_info.length () > 0)
      i->Setammor (power_info[0].toInt ());
    if (power_info.length () > 1)
      i->SetDamage (power_info[1]);
  }
}

bool PermaStorage::IfLoginPresent(const QString login)
{
  QSqlQuery q;
  q.prepare("SELECT login FROM users WHERE login = :login");
  q.bindValue(":login", login);
  ExecQuery_(q);
  if (q.next())
  {
    return true;
  }
  return false;
}


bool PermaStorage::ExecQuery_(QSqlQuery& query)
{
  bool ret = query.exec();
  if (!ret)
  {
    qDebug() << query.lastError();
  }
  return ret;
}

bool PermaStorage::ExecQuery_(QString query)
{
  QSqlQuery q;
  bool ret = q.exec(query);
  if (!ret)
  {
    qDebug() << q.lastError();
  }
  return ret;
}
