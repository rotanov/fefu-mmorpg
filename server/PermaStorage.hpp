#pragma once

#include <QSqlDatabase>

class PermaStorage
{
public:
    PermaStorage();

    bool Connect();
    void Disconnect();
    void Reset();
    void DropAll();
    void InitSchema();

private:
    QSqlDatabase db_;

};
