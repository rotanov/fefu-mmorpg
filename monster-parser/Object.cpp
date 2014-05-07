#include "Object.hpp"
#include "DataBase.hpp"

#include <QString>
#include <QStringList>
#include <QSqlQuery>
#include <QSql>
#include <QSqlDriver>
#include <QSqlError>
#include <QSqlRecord>
#include <QDebug>

Object::Object(string name_)
{
    name = name_.c_str();
}

void Object::AddToDataBase()
{
    /*
# N: serial number : & object name~
# G: symbol : color
# I: tval : sval
# W: depth : rarity : weight : cost
# P: base armor class : base damage : plus to-hit : plus to-dam : plus to-ac
# A: commonness : min " to " max
# C: charges
# M: chance of being generated in a pile : dice for number of items
# E: effect when used : recharge time (if applicable)
# F: flag | flag | etc.
# L: pval : flag | flag | etc.
# D: description*/
    DataBase storage_;
    storage_.Connect();
    storage_.ExecQuery_(R"=(
        create table if not exists objects
        (
            id serial NOT NULL PRIMARY KEY,
            name varchar(32) NOT NULL,
            G varchar(32),
            I varchar(32),
            W varchar(32),
            P varchar(32),
            A varchar(32),
            C varchar(32),
            M varchar(32),
            E varchar(32),
            F varchar(32)[],
            L varchar(32)[],
            D varchar(1024)[]
        )
    )=");
    QSqlQuery q;
    q.prepare(R"=(
        INSERT INTO objects
        (
            name,
            G,
            I,
            W,
            P,
            A,
            C,
            M,
            E,
            F,
            L,
            D
        )
        VALUES
        (
            :name,
            :G,
            :I,
            :W,
            :P,
            :A,
            :C,
            :M,
            :E,
            :F,
            :L,
            :D
        )
    )=");
    q.bindValue(":name", name);
    q.bindValue(":I", I);
    q.bindValue(":W", W);
    q.bindValue(":G", G);
    q.bindValue(":P", P);
    q.bindValue(":A", A);
    q.bindValue(":C", C);
    q.bindValue(":M", M);
    q.bindValue(":E", E);
    QString str;
    str = "{" + F.join(", ") + "}";
    q.bindValue(":F", str);
    str = "{" + L.join(", ") + "}";
    q.bindValue(":L", str);
    str = "{" + D.join(" ") + "}";
    q.bindValue(":D", str);

    storage_.ExecQuery_(q);
    storage_.Disconnect();
}


