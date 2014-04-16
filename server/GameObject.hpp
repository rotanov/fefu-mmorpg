#pragma once

#include "Actor.hpp"

class GameObject : public Actor
{
public:
    GameObject();
    virtual ~GameObject();

    int GetId() const;
    void SetId(int id);

    virtual void OnCollideWorld();

private:
    int id_ = -1;
};
