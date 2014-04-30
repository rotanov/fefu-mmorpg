#pragma once

#include <vector>

#include "Actor.hpp"

class Item;

class Creature : public Actor
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

    // represents creature's inventory
    std::vector<Item*> items_;
};
