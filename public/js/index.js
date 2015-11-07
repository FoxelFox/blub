var app = angular.module('App', []);
var game = new Game();

window.onload = game.init;

app.controller('indexController', function(socket) {

	socket.on('sessionID', function(res) {
		game.setSessionID(res);
	});

	socket.on('server:update', function(res) {
		game.onServerUpdate(JSON.parse(res));
		socket.emit('player:update', JSON.stringify(game.getLocalPlayerUpdate()));
	});
});
