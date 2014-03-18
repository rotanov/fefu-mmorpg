#include "PermaStorage.hpp"

#include <QSql>
#include <QSqlDriver>
#include <QSqlDatabase>
#include <QSqlError>
#include <QDebug>

PermaStorage::PermaStorage()
{

}

bool PermaStorage::Connect()
{
    qDebug() << QSqlDatabase::drivers();
    QSqlDatabase db(QSqlDatabase::addDatabase("QPSQL"));
    qDebug() << db.lastError();
    db.setHostName("localhost");
    db.setPort(5432);
    db.setUserName("server");
    db.setPassword("123");
    db.setDatabaseName("fefu-mmorpg");

    if (!db.open())
    {
        qDebug() << "database wasn't opened";
        qDebug() << db.lastError();
    }
}
