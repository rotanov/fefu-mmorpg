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
    WEIRD_MIND,
};

class TypeMonstr {
    public:
        QString name;
        string M;
        QString G;
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
    QString G;
    QStringList B;
    QString spell_frequency;
    QStringList F;
    QStringList S;
    QStringList D;
    QStringList drop;
    QStringList friends;
    QStringList drop_artifact;

    QStringList fields_ = (QStringList() << "name"
                             << "I"
                             << "W"
                             << "G"
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
/*
# Do not modify this file unless you know exactly what you are doing, unless
# you wish to risk possible system crashes and broken savefiles.

# === Understanding monster.txt ===

# N: serial number : monster name
# T: template name
# G: symbol
# C: color
# I: speed : hit points : vision : armor class : alertness
# W: depth : rarity : unused (always 0) : experience for kill
# B: attack method : attack effect : damage
# S: spell frequency
# S: spell type | spell type | etc
# F: flag | flag | etc
# -F: flag | flag | etc
# D: Description
# drop: tval : sval : percent drop chance : min : max
# drop-artifact: name
# mimic: tval : sval

# 'N' indicates the beginning of an entry. The serial number must increase for
# each new item. Entry 0 is used for the player.

# 'T' is for the template (see monster_base.txt). This provides the
# default display symbol, some default flags, and the monster's pain messages.

# 'G' is for the display symbol. If present, this overrides the default display
# symbol from the template.

# 'C' is for color. There are 28 colors, as follows:
# d - 0 - Black
# w - 1 - White
# s - 2 - Slate
# o - 3 - Orange
# r - 4 - Red
# g - 5 - Green
# b - 6 - Blue
# u - 7 - Umber
# D - 8 - Light Dark
# W - 9 - Light Slate
# P - 10 - Light Purple
# y - 11 - yellow
# R - 12 - Light Red
# G - 13 - Light Green
# B - 14 - Light Blue
# U - 15 - Light Umber
# p - 16 - Purple
# v - 17 - Violet
# t - 18 - Teal
# m - 19 - Mud
# Y - 20 - Light Yellow
# i - 21 - Magenta-Pink
# T - 22 - Light Teal
# V - 23 - Light Violet
# I - 24 - Light Pink
# M - 25 - Mustard
# z - 26 - Blue Slate
# Z - 27 - Deep Light Blue

# currently unused: d, M, t, T

# (note that "black" is the same color as the screen background, and thus the
# monster will appear to be an empty black space if its color is "d".)

# Note to maintainers/devteam: Light Violet (V) is currently used for the
# "purple uniques" option. The option makes all uniques appear in this colour
# (instead of only Castamir and Waldern). It is therefore unwise to use it
# for non-unique monsters.

# 'I' is for information--speed, health, vision in tens of feet, armor class,
# and alertness. 110 is normal speed. Alertness ranges from 0 (ever vigilant
# for intruders) to 255 (prefers to ignore intruders).

# 'W' is for more information--level, rarity, and experience for killing. The
# third slot is currently unused.

# 'B' is for blows--method of attack, effect of attack, and damage from attack.
# There may be up to four of these lines; effect and damage are optional.

# 'S' is for spells. The first S: line must be S:1_IN_X with X the number of
# monster turns, on average, before the monster will cast one of its spells.
# X must not be zero. If X is 1, the monster will never move while the player
# is in sight, and will thus never attack in melee, as it will cast spells
# every turn: if the monster is to use a melee attack, then X must be 2 or
# greater.

# 'F' is for flags. These are fairly self-explanatory. As many F: lines may be
# used as are needed to specify all the flags and flags are separated by the
# '|' symbol.

# '-F' is for flags to remove from the template. For example, in monster_base.txt,
# molds are given HURT_FIRE. We don't want the red mold to have that, so we
# add a '-F:HURT_FIRE' line to subtract that flag.

# 'D' is for description. As many D: lines may be used as are needed to
# describe the monster. Leading whitespace will be removed, and a single space
# will be added between D: lines.

# 'drop' lines create possible drops for specific monsters. If any L lines are
# present, the monster will drop *only* items from its L lines. Each item has
# its percent chance rolled for individually.

# 'drop-artifact' lines force a specific artifact to drop on death. Setting this
# on a non-UNIQUE monster is dangerous.

# friends lines specify options for what monsters can appear with other monsters
# on creation. The format is.
# friends:Chance of friend appearing:number in xdy format:name of friend
# note that number is throttled depending on the dungeon level with only half
# appearing at depth and the full complement 5 levels deeper. All town friends
# will be divided by two.
# The code places monsters from bottom up and will not place it if it can't find
# room. For best results, places the most important friends at the bottom.

# 'mimic' lines give item types that this monster may mimic. Each of the objects
# has an equal chance of being mimicked.

# === Understanding monster.txt flags ===

# UNIQUE monsters are just "special" monster races, with the requirement that
# only one monster of that race can exist at a time, and when it is killed, it
# can never again be generated.

# ATTR_CLEAR monsters appear the same color as the floor, terrain feature or
# object underneath them.

# ATTR_MULTI monsters are multi-hued--they change color, every player turn.
# Their base color is only used to set the initial color when they spawn.

# ATTR_FLICKER monsters are also multi-hued--but they only change between a
# small range of colors related to their defined color, and they start out
# as their defined color.

# CHAR_CLEAR monsters are totally invisible: the symbol shown on the screen is
# the same as the floor (or other terrain feature) below it, or the item that
# is lying on that floor. These monsters can currently be targetted as normal
# monsters: perhaps this can be changed so that the player must KNOW the
# monster is there (by bumping into it, or having the monster wake up and
# attack the player?)

# CHAR_MULTI monsters are those which look like objects, and use the symbols of
# objects. They are in plain sight, but the character should not know that a
# monster is there. At the moment, such monsters can be targetted normally
# (which means that this flag currently has no effect), but this may change
# in the future, as with CHAR_CLEAR monsters.

# (Note that currently both CHAR_CLEAR and CHAR_MULTI monsters are treated as
# normal monsters that are just hard to see... if you (l)ook for them, you will
# find them unless they are invisible and you cannot see invisible, and if you
# use the * command for targetting mode you can pick them as a target.)

# TODO: Explain the other monster and spell flags. But maybe in another file.


*/
