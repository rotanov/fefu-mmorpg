#pragma once

#include <QSqlDatabase>

class DataBase
{
public:
    DataBase();
    bool Connect();
    void Disconnect();
    void CreateTable();

    bool ExecQuery_(QSqlQuery& query);
    bool ExecQuery_(QString query);

private:
    QSqlDatabase db_;
};

