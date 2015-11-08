'use strict';
var p2 = require('p2');
var clone = require('clone');

class Player {
	constructor(sessionID, x, y) {

		this.sessionID = sessionID;

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
		this.players = [];
		this.events = [];
		this.bodies = [];
		this.world = new p2.World({
			gravity: [0.0, 0.0]
		});
	}

	update() {
		var self = this;
		self.players.forEach((player) => {
			var force = 0.0;
			if (player.controls.up) {
				force = p2.vec2.fromValues(0.0, 25.0);
				p2.vec2.add(player.body.force, player.body.force, force);

			}
			if (player.controls.down) {
				force = p2.vec2.fromValues(0.0, -25.0);
				p2.vec2.add(player.body.force, player.body.force, force);
			}
			if (player.controls.left) {
				force = p2.vec2.fromValues(-25.0, 0.0);
				p2.vec2.add(player.body.force, player.body.force, force);
			}
			if (player.controls.right) {
				force = p2.vec2.fromValues(+25.0, 0.0);
				p2.vec2.add(player.body.force, player.body.force, force);
			}
		});
		this.world.step(0.05);
	}

	onPlayerUpdate(update) {
		var self = this;
		self.players.forEach((player) => {
			if (player.sessionID === update.sessionID) {
				player.controls = update.controls;
			}
		});
	}

	onPlayerConnected(sessionID) {
		var player = new Player(sessionID, 0.0, 0.0);
		this.players[player.body.id] = player;
		this.bodies.push(clone(player.body));

		this.events.push({
			name: 'addBody',
			body: this.bodies.slice(-1)
		});

		this.world.addBody(player.body);
	}

	onPlayerDisconnected(sessionID) {
		var self = this;
		this.players.forEach((player) => {
			if (player.sessionID === sessionID) {

				self.world.removeBody(player.body);

				var index = this.bodies.indexOf(player.body);
				this.bodies.splice(player.body, 1);
				this.players.splice(player.body, 1);
				this.events.push({
					name: 'removeBody',
					index: index
				});
			}
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
			self.game.onPlayerConnected(socket.id);

			// send players session id
			socket.emit('game:join', {
				sessionID: socket.id,
				bodyIndex: self.game.bodies.length - 1, // players bodyIndex in list
				bodies: self.game.bodies

			});

			socket.on('disconnect', () => {
				self.game.onPlayerDisconnected(socket.id);
			});

			socket.on('chat message', (msg) => {
				io.emit('chat log', msg);
			});

			socket.on('player:update', (update) => {
				self.game.onPlayerUpdate(JSON.parse(update));
			});
		});

		setInterval(() => {
			self.game.update();

			var update = {
				bodies: [],
				events: self.game.events
			};
			self.game.world.bodies.forEach((body) => {
				update.bodies.push({
					p: body.position,
					v: body.velocity,
					f: body.force
				});
			});

			io.emit('server:update', JSON.stringify(update));

			// clear events
			self.game.events = [];
		}, 50);
	}
}

module.exports = Controller;
