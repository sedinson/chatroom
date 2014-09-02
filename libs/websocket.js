module.exports = function (socket) {
	socket.emit('init', {
		hello: 'world'
	});
};