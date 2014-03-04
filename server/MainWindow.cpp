#include "MainWindow.hpp"
#include "ui_mainwindow.h"

#include "DebugStream.hpp"
#include "server.hpp"
#include "ServerThreaded.h"

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);

    debugStreamCout_ = new DebugStream(std::cout, ui->qpteLog);
    debugStreamCerr_ = new DebugStream(std::cerr, ui->qpteLog);

    ui->qpteLog->setFont(QFont("Consolas", 12));

    ServerThreaded* myThreadedServer = new ServerThreaded;
    MyServer* server = new MyServer;
    std::cout << QObject::tr("main thread : 0x%1")
                 .arg(QString::number((unsigned int)QThread::currentThreadId(), 16))
                 .toStdString() << std::endl;
}

MainWindow::~MainWindow()
{
    delete ui;
    delete debugStreamCout_;
    delete debugStreamCerr_;
}
