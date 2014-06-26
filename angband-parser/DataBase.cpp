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
            base_hp varchar(32),
            hp_inc varchar(32),
            blow_method varchar(32),
            color varchar(32),
            description text,
            flags text,
            symbol varchar(32),
            info varchar(32),
            spells varchar(32),
            level_info varchar(32)
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

void AddToDataBase()
{
    DataBase storage_;
    storage_.Connect();
    storage_.CreateTable();
    QSqlQuery q;
    q.prepare(R"=(
              INSERT INTO monsters(name, base_hp, hp_inc, blow_method, color, description, flags, symbol, info, spells, level_info)
              VALUES
              ('Scrawny cat', '100', '25d2', 'CLAW|HURT|1d1', 'U', 'A skinny little furball with sharp claws and a menacing look.', 'RAND_25|TROLL|HATE_PLAYERS', 'f', '110|2|30|1|10', ' ' , '0|3|0'),
              ('Scruffy little dog', '100', '25d2', 'BITE|HURT|1d1', 'U', 'A thin flea-ridden mutt, growling as you get close.', 'RAND_25|ORC|HATE_TROLLS', 'C', '110|2|20|1|5', ' ' , '0|3|0'),
              ('Grey mold', '200', '25d3', 'SPORE|HURT|1d4@SPORE|HURT|1d4', 's', 'A small strange grey growth.', 'NEVER_MOVE|IM_POIS|HURT_FIRE|NO_FEAR|NO_CONF|NO_SLEEP|HATE_ORCS', 'm', '110|2|2|1|0', ' ' , '1|1|3'),
              ('Grey mushroom patch', '200', '25d3', 'SPORE|CONFUSE|1d4', 's', 'Yum! It looks quite tasty.', 'IM_POIS|NEVER_MOVE|HURT_FIRE|NO_FEAR|NO_CONF|NO_SLEEP|HATE_TROLLS', ',', '110|2|2|1|0', ' ' , '1|1|1'),
              ('Giant yellow centipede', '200', '25d3', 'BITE|HURT|1d3@STING|HURT|1d3', 'y', 'It is about four feet long and carnivorous.', 'ANIMAL', 'c', '110|7|8|14|30', ' ' , '1|1|2'),
              ('Giant white centipede', '200', '25d3', 'BITE|HURT|1d2@STING|HURT|1d2', 'w', 'It is about four feet long and carnivorous.', 'RAND_50|ANIMAL', 'c', '110|9|7|12|40', ' ' , '1|1|2'),
              ('White icky thing', '200', '25d3', 'TOUCH|HURT|1d2', 'w', 'It is a smallish, slimy, icky creature.', 'RAND_25|RAND_50', 'i', '110|6|12|8|10', ' ' , '1|1|1'),
              ('Large brown snake', '200', '25d3', 'BITE|HURT|1d3@CRUSH|HURT|1d4', 'u', 'It is about eight feet long.', 'RAND_25|ANIMAL|HURT_COLD', 'J', '100|14|4|42|99', ' ' , '1|1|3'),
              ('Large white snake', '200', '25d3', 'BITE|HURT|1d1@CRUSH|HURT|1d1', 'w', 'It is about eight feet long.', 'RAND_50|ANIMAL|HURT_COLD', 'J', '100|11|4|36|99', ' ' , '1|1|2'),
              ('Small kobold', '200', '25d3', 'HIT|HURT|1d5', 'y', 'It is a squat and ugly humanoid figure with a canine face.', 'DROP_60|EVIL|IM_POIS', 'k', '110|8|20|24|70', ' ' , '1|1|5'),
              ('Floating eye', '200', '25d3', 'GAZE|PARALYZE', 'o', 'A disembodied eye, floating a few feet above the ground.', 'NEVER_MOVE|HURT_LIGHT|NO_FEAR', 'e', '110|11|2|7|10', ' ' , '1|1|1'),
              ('Rock lizard', '200', '25d3', 'BITE|HURT|1d1', 'U', 'It is a small lizard with a hardened hide.', 'ANIMAL|HURT_COLD', 'R', '110|8|20|4|15', ' ' , '1|1|2'),
              ('Soldier ant', '200', '25d3', 'BITE|HURT|1d2', 'W', 'A large ant with powerful mandibles.', 'ANIMAL', 'a', '110|6|10|4|40', ' ' , '1|1|3'),
              ('Fruit bat', '200', '25d3', 'BITE|HURT|1d1', 'o', 'A fast-moving pest.', 'ANIMAL', 'b', '120|4|20|3|10', ' ' , '1|1|1'),
              ('Kobold', '400', '50d3', 'HIT|HURT|1d8', 'G', 'It is a small, dog-headed humanoid.', 'DROP_60|EVIL|IM_POIS|HATE_PLAYERS', 'k', '110|12|20|24|70', ' ' , '2|1|5'),
              ('Metallic green centipede', '400', '50d3', 'CRAWL|HURT|1d1', 'g', 'It is about four feet long and carnivorous.', 'RAND_50|ANIMAL', 'c', '120|10|5|4|10', ' ' , '2|1|3'),
              ('Yellow mushroom patch', '400', '50d3', 'SPORE|TERRIFY|1d6', 'y', 'Yum! It looks quite tasty.', 'NEVER_MOVE|IM_POIS|HURT_FIRE|NO_FEAR|NO_CONF|NO_SLEEP', ',', '110|1|2|1|0', ' ' , '2|1|2'),
              ('White jelly', '400', '50d3', 'TOUCH|POISON|1d2', 'w', 'Its a large pile of white flesh.', 'NEVER_MOVE|HURT_LIGHT|IM_POIS|HURT_COLD|NO_CONF|NO_SLEEP|NO_FEAR', 'j', '120|36|2|1|99', ' ' , '2|1|10'),
              ('Giant green frog', '400', '50d3', 'BITE|HURT|1d3', 'g', 'It is as big as a wolf.', 'RAND_25|ANIMAL|HURT_COLD', 'R', '110|9|12|9|30', ' ' , '2|1|6'),
              ('Giant black ant', '400', '50d3', 'BITE|HURT|1d4', 'D', 'It is about three feet long.', 'RAND_25|ANIMAL', 'a', '110|11|8|24|80', ' ' , '2|1|8'),
              ('Salamander', '400', '50d3', 'BITE|FIRE|1d3', 'o', 'A small black and orange lizard.', 'RAND_25|IM_FIRE|ANIMAL|HURT_COLD|HATE_PLAYERS', 'R', '110|14|8|24|80', ' ' , '2|1|10'),
              ('Yellow mold', '500', '42d4', 'SPORE|HURT|1d4', 'y', 'It is a strange yellow growth on the dungeon floor.', 'NEVER_MOVE|IM_POIS|HURT_FIRE|NO_FEAR|NO_CONF|NO_SLEEP|HATE_PLAYERS', 'm', '110|36|2|12|99', ' ' , '3|1|9'),
              ('Metallic red centipede', '500', '42d4', 'CRAWL|HURT|1d2', 'r', 'It is about four feet long and carnivorous.', 'RAND_25|ANIMAL|HATE_PLAYERS', 'c', '120|18|8|10|20', ' ' , '3|1|12'),
              ('Cave lizard', '600', '50d4', 'BITE|HURT|1d5', 'u', 'It is an armoured lizard with a powerful bite.', 'ANIMAL|HURT_COLD', 'R', '110|11|8|19|80', ' ' , '4|1|8'),
              ('Blue jelly', '600', '50d4', 'TOUCH|COLD|1d6', 'b', 'Its a large pile of pulsing blue flesh.', 'COLD_BLOOD|NEVER_MOVE|HURT_LIGHT|IM_COLD|NO_CONF|NO_SLEEP|NO_FEAR|HATE_PLAYERS', 'j', '110|54|2|1|99',' ' , '4|1|14'),
              ('Large grey snake', '600', '50d4', 'BITE|HURT|1d5@CRUSH|HURT|1d8', 's', 'It is about ten feet long.', 'RAND_25|ANIMAL|HURT_COLD|HATE_PLAYERS', 'J', '100|27|6|61|100', ' ' , '4|1|14'),
              ('Raven', '600', '50d4', 'BITE|HURT|1d4@BITE|HURT|1d4', 'D', 'Larger than a crow, and pitch black.', 'ANIMAL', 'B', '120|12|40|14|0', ' ' , '4|2|10'),
              ('Blue ooze', '800', '50d5', 'CRAWL|COLD|1d4', 'b', 'Its blue and its oozing.', 'DROP_40|RAND_25|RAND_50|IM_COLD|NO_CONF|NO_SLEEP|NO_FEAR|HATE_PLAYERS', 'j', '110|8|8|19|80', ' ' , '5|1|7'),
              ('Green glutton ghost', '800', '50d5', 'TOUCH|EAT_FOOD|1d1', 'g', 'It is a very ugly green ghost with a voracious appetite.', 'DROP_40|DROP_60|RAND_25|RAND_50|UNDEAD|EVIL|INVISIBLE|COLD_BLOOD|PASS_WALL|IM_POIS|NO_CONF|NO_SLEEP|NO_STUN|HATE_PLAYERS', 'G', '130|8|10|24|10', ' ' , '5|1|15'),
              ('Green jelly', '800', '50d5', 'TOUCH|ACID|1d2', 'g', 'It is a large pile of pulsing green flesh.', 'NEVER_MOVE|HURT_LIGHT|IM_ACID|HURT_COLD|NO_CONF|NO_SLEEP|NO_FEAR|HATE_PLAYERS', 'j', '120|99|2|1|99', ' ' , '5|1|18'),
              ('Large kobold', '800', '50d5', 'HIT|HURT|1d10', 'b', 'It is a man-sized figure with the all too recognizable face of a kobold.', 'DROP_60|EVIL|IM_POIS|HATE_PLAYERS', 'k', '110|65|20|48|70', ' ' , '5|1|25'),
              ('Skeleton kobold', '800', '50d5', 'HIT|HURT|1d6', 'w', 'It is a small animated kobold skeleton.', 'UNDEAD|EVIL|COLD_BLOOD|IM_COLD|IM_POIS|NO_FEAR|NO_CONF|NO_SLEEP|NO_STUN|HATE_PLAYERS', 's', '110|23|20|39|80', ' ' , '5|1|12'),
              ('Grey icky thing', '800', '50d5', 'TOUCH|HURT|1d5', 's', 'It is a smallish, slimy, icky, nasty creature.', 'RAND_50|HATE_PLAYERS', 'i', '110|18|14|14|15', ' ' , '5|1|10')
             )=");
    storage_.ExecQuery_(q);
    storage_.Disconnect();
}
