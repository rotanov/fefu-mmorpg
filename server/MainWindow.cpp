#include "MainWindow.hpp"
#include "ui_mainwindow.h"

#include "server.hpp"
#include "ServerThreaded.h"

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);

    ServerThreaded* myThreadedServer = new ServerThreaded;
    MyServer* server = new MyServer;
    std::cout << QObject::tr("main thread : 0x%1")
                 .arg(QString::number((unsigned int)QThread::currentThreadId(), 16))
                 .toStdString() << std::endl;
}

MainWindow::~MainWindow()
{
    delete ui;
}
