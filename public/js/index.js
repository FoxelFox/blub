var app = angular.module('App', []);
var game = new Game();

window.onload = game.init;

app.controller('indexController', function(socket) {

	socket.on('player:load', function (res) {
		game.onPlayerLoad(res, function () {
			socket.emit('player:join', {}, function (res) {
				game.onJoin(res);
			});
		});
	});

	socket.on('game:spawn', function(res) {
		game.onSpawn(res);
	});

	socket.on('server:update', function(res) {
		game.addServerUpdate(JSON.parse(res));
		socket.emit('player:update', JSON.stringify(game.getLocalPlayerUpdate()));
	});
});
