#include "GameObject.hpp"

GameObject::GameObject()
{

}

GameObject::~GameObject()
{

}

int GameObject::GetId() const
{
    return id_;
}

void GameObject::SetId(int id)
{
    id_ = id;
}