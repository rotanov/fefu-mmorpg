#include "MainWindow.hpp"
#include "ui_mainwindow.h"

#include "DebugStream.hpp"
#include "Server.hpp"
#include "GameServer.hpp"

#include <iostream>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    this->setWindowTitle("Server Control");
    ui->qpteLog->setFont(QFont("Consolas", 12));

#if (_DEBUG)
    debugStreamCout_ = new DebugStream(std::cout, ui->qpteLog);
    debugStreamCerr_ = new DebugStream(std::cerr, ui->qpteLog);
#endif

    server_ = new Server;
    gameServer_ = new GameServer;

    connect(server_
            , &Server::newFEMPRequest
            , gameServer_
            , &GameServer::handleFEMPRequest
            , Qt::DirectConnection);

    connect(server_
            , &Server::wsAddressChanged
            , gameServer_
            , &GameServer::setWSAddress
            , Qt::DirectConnection);

    connect(gameServer_
            , &GameServer::broadcastMessage
            , server_
            , &Server::broadcastMessage);

    std::cout << QObject::tr("main thread : 0x%1")
                 .arg(QString::number((unsigned int)QThread::currentThreadId(), 16))
                 .toStdString() << std::endl;

    on_qpbToggleServerState_clicked();
}

MainWindow::~MainWindow()
{
    delete gameServer_;
    delete server_;
    delete ui;
    delete debugStreamCout_;
    delete debugStreamCerr_;
}

void MainWindow::on_qpbToggleServerState_clicked()
{
    static bool running = false;

    if (!running)
    {
        server_->Start();
        gameServer_->Start();
        ui->qpbToggleServerState->setText("&Stop");
    }
    else
    {
        server_->Stop();
        gameServer_->Stop();
        ui->qpbToggleServerState->setText("&Start");
    }

    running = !running;
}

void MainWindow::on_qpbClear_clicked()
{
    ui->qpteLog->clear();
}
