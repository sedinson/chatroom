/**
 * Chatroom APP start.
 */

var express = require('express')
  , socketio = require('socket.io')
  , websocket = require('./libs/websocket')
  , routes = require('./libs/routes')
  , http = require('http')
;

/**
 * Create the server
 */
var app = express()
  , server = http.createServer(app)
  , io = socketio.listen(server)
;

/**
 * Configure Server
 */
app.set(
	'views', __dirname + '/views'
).set(
	'view engine', 'jade'
).set(
	'view options', {
		layout: false
	}
).use(
	express.static(__dirname + '/public')
);

/**
 * Methods
 */
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

/**
 * WebSockets or polling
 */
io.sockets.on('connection', websocket);

/**
 * Start Server
 */
server.listen(8080, function () {
	console.log("Server listening at %s:%d", server.address().address, server.address().port);
});