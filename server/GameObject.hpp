#pragma once

#include <QString>

#include "Actor.hpp"

class GameObject : public Actor
{
public:
    GameObject();
    virtual ~GameObject();

    int GetId() const;
    void SetId(int id);

    virtual void OnCollideWorld();

    QString GetType() const;

protected:
    int id_ = -1;
    QString type_ = "undefined";
};
