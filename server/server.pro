QT += network
QT -= gui

QMAKE_CXXFLAGS += -std=c++11

INCLUDEPATH += \
    ../3rd/qhttpserver \
    ../3rd/QtWebsocket \
    ../3rd/rapidjson \

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

HEADERS += Server.hpp \
    ServerThreaded.h \
    SocketThread.h \
