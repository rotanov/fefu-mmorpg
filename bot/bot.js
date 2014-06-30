var util = require('util')
var crypto = require('crypto')
var http = require('http')
var WebSocket = require('ws')

var httpServerAddress = 'http://localhost:6543'

function postRequest(object, onResponse) {
  onResponse = onResponse || function() {}

  var options = {
    host: 'localhost',
    port: 6543,
    method: 'POST'
  }

  var req = http.request(options, function(res) {
    res.setEncoding('utf8')
    var data = ""

    res.on('data', function (chunk) {
      data = data + chunk
    })

    res.on('end', function(pes) {
      onResponse(JSON.parse(data))
    })
    
  })

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message)
  })

  req.write(JSON.stringify(object))
  req.end()
}

function makeClient() {
  var login = crypto.randomBytes(9).toString('hex')
  var password = crypto.randomBytes(18).toString('hex')
  // console.log(login, password)

  var registerReq = {
    action: 'register',
    login: login,
    password: password,
  }

  postRequest(registerReq, function(response){
    // console.log(response)
  })

  var client = {
    login: function() {
      var loginObject = {
        action: 'login',
        login: login,
        password: password
      }
      var client = this
      postRequest(loginObject, function(response) {
        // console.log(response)
        if (response.result === 'ok') {
          client.id = response.id
          client.sid = response.sid
          client.ws = new WebSocket(response.webSocket)

          client.ws.on('open', function() {
            setInterval(client.tick.bind(client), 17)
          })

          client.ws.on('message', function(message) {
            //console.log('received: %s', message)
          })

          client.ws.on('close', function() {
            console.log('ws for id: %d closed', client.id)
          })
        }
      })
    },

    logout: function() {
      var request = {
        action: 'logout',
        sid: this.sid
      }
      this.ws.send(JSON.stringify(request))
    },

    tick: function() {
      var request = {
        action: 'move',
        direction: ['west', 'south', 'north', 'east'][Math.floor(Math.random() * 4)],
        sid: this.sid
      }
      this.ws.send(JSON.stringify(request))
    }
  }
  return client
}

var clientCount = 256

var clients = []

for (var i = 0; i < clientCount; i++) {
  var client = makeClient()
  client.login()
  clients[clients.length] = client
}

process.on('SIGINT', function() {
  console.log('\nShutting down from SIGINT (Ctrl-C)\n')
  for (var i = 0; i < clients.length; i++) {
    clients[i].logout()
    clients[i] = null
  }
  process.exit();
})