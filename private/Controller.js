'use strict';
var Game = require('./Game');
var ProtoBuf = require('protobufjs');

class Controller {
	constructor(io) {
		this.game = new Game();
		this.initProtoBuf();
		this.socket(io);
	}

	socket(io) {
		io.on('connection', (socket) => {

			// send players session id and all gameObjects
			socket.emit('game:join', { "data" : this.createJoinPaket(socket.id) });

			// create player
			this.game.onPlayerConnected(socket);

			socket.on('game:quit', () => {
				this.game.onPlayerDisconnected(socket.id);
			});

			socket.on('chat:message', (msg) => {
				io.emit('chat log', msg);
			});

			socket.on('player:update', (update) => {
				this.game.onPlayerUpdate(JSON.parse(update));
			});
		});

		setInterval(() => {
			this.game.update();

			io.emit('server:update', this.createUpdatePaket());

			this.game.sessionEvents.forEach((sEvent) => {
				sEvent.socket.emit('game:spawn', sEvent.gameObjectID);
			});

			// clear events
			this.game.sessionEvents = [];
			this.game.globalEvents = [];
		}, 50);
	}

	initProtoBuf() {
		this.protoBuilder = ProtoBuf.loadProtoFile(__dirname+"/../public/shared/Protocol.proto").build();
	}

	createJoinPaket(socketID) {
		var join = new this.protoBuilder.Join();
		join.sessionID = socketID;
		join.gos = this.game.getNetGameObjects(true);
		console.log("  SESSIONID  send: " + join.sessionID);
		return join.encode().toBuffer();
	}

	createUpdatePaket() {
		var update = this.protoBuilder.Update;
		update.gos = this.game.getNetGameObjects(false);
		update.events = this.game.globalEvents;
		return update.encode().toBuffer();
	}

}

module.exports = Controller;
