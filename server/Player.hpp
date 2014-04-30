#pragma once

#include <QString>

#include "Creature.hpp"

class Player : public Creature
{
public:
    Player();
    virtual ~Player();

    QString GetLogin() const;
    void SetLogin(const QString login);
    unsigned GetClientTick() const;
    void SetClientTick(const unsigned clientTick);

private:
    QString login_;
    unsigned clientTick_ = 0;
};
