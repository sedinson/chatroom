/**
 * Chatroom APP start.
 */

var express = require('express')
  , socketio = require('socket.io')
  , websocket = require('./libs/websocket')
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
	'/public', express.static(__dirname + '/public')
);

/**
 * Method to load and render the main page.
 */
app.get('/', function (req, res) {
	res.render('index');
});

/**
 * Start to listen a new connection to the socket
 */
io.sockets.on('connection', websocket);

/**
 * Start Server
 */
server.listen(8080, function () {
	console.log("Server listening at %s:%d", server.address().address, server.address().port);
});