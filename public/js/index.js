var app = angular.module('App', []);
var game = new Game();

window.onload = game.init;
var ProtoBuf = dcodeIO.ProtoBuf;
var protoBuilder = ProtoBuf.loadProtoFile("./shared/Protocol.proto").build();

app.controller('indexController', function(socket) {

	socket.on('player:load', function (res) {
		var data = protoBuilder.Load.decode(res.data);
		game.onPlayerLoad(data, function () {
			socket.emit('player:join', {}, function (res) {
				game.onJoin(protoBuilder.Join.decode(res.data));
			});
		});
	});

	socket.on('game:join', function(res) {
		game.onGameJoin(protoBuilder.Join.decode(res.data));
	});

	socket.on('game:spawn', function(res) {
		game.onSpawn(res);
	});

	socket.on('server:update', function(res) {
		game.onServerUpdate(protoBuilder.Update.decode(res.data));
		socket.emit('player:update', JSON.stringify(game.getLocalPlayerUpdate()));
	});
});
