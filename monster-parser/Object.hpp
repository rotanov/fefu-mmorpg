#pragma once

#include <QString>
#include <QStringList>

#include <iostream>
#include <fstream>

using namespace std;
class Object {
public:
    QString name;
    QString G;
    QString I;
    QString W;
    QString P;
    QString A;
    QString C;
    QString M;
    QString E;
    QStringList F;
    QStringList L;
    QStringList D;

    Object();
    Object(string);

    void AddToDataBase();
};
/*# File: object.txt
#
# This file is used to initialize the "object kind" information for Angband.
# Modifying this file when you don't know what you're doing may be harmful
# to you or your character's health.  It could possibly be considered cheating
# under some circumstances, too. :)

# === Understanding object.txt ===

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
# D: description

# Some fields accept randomized numbers of the form "10+2d3M4" where
# 10 is the non-variable base, 2d3 is a standard die roll, and
# M4 uses the m_bonus function to generate a number between 0 and
# 4 according to a normal distribution.  All three components are
# optional, and the number of dice is optional and assumed to be 1
# when not specified.  10+2d3M4 has the range 12-20.  10+M4 has the
# range 10-14.  10+2d3 has the range 12-16.  10+d3 has the range 11-13.
# 2d3, d3, M4, 2d3M4, and d3M4 are all acceptable as well.

# 'N' indicates the beginning of an entry. The serial number must
# increase for each new item. The '&' and '~' symbols are use to
# include articles and pluralization as necessary to ensure
# grammatical correctness in object descriptions.
#
# For non-English and irregular plurals, the '|' symbol may be used
# instead, as in "|singular|plural|". The part between the first and
# second | symbol is used for singular, and the part between the second
# and third | for plural.  The number of | symbols in the name must
# always be a multiple of 3.

# 'G' is for graphics - symbol and color. There are 15 colors, as
# follows:

# D - Dark Gray    w - White          s - Gray          o - Orange
# r - Red          g - Green          b - Blue          u - Brown
# W - Light Gray   v - Violet         y - Yellow        R - Light Red
# G - Light Green  B - Light Blue     U - Light Brown
# Another color, "d", is used for "flavoured" items.

# 'I' is for basic information. The tval is for the type of item, the
# sval identifies the subtype.

# 'W' is for extra information. Depth defines what "level" the object is,
# when determining how easy it is to use a wand, staff or rod; rarity
# is unused; weight is in tenth-pounds and cost is the item's base value.
# N.B. Even where the cost field is not used to determine price (e.g. for
# rings and amulets), it is still used to determine whether it is squelched
# by the squelch_worthless option.

# 'P' is for power information. The items base armor class, its base
# damage and pluses to-hit, to-dam and to-ac.  The latter three numbers
# accept randomized values.

# 'A' is for allocation - depth and rarity, in pairs. It is used to
# ensure that certain vital items such as food and identify scrolls
# are found throughout the dungeon. The "allocation" depth need not
# match the depth as specified in the "W:" line.

# 'C' is for charges (wands and staves only).  This field accepts
# randomized values.

# 'F' is for flags not associated with any pval. These are fairly
# self-explanatory. As many F: lines may be used as are needed to
# specify all the flags and flags are separated by the '|' symbol.

# 'L' is for pval and flags specific to that pval. Each pval and its flags
# need a line to themselves. MAX_PVALS is defined in src/defines.h - you
# will need to recompile if you wish to change this value. A pval can
# take a random value.

# 'D' is for description. As many D: lines may be used as are needed
# to describe the object. Note that lines will need spaces at their
# ends or the beginning of the next line to prevent words from running
# together.*/
