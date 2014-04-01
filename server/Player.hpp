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

private:
    QString login_;
};
