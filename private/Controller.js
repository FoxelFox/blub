'use strict';
var Game = require('./Game');
var ProtoBuf = require('protobufjs');
var useProtoBuf = false;

class Controller {
	constructor(io) {
		this.game = new Game();
		this.initProtoBuf();
		this.socket(io);
	}

	socket(io) {
		io.on('connection', (socket) => {

			// send players session id and all infos for preload
			socket.emit('player:load', this.createLoadPaket(socket.id));

			// send player all gameObjects
			socket.on('player:join', (emptyData, joinCallback) => {
				// send current game data
				joinCallback(this.createJoinPaket());
				// create the player
				this.game.onPlayerConnected(socket);
			});

			socket.on('disconnect', () => {
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
		this.protoBuilder = ProtoBuf.loadProtoFile(__dirname + "/../public/shared/Protocol.proto").build();
	}

	createLoadPaket(socketID) {
		if (useProtoBuf) {
			var load = new this.protoBuilder.Load();
			load.sessionID = socketID;
			load.models = ['model/player.json'];
			return {
				data: load.encode().toBuffer()
			};
		} else {
			return JSON.stringify({
				data: {
					sessionID: socketID,
					models: ['model/player.json']
				}
			});
		}
	}

	createJoinPaket() {
		if (useProtoBuf) {
			var join = new this.protoBuilder.Join();
			join.gos = this.game.getNetGameObjects(true);
			return {
				data: join.encode().toBuffer()
			};
		} else {
			return JSON.stringify({
				data: {
					gos: this.game.getNetGameObjects(true)
				}
			});
		}
	}

	createUpdatePaket() {
		if (useProtoBuf) {
			var update = new this.protoBuilder.Update();
			update.gos = this.game.getNetGameObjects(false);
			//update.events = this.game.globalEvents; // TODO: Events for protobuffers fix
			return {
				data: update.encode().toBuffer()
			};
		} else {
			return JSON.stringify({
				data: {
					gos: this.game.getNetGameObjects(false),
					globalEvents: this.game.globalEvents
				}
			});
		}
	}
}

module.exports = Controller;
