#pragma once

#include <QSqlDatabase>

class DataBase
{
public:
    DataBase();
    bool Connect();
    void Disconnect();
    void CreateTable();
    void CreateTableItem();
    bool ExecQuery_(QSqlQuery& query);
    bool ExecQuery_(QString query);

private:
    QSqlDatabase db_;
};
void AddToDataBase();
void AddToDataBaseItem();
