#include "server.hpp"

#include <QCoreApplication>

int main(int argc, char **argv)
{
    QCoreApplication app(argc, argv);
    MyServer server;
    app.exec();
}
