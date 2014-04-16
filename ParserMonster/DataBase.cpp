#include "DataBase.hpp"

#include <QSqlQuery>
#include <QSql>
#include <QSqlDriver>
#include <QSqlError>
#include <QDebug>
#include <QSqlRecord>

DataBase::DataBase()
{

}

bool DataBase::Connect()
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

void DataBase::Disconnect()
{
    db_.close();
}

void DataBase::CreateTable()
{
    ExecQuery_(R"=(
        create table if not exists monsters
        (
            id serial NOT NULL PRIMARY KEY,
            name varchar(32) NOT NULL,
            I varchar(32),
            W varchar(32),
            B varchar(32)[],
            spell_frequency varchar(32),
            F varchar(32)[],
            S varchar(32)[],
            D varchar(32)[],
            drop varchar(32)[],
            friends varchar(32)[],
            drop_artifact varchar(32)[],
            mimic varchar(32)[]
        )
    )=");
}

bool DataBase::ExecQuery_(QSqlQuery& query)
{
    bool ret = query.exec();
    if (!ret)
    {
        qDebug() << query.lastError();
    }
    return ret;
}

bool DataBase::ExecQuery_(QString query)
{
    QSqlQuery q;
    bool ret = q.exec(query);
    if (!ret)
    {
        qDebug() << q.lastError();
    }
    return ret;
}
