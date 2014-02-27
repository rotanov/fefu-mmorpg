CONFIG += ordered

TEMPLATE = subdirs

SUBDIRS += 3rd/qhttpserver \
           3rd/QtWebsocket \
           server

server.depends += qhttpserver \
                  QtWebsocket
                  