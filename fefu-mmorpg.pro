CONFIG += ordered

TEMPLATE = subdirs

SUBDIRS += 3rd/qhttpserver \
           server
#           3rd/QtWebsocket \

server.depends += qhttpserver \
#                  QtWebsocket
