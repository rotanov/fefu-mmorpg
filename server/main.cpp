#include <iostream>

#include "MainWindow.hpp"
#include <QApplication>
#include <QtMessageHandler>

void HandleQDebugMessageOutput(QtMsgType type
                             , const QMessageLogContext& context
                             , const QString &msg)
{
  Q_UNUSED(context);

  QByteArray localMsg = msg.toLocal8Bit();
  //    FILE* logfile = fopen("logFilename.log", "a");
  //    fprintf(logfile, "%s (%s:%u, %s)\n", localMsg.constData(), context.file, context.line, context.function);
  //    fclose(logfile);

  static std::string messageDescriptions [] =
  {
    "Debug",
    "Warning",
    "Critical",
    "Fatal",
  };

  QString completeMessage = QString().fromStdString(messageDescriptions[type])
      + QString(": %1\n");// (%2:%3, %4)\n");

  completeMessage = completeMessage
      .arg(localMsg.constData());
  //  uncomment for additional info
  //                      .arg(context.file)
  //                      .arg(context.line)
  //                      .arg(context.function);

  std::cerr << completeMessage.toStdString();
  //    std::cout << completeMessage.toStdString();

  //    std::cerr.flush();
  std::cout.flush();

  fprintf(stderr, "%s", completeMessage.toStdString().c_str());

  fflush(stderr);
  fflush(stdout);
}

int main(int argc, char **argv)
{
#if (_DEBUG)
  qInstallMessageHandler(HandleQDebugMessageOutput);
#endif

  QApplication a(argc, argv);
  MainWindow w;
  w.show();

  return a.exec();
}
