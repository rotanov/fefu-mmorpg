#include "Monster.hpp"
#include "DataBase.hpp"

#include <QString>
#include <QStringList>
#include <QDebug>

Monstr::Monstr()
{

}

Monstr::Monstr(string name_, TypeMonstr* type_)
{
    name = name_.c_str();
    T = type_;
}

void Monstr::AddToDataBase()
{
    DataBase storage_;
    storage_.Connect();
    storage_.CreateTable();
    QString query;
    query = "INSERT INTO monsters ";
    query += "(" + fields_.join(", ") + ")";
    query += "VALUES ("
          + QString("'") + name + QString("', ")
          + QString("'") + I + QString("', ")
          + QString("'") + W + QString("', ")
          + QString("'") + "{" + B.join(", ") + QString("}', ")
          + QString("'") + spell_frequency + QString("', ")
          + QString("'") + "{" + F.join(", ") + QString("}', ")
          + QString("'") + "{" + S.join(", ") + QString("}', ")
          + QString("'") + "{" + D.join(", ") + QString("}', ")
          + QString("'") + "{" + drop.join(", ") + QString("}', ")
          + QString("'") + "{" + friends.join(", ") + QString("}', ")
          + QString("'") + "{" + drop_artifact.join(", ") + QString("}', ")
          + QString("'") + "{" + mimic.join(", ") + QString("}' ")
          + ")";

    qDebug() << query;
    storage_.ExecQuery_(query);
    storage_.Disconnect();
}

TypeMonstr::TypeMonstr(string name_)
{
    name = name_.c_str();
}
