#include "Player.hpp"

Player::Player()
{
    type_ = "player";
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

unsigned Player::GetClientTick() const
{
    return clientTick_;
}

void Player::SetClientTick(const unsigned clientTick)
{
    clientTick_ = clientTick;
}
