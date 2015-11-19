var app = angular.module('App', []);
var game = new Game();

window.onload = game.init;
var ProtoBuf = dcodeIO.ProtoBuf;
var protoBuilder = ProtoBuf.loadProtoFile("./shared/Protocol.proto").build();

app.controller('indexController', function(socket) {

	socket.on('game:join', function(res) {
		var join = protoBuilder.Join.decode(res);
		//console.log(res);
		//game.onGameJoin(res);
	});

	socket.on('game:spawn', function(res) {
		game.onSpawn(res);
	});

	socket.on('server:update', function(res) {
		//var update = protoBuilder.Update.decode(res);
		//console.log(update);

		//game.onServerUpdate(JSON.parse(res));
		//socket.emit('player:update', JSON.stringify(game.getLocalPlayerUpdate()));
	});

});
