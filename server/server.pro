QT += core
QT += gui
QT += network
QT += sql
QT += websockets
greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

TEMPLATE = app

QMAKE_CXXFLAGS += -std=c++11

QMAKE_CXXFLAGS += -Wextra
QMAKE_CXXFLAGS += -Werror

# GCC handles C++11 class members inline
# initialization wrong in context of warnings
QMAKE_CXXFLAGS += -Wno-reorder
QMAKE_CXXFLAGS += -Wno-unused-local-typedefs
QMAKE_CXXFLAGS += -Wno-unused-variable

INCLUDEPATH += \
    ../3rd/qhttpserver \
#    ../3rd/QtWebsocket \
    ../3rd/deku2d \

LIBS += -L../3rd/lib
DESTDIR = ../bin

CONFIG(debug, debug|release) {

    DEFINES += \
        _DEBUG \
        QT_DEBUG_PLUGINS \

#    LIBS += -lQtWebsocketd
    LIBS += -lqhttpserverd
    TARGET = server-debug

} else {

#    LIBS += -lQtWebsocket
    LIBS += -lqhttpserver
    TARGET = server-release

}

SOURCES += Server.cpp \
    main.cpp \
    MainWindow.cpp \
    DebugStream.cpp \
    GameServer.cpp \
    WebSocketThread.cpp \
    PermaStorage.cpp \
    Actor.cpp \
    Player.cpp \
    Monster.cpp \
    ../3rd/deku2d/2de_Math.cpp \
    utils.cpp \
    LevelMap.cpp \
    Creature.cpp \
    Item.cpp \
    ../3rd/deku2d/2de_Box.cpp

HEADERS += Server.hpp \
    MainWindow.hpp \
    DebugStream.hpp \
    GameServer.hpp \
    WebSocketThread.hpp \
    PermaStorage.hpp \
    Actor.hpp \
    Player.hpp \
    Monster.hpp \
    utils.hpp \
    LevelMap.hpp \
    Creature.hpp \
    Item.hpp \
    ../3rd/deku2d/2de_Box.h

FORMS += \
    mainwindow.ui
