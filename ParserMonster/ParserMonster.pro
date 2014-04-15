TEMPLATE = app
CONFIG += console
CONFIG -= app_bundle
CONFIG -= qt

QMAKE_CXXFLAGS += -std=c++11
DEFINES += BOOST_ALL_NO_LIB

!build_pass:message($$INCLUDE)

INCLUDE = $$(INCLUDE)

!build_pass:message($$INCLUDE)

INCLUDE = $$split(INCLUDE, ;)

!build_pass:message($$INCLUDE)

for (path, INCLUDE):QMAKE_CXXFLAGS += -isystem $${path}

!build_pass:message($$INCLUDE)

!build_pass:message($$LIBS)

LIB = $$(LIB)

!build_pass:message($$LIBS)

LIB = $$split(LIB, ;)

!build_pass:message($$LIBS)

for(path, LIB):LIBS += -L$${path}

!build_pass:message($$LIBS)



SOURCES += main.cpp

HEADERS += \
    Monstr.h

