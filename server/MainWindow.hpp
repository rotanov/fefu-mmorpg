#pragma once

#include <QMainWindow>

namespace Ui
{
    class MainWindow;
}

class DebugStream;
class Server;
class GameServer;

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = 0);
    ~MainWindow();

private slots:
    void on_qpbToggleServerState_clicked();

private:
    Ui::MainWindow *ui = NULL;
    DebugStream* debugStreamCout_ = NULL;
    DebugStream* debugStreamCerr_ = NULL;
    Server* server_ = NULL;
    GameServer* gameServer_ = NULL;
};
