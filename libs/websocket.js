var db = require("mongojs").connect(
		'mongodb://localhost:27017/chatroom', ['conversations']
	)
  , moment = require('moment')
;

/**
 * Contains all user information
 * 
 * @return {Object} Methods to work with users
 */
var users = (function () {
	return {
		list: {},

		/**
		 * Return a list of online users
		 * 
		 * @return {Array} List of online users
		 */
		get: function () {
			return Object.keys(users.list);
		},

		/**
		 * Methods of Generate Object
		 * --------------------------
		 * - reserve
		 * - guest
		 * - release
		 * 
		 * @type {Object}
		 */
		generate: {
			/**
			 * Generate a new reserve for a name if it is available
			 * 
			 * @param  {String} name   Name to be reserve
			 * @param  {Socket} socket Connection socket
			 * @return {Boolean}       If could be reserved return true, otherwise return false
			 */
			reserve: function (name, socket) {
				var sw = (name && !users.list[name]);
				
				if(sw) {
					users.list[name] = socket;
				}

				return sw;
			},

			/**
			 * Find a Minimal Available Name (MAN)
		  	 * -----------------------------------
		  	 * To getting a MAN, we need to find the minimum possible name 
		  	 * (Guest{Number}) and stop when a name was found available
		  	 * 
			 * @param  {Socket} socket Connection socket
			 * @return {String}        Name generated
			 */
			guest: function (socket) {
				var name = null
				  , i = 0
			  	;

			  	do {
			  		name = 'Guest' + (++i);
			  	} while(!users.generate.reserve(name, socket));

			  	return name;
			},

			/**
			 * Release a name and set available again
			 * 
			 * @param  {String} name Name to be released
			 * @return {Boolean}     Return true if the name was released
			 */
			release: function (name) {
				if(users.list[name]) {
					delete users.list[name];

					return true;
				}

				return false;
			}
		}
	};
}());

/**
 * When a new connection is stablished with a client,
 * created this connection socket.
 * 
 * @param  {Socket} socket Client
 * @return {[type]}        [description]
 */
module.exports = function (socket) {
	var name = users.generate.guest(socket);

	/*
		Select last 20 messages from DB
	 */
	var tmp = db.conversations.find({}).sort({
		date: -1
	}).limit(20).toArray(function (err, docs) {
		var _m = [];

		for(var i in docs) {
			delete docs[i]._id;
			_m.unshift(docs[i]);
		}

		/*
			Send to the new user his username and user list
		 */
		socket.emit('init', {
			users: users.get(),
			name: name,
			messages: _m
		});
	});

	/*
		Notify to the other users that a new user has connected
	 */
	socket.broadcast.emit('user:join', {
		name: name
	});

	/*
		Try to change the username
	 */
	socket.on('user:name', function (data, cb) {
		if(users.generate.reserve(data.name, socket)) {
			users.generate.release(name);

			old = name;
			name = data.name;

			socket.broadcast.emit('user:name', {
				name: name,
				old: old
			});

			cb(true);
		} else {
			cb(false);
		}
	});

	/*
		Broadcast a user's message to other users
	 */
	socket.on('send:message', function (data) {
		var _m = {
			date: moment().format('YYYY-MM-DD HH:mm:ss S:SS'),
			message: data.message,
			name: name
		};

		//Save in DB and broadcast the message
		db.conversations.save(_m, function (err, result) {
			if(err || !result) {
				console.log("Error saving...");
			} else {
				socket.broadcast.emit('send:message', _m);
			}
		});
	});

	/*
		Broadcast that the user is typing a message
	 */
	socket.on('send:typing', function (data) {
		socket.broadcast.emit('send:typing', {
			name: name
		});
	});

	/*
		If the user has disconnected, then release the username
		and notify to the other users.
	 */
	socket.on('disconnect', function () {
		if(users.generate.release(name)) {
			socket.broadcast.emit('user:left', {
				name: name
			});
		}
	});
};