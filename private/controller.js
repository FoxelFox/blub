'use strict';
var p2 = require('p2');

class Player {
	constructor(x, y) {

		this.controls = {
			up: false,
			down: false,
			left: false,
			right: false
		};

		this.body = new p2.Body({
			mass: 5,
			position: [x, y]
		});

		var shape = new p2.Circle({
			radius: 1
		});

		this.body.addShape(shape);
	}
}

class Game {

	constructor() {
		this.players = {};
		this.world = new p2.World({
			gravity: [0.0, 0.0]
		});
	}

	update() {
		var self = this;
		Object.keys(self.players).forEach((key) => {
			var player = self.players[key];
			var force = 0.0;
			if (player.controls.up) {
				force = p2.vec2.fromValues(0.0, 10.0);
				p2.vec2.add(player.body.force, player.body.force, force);

			}
			if (player.controls.down) {
				force = p2.vec2.fromValues(0.0, -10.0);
				p2.vec2.add(player.body.force, player.body.force, force);
			}
			if (player.controls.left) {
				force = p2.vec2.fromValues(-10.0, 0.0);
				p2.vec2.add(player.body.force, player.body.force, force);
			}
			if (player.controls.right) {
				force = p2.vec2.fromValues(+10.0, 0.0);
				p2.vec2.add(player.body.force, player.body.force, force);
			}
		});
		this.world.step(0.05);
	}

	onPlayerUpdate(id, controls) {
		this.players[id].controls = controls;
	}

	onPlayerConnected(id) {

		this.players[id] = new Player(0.0, 0.0);
		this.world.addBody(this.players[id].body);
	}

	onPlayerDisconnected(id) {
		this.world.removeBody(this.players[id].body);
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
			socket.emit('sessionID', socket.id);

			self.game.onPlayerConnected(socket.id);

			socket.on('disconnect', function() {
				self.game.onPlayerDisconnected(socket.id);
			});

			socket.on('chat message', function(msg) {
				io.emit('chat log', msg);
			});

			socket.on('player:update', function(update) {
				self.game.onPlayerUpdate(socket.id, JSON.parse(update));
			});

			setInterval(function() {
				self.game.update();

				var update = {};
				Object.keys(self.game.players).forEach((key) => {
					var player = self.game.players[key];
					update[key] = {
						x: player.body.position[0],
						y: player.body.position[1]
					};
				});


				io.emit('server:update', JSON.stringify(update));
			}, 50);
		});
	}
}

module.exports = Controller;
