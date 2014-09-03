'use strict';

app.controller('ChatCtrl', function ($scope, socket) {
	$scope.messages = [];
	$scope.message = "";
	$scope.users = [];
	$scope.name = "";

	/*
		First load of the chat
	 */
	socket.on('init', function (data) {
		$scope.messages = data.messages;
		$scope.users = data.users;
		$scope.name = data.name;
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
		If an user has sent a message, push to the message list
	 */
	socket.on('send:message', function (data) {
		$scope.messages.push({
			provider: 'user',
			message: data.message,
			name: data.name
		});

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
		KeyPress event on the message text
		----------------------------------
		If the user press enter, then the message will be sent, otherwise
		the status is market as 'writting a message'
	 */
	$scope.sendMessage = function (e) {
		var code = e.keyCode || e.which;
		
		if(code == 13) {
			e.preventDefault();

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
	};

	/*
		Rename inside the users model
	 */
	var rename = function (_old, _new) {
		var i = $scope.users.indexOf(_old);

		if(i >= 0) {
			$scope.users[i] = _new;
		}
	}

	/*
		Change username
	 */
	$scope.edit = function () {
		var _new = prompt('Write a new username:');

		socket.emit('user:name', {
			name: _new
		}, function (data) {
			if(!data) {
				alert('Username is already in use');
			} else {
				rename($scope.name, _new);
				$scope.name = _new;

				$scope.messages.push({
					provider: 'chatroom',
					message: 'You are now called as ' + _new,
					name: 'chatroom'
				});
			}
		});
	}
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