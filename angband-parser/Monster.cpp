#include "Monster.hpp"
#include "DataBase.hpp"

#include <QString>
#include <QStringList>
#include <QSqlQuery>
#include <QSql>
#include <QSqlDriver>
#include <QSqlError>
#include <QSqlRecord>
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
    QSqlQuery q;
    q.prepare(R"=(
        INSERT INTO monsters
        (
            name,
            I,
            W,
            G,
            B,
            spell_frequency,
            F,
            S,
            D,
            drop,
            friends,
            drop_artifact
        )
        VALUES
        (
            :name,
            :i,
            :w,
            :g,
            :b,
            :spell_frequency,
            :f,
            :s,
            :d,
            :drop,
            :friends,
            :drop_artifact
        )
    )=");
    q.bindValue(":name", name);
    q.bindValue(":i", I);
    q.bindValue(":w", W);
    q.bindValue(":g", G);
    QString str = "{" + B.join(", ") + "}";
    q.bindValue(":b", str);
    q.bindValue(":spell_frequency", spell_frequency);
    str = "{" + F.join(", ") + "}";
    q.bindValue(":f", str);
    str = "{" + S.join(", ") + "}";
    q.bindValue(":s", str);
    str = "{" + D.join(" ") + "}";
    q.bindValue(":d", str);
    str = "{" + drop.join(", ") + "}";
    q.bindValue(":drop", str);
    str = "{" + friends.join(", ") + "}";
    q.bindValue(":friends", str);
    str = "{" + drop_artifact.join(", ") + "}";
    q.bindValue(":drop_artifact", str);
    storage_.ExecQuery_(q);
    storage_.Disconnect();
}

TypeMonstr::TypeMonstr(string name_)
{
    name = name_.c_str();
}
