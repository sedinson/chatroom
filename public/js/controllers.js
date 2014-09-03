'use strict';

app.controller('ChatCtrl', function ($scope, socket) {
	/*
		Objects in the scope
	 */
	$scope.messages = [];
	$scope.message = "";
	$scope.typing = "";
	$scope.users = [];
	$scope.name = "";

	/*
		First load of the chat
	 */
	socket.on('init', function (data) {
		$scope.messages = data.messages;
		$scope.users = data.users;
		$scope.name = data.name;

		/*
			Find if user has a name and try to setup
		 */
		var name = localStorage.getItem('name');
		if (name) {
			edit(name, function (err) {
				if(err) {
					$scope.messages.push({
						provider: 'chatroom',
						message: name + ' is already in use.',
						name: 'chatroom'
					});
				}
			});
		}

		setTimeout(function () {
			scrulling();
		}, 250);
	});

	/*
		If an user has left, remove from the user list
	 */
	socket.on('user:left', function (data) {
		$scope.messages.push({
			provider: 'chatroom',
			message: 'User ' + data.name + ' has left.',
			name: 'chatroom'
		});

		var i = $scope.users.indexOf(data.name);
		scrulling();

		if(i >= 0) {
			$scope.users.splice(i, 1);
		}
	});

	/*
		If an user has joined, push to the user list
	 */
	socket.on('user:join', function (data) {
		$scope.messages.push({
			provider: 'chatroom',
			message: 'User ' + data.name + ' has joined.',
			name: 'chatroom'
		});

		$scope.users.push(data.name);
		scrulling();
	});

	/*
		If an user has changed his name
	 */
	socket.on('user:name', function (data) {
		rename(data.old, data.name);

		$scope.messages.push({
			provider: 'chatroom',
			message: 'User ' + data.old + ' is now called as ' + data.name,
			name: 'chatroom'
		});
	});

	/*
		If an user has sent a message, push to the message list
	 */
	socket.on('send:message', function (data) {
		$scope.messages.push({
			provider: 'user',
			message: data.message,
			name: data.name
		});

		typing.hide();
		scrulling();
	});

	/*
		If an user is typing a message
	 */
	socket.on('send:typing', function (data) {
		$scope.typing = data.name;
		typing.show();
	});

	/*
		KeyPress event on the message text
		----------------------------------
		If the user press enter, then the message will be sent, otherwise
		the status is market as 'writting a message'
	 */
	$scope.sendMessage = function (e) {
		var code = e.keyCode || e.which;
		
		/*
			If the user press enter key
		 */
		if(code == 13) {
			e.preventDefault();

			if($scope.message.length > 0) {
				socket.emit('send:message', {
					message: $scope.message
				});

				$scope.messages.push({
					provider: 'me',
					message: $scope.message,
					name: $scope.name
				});

				$scope.message = "";
				scrulling();
			}
		} else {

			/*
				Notify that user is typing a message
			 */
			socket.emit('send:typing', {
				typing: true
			});
		}
	};

	/*
		Change username
		---------------
		If process is ok, then save the new username in
		local. When the page is reloaded, user is restored
		with this name
	 */
	$scope.edit = function () {
		var _new = prompt('Write a new username:');

		if(_new) {
			edit(_new, function (err) {
				if(err) {
					alert('Username is already in use');
				} else {
					localStorage.setItem('name', _new);
				}
			});
		}
	};

	/*
		Rename inside the users model
	 */
	var rename = function (_old, _new) {
		var i = $scope.users.indexOf(_old);

		if(i >= 0) {
			$scope.users[i] = _new;
		}
	};

	/*
		Change username
	 */
	var edit = function (_new, cb) {
		socket.emit('user:name', {
			name: _new
		}, function (data) {
			if(!data) {
				cb(true);
			} else {
				rename($scope.name, _new);
				$scope.name = _new;

				$scope.messages.push({
					provider: 'chatroom',
					message: 'You are now called as ' + _new,
					name: 'chatroom'
				});

				cb(false);
			}
		});
	};

	/*
		Process to show/hide the message 'user is typing something...'
	 */
	var typing = {
		counter: 100,
		show: function () {
			typing.counter = 0;
		},

		hide: function () {
			typing.counter = 100;
		},

		/**
		 * Verify if someone is typing...
		 * ------------------------------
		 *
		 * Recursive function that show/hide the message of
		 * someone is typing a message
		 */
		time: function () {
			typing.counter = Math.min(typing.counter+1, 100);

			$("#typing").css({
				display: (typing.counter < 100)? 'block' : 'none'
			});

			setTimeout(typing.time, 100);
		}
	};

	//Start the process of listen an user if is typing...
	typing.time();
});

/*
	Do scroll to the bottom of messages
 */
function scrulling () {
	var messages = $("#messages");

	$(".chat").animate({
		scrollTop: messages.height() + 20
	}, 150);
}