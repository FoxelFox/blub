var app = angular.module('App', []);
var game = new Game();

window.onload = game.init;

app.controller('indexController', function(socket) {

	socket.on('player:load', function (res) {
		var data = JSON.parse(res).data;

		game.onPlayerLoad(data, function () {
			socket.emit('player:join', {}, function (res) {
				game.onJoin(JSON.parse(res).data);
			});
		});
	});

	socket.on('game:join', function(res) {
	    game.onGameJoin(JSON.parse(res).data);
	});

	socket.on('game:spawn', function(res) {
		game.onSpawn(res);
	});

	socket.on('server:update', function(res) {
        game.addServerUpdate(JSON.parse(res).data);
		socket.emit('player:update', JSON.stringify(game.getLocalPlayerUpdate()));
	});
});
