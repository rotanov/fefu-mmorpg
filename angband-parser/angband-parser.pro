QT += core
QT += gui
QT += sql
greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

TEMPLATE = app

QMAKE_CXXFLAGS += -std=c++11

QMAKE_CXXFLAGS += -Wextra
QMAKE_CXXFLAGS += -Werror

QMAKE_CXXFLAGS += -Wno-reorder
QMAKE_CXXFLAGS += -Wno-unused-local-typedefs
QMAKE_CXXFLAGS += -Wno-unused-variable

DESTDIR = ../bin

CONFIG(debug, debug|release) {

    DEFINES += \
        _DEBUG \
        QT_DEBUG_PLUGINS \

     TARGET = angband-parser-debug

} else {

    TARGET = angband-parser-release

}

SOURCES += main.cpp \
    DataBase.cpp \
    Monster.cpp

HEADERS += \
    DataBase.hpp \
    Monster.hpp

