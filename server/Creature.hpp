#pragma once

#include "GameObject.hpp"

class Creature : public GameObject
{
public:
    Creature();
    virtual ~Creature();

    float GetHealth() const;
    void SetHealth(const float health);

    float GetMaxHealth() const;
    void SetMaxHealth(const float maxHealth);

private:
    float health_ = 100.0f;
    float maxHealth_ = 100.0f;
};
