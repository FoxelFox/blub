'use strict';
var p2 = require('p2');
var clone = require('clone');

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
		this.events = [];
		this.bodies = {};
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

	onPlayerUpdate(update) {
		this.players[update.id].controls = update.controls;
	}

	onPlayerConnected() {
		var player = new Player(0.0, 0.0);
		this.players[player.body.id] = player;
		this.bodies[player.body.id] = clone(player.body);

		this.events.push({
			name: 'addBody',
			body: this.bodies[player.body.id]
		});

		this.world.addBody(player.body);
		return player.body.id;
	}

	onPlayerDisconnected(id) {
		this.world.removeBody(this.players[id].body);
		delete this.bodies[id];
		delete this.players[id];
		this.events.push({
			name: 'deleteBody',
			id: id
		});
	}
}

class Controller {


	constructor(io) {
		this.game = new Game();
		this.createSockets(io);
	}

	createSockets(io) {
		var self = this;
		io.on('connection', (socket) => {

			// create player
			var sessionID = self.game.onPlayerConnected(socket.id);

			// send players session id
			socket.emit('sessionID', sessionID);

			socket.on('disconnect', () => {
				self.game.onPlayerDisconnected(socket.id);
			});

			socket.on('chat message', (msg) => {
				io.emit('chat log', msg);
			});

			socket.on('player:update', (update) => {
				self.game.onPlayerUpdate(JSON.parse(update));
			});

			setInterval(() => {
				self.game.update();

				var update = {
					bodies: {},
					events: self.game.events
				};
				self.game.world.bodies.forEach((body) => {
					update.bodies[body.id] = {
						px: body.position[0],
						py: body.position[1],
						vx: body.velocity[0],
						vy: body.velocity[1],
						fx: body.force[0],
						fy: body.force[1]
					};
				});

				io.emit('server:update', JSON.stringify(update));

				// clear events
				self.game.events = [];
			}, 50);
		});
	}
}

module.exports = Controller;
