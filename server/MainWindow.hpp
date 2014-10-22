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
  void on_qpbClear_clicked();

private:
  Ui::MainWindow *ui = nullptr;
  DebugStream* debugStreamCout_ = nullptr;
  DebugStream* debugStreamCerr_ = nullptr;
  Server* server_ = nullptr;
  GameServer* gameServer_ = nullptr;
};
