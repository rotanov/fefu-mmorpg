CONFIG += ordered

TEMPLATE = subdirs

SUBDIRS += 3rd/qhttpserver \
           server

#?
server.depends = 3rd/qhttpserver
