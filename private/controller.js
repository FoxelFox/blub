'use strict';

class Player {
	constructor(x, y) {
		this.x = x;
		this.y = y;

		this.controls = {
			up: false,
			down: false,
			left: false,
			right: false
		};
	}
}

class Game {
	constructor() {
		this.players = {};
	}

	update() {
		var self = this;
		Object.keys(self.players).forEach((key) => {
			var player = self.players[key];
			if (player.controls.up) {
				player.y += 0.1;
			}
			if (player.controls.down) {
				player.y -= 0.1;
			}
			if (player.controls.left) {
				player.x -= 0.1;
			}
			if (player.controls.right) {
				player.x += 0.1;
			}
		});
	}

	onPlayerUpdate(id, controls) {
		this.players[id].controls = controls;
	}

	onPlayerConnected(id) {
		this.players[id] = new Player(0, 0);
	}

	onPlayerDisconnected(id) {
		delete this.players[id];
	}
}

class Controller {


	constructor(io) {
		this.game = new Game();
		this.createSockets(io);
	}

	createSockets(io) {
		var self = this;
		io.on('connection', function(socket) {
			socket.emit('sessionID', socket.io);

			self.game.onPlayerConnected(socket.id);

			socket.on('disconnect', function() {
				self.game.onPlayerDisconnected(socket.id);
			});

			socket.on('chat message', function(msg) {
				io.emit('chat log', msg);
			});

			socket.on('player:update', function(update) {
				self.game.onPlayerUpdate(socket.id, update);
			});

			setInterval(function() {
				self.game.update();
				io.emit('server:update', self.game.players);
			}, 20);
		});
	}
}

module.exports = Controller;
