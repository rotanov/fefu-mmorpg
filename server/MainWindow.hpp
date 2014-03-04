#pragma once

#include <QMainWindow>

namespace Ui
{
    class MainWindow;
}

class DebugStream;

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = 0);
    ~MainWindow();

private:
    Ui::MainWindow *ui;
    DebugStream* debugStreamCout_ = NULL;
    DebugStream* debugStreamCerr_ = NULL;
};
