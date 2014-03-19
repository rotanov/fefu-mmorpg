#include "PermaStorage.hpp"

#include <QSqlQuery>
#include <QSql>
#include <QSqlDriver>
#include <QSqlError>
#include <QDebug>

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
    q.exec("drop table users");
    qDebug() << q.lastError();
}

void PermaStorage::InitSchema()
{
    QSqlQuery query;
    bool ret;
    ret = query.exec("create table users "
        "(id integer primary key, "
        "login varchar(36), "
        "pass varchar(36), "
        "sid varchar(40),"
        "x real,"
        "y real)");

    if (!ret)
    {
        qDebug() << query.lastError();
    }
}
