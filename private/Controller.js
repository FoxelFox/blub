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

			// send players session id and all infos for preload
			socket.emit('player:load', createLoadPaket(socket.id));

			// send player all gameObjects
			socket.on('player:join', (emptyData, joinCallback) => {
				// send current game data
				joinCallback(createJoinPaket());
				// create the player
				this.game.onPlayerConnected(socket);
			});

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

	createLoadPaket(socketID) {
		var load = new this.protoBuilder.Load();
		load.sessionID = socketID;
		load.models = [ 'model/player.json' ];
		return { data : load.encode().toBuffer(); };
	}

	createJoinPaket() {
		var join = new this.protoBuilder.Join();
		join.gos = this.game.getNetGameObjects(true);
		return { data : join.encode().toBuffer(); };
	}

	createUpdatePaket() {
		var update = new this.protoBuilder.Update();
		update.gos = this.game.getNetGameObjects(false);
		update.events = this.game.globalEvents;
		return { data : update.encode().toBuffer(); };
	}

}

module.exports = Controller;
