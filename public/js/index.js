var app = angular.module('App', []);
var game = new Game();

window.onload = game.init;

app.controller('indexController', function(socket) {

	socket.on('sessionID', function(res) {
		game.setSessionID(res);
	});

	socket.on('server:update', function(res) {
		game.onServerUpdate(res);
		socket.emit('player:update', game.getLocalPlayerUpdate());
	});
});
