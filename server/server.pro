QT += core
QT += gui
QT += network
greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

TEMPLATE = app

QMAKE_CXXFLAGS += -std=c++11

INCLUDEPATH += \
    ../3rd/qhttpserver \
    ../3rd/QtWebsocket \

LIBS += -L../3rd/lib
DESTDIR = ../bin

CONFIG(debug, debug|release) {

    DEFINES += \
        _DEBUG \

    LIBS += -lqhttpserverd
    TARGET = server-debug

} else {

    LIBS += -lqhttpserver
    TARGET = server-release

}

LIBS += -lQtWebsocket

SOURCES += Server.cpp \
    ServerThreaded.cpp \
    SocketThread.cpp \
    main.cpp \
    MainWindow.cpp \
    DebugStream.cpp

HEADERS += Server.hpp \
    ServerThreaded.h \
    SocketThread.h \
    MainWindow.hpp \
    DebugStream.hpp

FORMS += \
    mainwindow.ui
