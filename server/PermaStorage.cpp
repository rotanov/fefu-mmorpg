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
    QSqlQuery q;
    q.prepare("DROP TABLE users");
    ExecQuery_(q);
}

void PermaStorage::InitSchema()
{
    QSqlQuery q;
    bool ret = q.exec(R"=(create table users
        (
            id serial primary key,
            login varchar(36),
            pass varchar(128),
            salt varchar(64),
            sid varchar(40),
            x real,
            y real
        )
    )=");

    if (!ret)
    {
        qDebug() << q.lastError();
    }
}

void PermaStorage::AddUser(const QString login, const QString passHash, const QString salt)
{
    QSqlQuery q;
    q.prepare(R"=(INSERT INTO users (login, pass, salt)
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
