QT += core
QT += gui
QT += sql

TEMPLATE = app

QMAKE_CXXFLAGS += -std=c++11

SOURCES += main.cpp \
    DataBase.cpp \
    Monster.cpp

HEADERS += \
    DataBase.hpp \
    Monster.hpp

