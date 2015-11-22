'use strict';
var Game = require('./Game');

class Controller {
	constructor(io) {
		this.game = new Game();
		this.socket(io);
	}

	socket(io) {
		io.on('connection', (socket) => {

			// send players session id and all infos for preload
			socket.emit('player:load', {
				sessionID: socket.id,
				models: [
					'model/player.json'
				]
			});

			socket.on('player:join', (emptyData, joinCallback) => {
				// send current game data
				joinCallback({
					gameObjects: this.game.getGameObjects(true)
				});
				// create the player
				this.game.onPlayerConnected(socket);
			});

			socket.on('disconnect', () => {
				this.game.onPlayerDisconnected(socket.id);
			});

			socket.on('chat message', (msg) => {
				io.emit('chat log', msg);
			});

			socket.on('player:update', (update) => {
				this.game.onPlayerUpdate(JSON.parse(update));
			});
		});

		setInterval(() => {
			this.game.update();

			var update = {
				gameObjects: this.game.getGameObjects(false),
				globalEvents: this.game.globalEvents
			};

			io.emit('server:update', JSON.stringify(update));

			this.game.sessionEvents.forEach((sEvent) => {
				sEvent.socket.emit('game:spawn', sEvent.gameObjectID);
			});

			// clear events
			this.game.sessionEvents = [];
			this.game.globalEvents = [];
		}, 50);
	}
}

module.exports = Controller;
