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

    LIBS += -lQtWebsocketd
    LIBS += -lqhttpserverd
    TARGET = server-debug

} else {

    LIBS += -lQtWebsocket
    LIBS += -lqhttpserver
    TARGET = server-release

}

SOURCES += Server.cpp \
    main.cpp \
    MainWindow.cpp \
    DebugStream.cpp

HEADERS += Server.hpp \
    MainWindow.hpp \
    DebugStream.hpp

FORMS += \
    mainwindow.ui
