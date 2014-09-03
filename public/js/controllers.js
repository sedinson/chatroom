'use strict';

app.controller('ChatCtrl', function ($scope, socket) {
	$scope.messages = [];
	$scope.message = "";
	$scope.users = [];
	$scope.name = "";

	socket.on('init', function (data) {
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
			user: 'chatroom'
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
			user: 'chatroom'
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
			user: data.name
		});

		scrulling();
	});

	/*
		KeyPress event on the message text
		----------------------------------
		If the user press enter, then the message will be sent, otherwise
		the status is market as 'writting a message'
	 */
	$scope.keyPress = function (e) {
		var code = e.keyCode || e.which;
		
		if(code == 13) {
			e.preventDefault();

			socket.emit('send:message', {
				message: $scope.message
			});

			$scope.messages.push({
				provider: 'me',
				message: $scope.message,
				user: $scope.name
			});

			$scope.message = "";
			scrulling();
		}
	};
});

function scrulling () {
	var messages = $("#messages");

	$(".chat").animate({
		scrollTop: messages.height() + 20
	}, 150);
}