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
		Send to the new user his username and user list
	 */
	socket.emit('init', {
		users: users.get(),
		name: name
	});

	/*
		Notify to the other users that a new user has connected
	 */
	socket.broadcast.emit('user:join', {
		name: name
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

	/*
		Broadcast a user's message to other users
	 */
	socket.on('send:message', function (data) {
		socket.broadcast.emit('send:message', {
			message: data.message,
			name: name
		});
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
};