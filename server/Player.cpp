#include "Player.hpp"

Player::Player()
{

}

Player::~Player()
{

}

QString Player::GetLogin() const
{
    return login_;
}

void Player::SetLogin(const QString login)
{
    login_ = login;
}
