var app = angular.module('App', []);
var game = new Game();

window.onload = game.init;
var ProtoBuf = dcodeIO.ProtoBuf;
var protoBuilder = ProtoBuf.loadProtoFile("./shared/Protocol.proto").build();

app.controller('indexController', function(socket) {

	socket.on('game:join', function(res) {
		game.onGameJoin(protoBuilder.Join.decode(res.data));
	});

	socket.on('game:spawn', function(res) {
		game.onSpawn(res);
	});

	socket.on('server:update', function(res) {
		var update = protoBuilder.Update.decode(res.data);
		game.onServerUpdate(res);
		socket.emit('player:update', JSON.stringify(game.getLocalPlayerUpdate()));
	});

});
