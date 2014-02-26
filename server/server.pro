TARGET = server

QT += network
QT -= gui

QMAKE_CXXFLAGS += -std=c++11

CONFIG += debug

INCLUDEPATH += ../3rd/qhttpserver
LIBS += -L../3rd/lib
DESTDIR = ../bin

win32 {
    debug: LIBS += -lqhttpserverd
    else: LIBS += -lqhttpserver
} else {
    LIBS += -lqhttpserver
}

SOURCES += server.cpp \
    main.cpp

HEADERS += server.hpp
