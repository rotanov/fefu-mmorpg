#pragma once

#include <QString>

#include "GameObject.hpp"

class Player : public GameObject
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
