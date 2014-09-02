'use strict';

app.controller('ChatCtrl', function ($scope, socket) {
	$scope.messages = [];
	$scope.users = [];
	$scope.name = "";

	socket.on('init', function (data) {
		console.log(data);
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
	});

	socket.on('send:message', function (data) {
		//Aqui va la vaina
	});
});