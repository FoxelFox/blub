var app = angular.module('App', []);
var game = new Game();

window.onload = game.init;
var ProtoBuf = dcodeIO.ProtoBuf;
var protoBuilder = ProtoBuf.loadProtoFile("./shared/Protocol.proto").build();
var useProtoBuf = true;

app.controller('indexController', function(socket) {

	socket.on('player:load', function (res) {
		var data
		if (useProtoBuf) {
			data = protoBuilder.Load.decode(res.data);
		} else {
			data = JSON.parse(res).data;
		}

		game.onPlayerLoad(data, function () {
			socket.emit('player:join', {}, function (res) {
				if (useProtoBuf) {
					game.onJoin(protoBuilder.Join.decode(res.data));
				} else {
					game.onJoin(JSON.parse(res).data);
				}
			});
		});
	});

	socket.on('game:join', function(res) {
		if (useProtoBuf) {
			game.onGameJoin(protoBuilder.Join.decode(res.data));
		} else {
			game.onGameJoin(JSON.parse(res).data);
		}
	});

	socket.on('game:spawn', function(res) {
		game.onSpawn(res);
	});

	socket.on('server:update', function(res) {
		if (useProtoBuf) {
			game.addServerUpdate(protoBuilder.Update.decode(res.data));
		} else {
			game.addServerUpdate(JSON.parse(res).data);
		}
		socket.emit('player:update', JSON.stringify(game.getLocalPlayerUpdate()));
	});
});
