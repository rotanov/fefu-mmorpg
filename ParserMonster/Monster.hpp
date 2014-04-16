#pragma once

#include <QString>
#include <QStringList>

#include <iostream>
#include <fstream>

using namespace std;

enum SpellT {
    ARROW_1,
    ARROW_2,
    ARROW_3,
    ARROW_4,
    BA_ACID,
    BA_COLD,
    BA_DARK,
    BA_ELEC,
    BA_FIRE,
    BA_MANA,
    BA_NETH,
    BA_POIS,
    BA_WATE,
    BLIND,
    BLINK,
    BOULDER,
    BO_ACID,
    BO_COLD,
    BO_ELEC,
    BO_FIRE,
    BO_ICEE,
    BO_MANA,
    BO_NETH,
    BO_PLAS,
    BO_WATE,
    BRAIN_SMASH,
    BR_ACID,
    BR_CHAO,
    BR_COLD,
    BR_CONF,
    BR_DARK,
    BR_DISE,
    BR_ELEC,
    BR_FIRE,
    BR_GRAV,
    BR_INER,
    BR_LIGHT,
    BR_NETH,
    BR_NEXU,
    BR_PLAS,
    BR_POIS,
    BR_SHAR,
    BR_SOUN,
    BR_TIME,
    BR_WALL,
    CAUSE_1,
    CAUSE_2,
    CAUSE_3,
    CAUSE_4,
    CONF,
    DARKNESS,
    DRAIN_MANA,
    FORGET,
    HASTE,
    HEAL,
    HOLD,
    MIND_BLAST,
    MISSILE,
    SCARE,
    SHRIEK,
    SLOW,
    S_AINU,
    S_ANIMAL,
    S_DEMON,
    S_DRAGON,
    S_HI_DEMON,
    S_HI_DRAGON,
    S_HI_UNDEAD,
    S_HOUND,
    S_HYDRA,
    S_KIN,
    S_MONSTER,
    S_MONSTERS,
    S_SPIDER,
    S_UNDEAD,
    S_UNIQUE,
    S_WRAITH,
    TELE_AWAY,
    TELE_LEVEL,
    TELE_TO,
    TPORT,
    TRAPS
};

enum FlagT {
    ANIMAL,
    ATTR_CLEAR,
    ATTR_FLICKER,
    ATTR_MULTI,
    BASH_DOOR,
    CHAR_CLEAR,
    COLD_BLOOD,
    DEMON,
    DRAGON,
    DROP_1,
    DROP_2,
    DROP_20,
    DROP_3,
    DROP_4,
    DROP_40,
    DROP_60,
    DROP_GOOD,
    DROP_GREAT,
    EMPTY_MIND,
    EVIL,
    FEMALE,
    FORCE_DEPTH,
    FORCE_SLEEP,
    GIANT,
    GROUP_AI,
    HAS_LIGHT,
    HURT_COLD,
    HURT_FIRE,
    HURT_LIGHT,
    HURT_ROCK,
    IM_ACID,
    IM_COLD,
    IM_ELEC,
    IM_FIRE,
    IM_POIS,
    IM_WATER,
    INVISIBLE,
    KILL_BODY,
    KILL_ITEM,
    KILL_WALL,
    MALE,
    METAL,
    MIMIC_INV,
    MOVE_BODY,
    MULTIPLY,
    NEVER_BLOW,
    NEVER_MOVE,
    NONLIVING,
    NO_CONF,
    NO_FEAR,
    NO_SLEEP,
    NO_STUN,
    ONLY_GOLD,
    ONLY_ITEM,
    OPEN_DOOR,
    ORC,
    PASS_WALL,
    POWERFUL,
    QUESTOR,
    RAND_25,
    RAND_50,
    REGENERATE,
    RES_DISE,
    RES_NETH,
    RES_NEXUS,
    RES_PLAS,
    SEASONAL,
    SMART,
    STUPID,
    TAKE_ITEM,
    TROLL,
    UNAWARE,
    UNDEAD,
    UNIQUE,
    WEIRD_MIND
};

class TypeMonstr {
    public:
        QString name;
        string M;
        vector<string> F;
        vector<string> S;
        TypeMonstr(string);
};

class Monstr {
public:
    QString name;
    TypeMonstr* T;
    QString I;
    QString W;
    QStringList B;
    QString spell_frequency;
    QStringList F;
    QStringList S;
    QStringList D;
    QStringList drop;
    QStringList friends;
    QStringList drop_artifact;
    QStringList mimic;

    QStringList fields_ = (QStringList() << "name"
                             << "I"
                             << "W"
                             << "B"
                             << "spell_frequency"
                             << "F"
                             << "S"
                             << "D"
                             << "drop"
                             << "friends"
                             << "drop_artifact"
                             << "mimic");

    Monstr();
    Monstr(string, TypeMonstr*);

    void AddToDataBase();
};
