TARGET = server

QT += network
QT -= gui

QMAKE_CXXFLAGS += -std=c++11

CONFIG += debug

INCLUDEPATH += ../3rd/qhttpserver \
    ../3rd/QtWebsocket \
    ../3rd/rapidjson

LIBS += -L../3rd/lib
DESTDIR = ../bin

win32 {
    debug: LIBS += -lqhttpserverd
    else: LIBS += -lqhttpserver
} else {
    LIBS += -lqhttpserver
}

LIBS += -lQtWebsocket

SOURCES += Server.cpp \
    ServerThreaded.cpp \
    SocketThread.cpp \
    main.cpp

HEADERS += Server.hpp \
    ServerThreaded.h \
    SocketThread.h
