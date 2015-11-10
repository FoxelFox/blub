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
			position: [x, y],
			damping: 0.99
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
		this.sessionEvents = [];
		this.bodies = [];
		this.world = new p2.World({
			gravity: [0.0, 0.0]
		});
	}

	update() {
		var self = this;
		self.players.forEach((player) => {
			var force = p2.vec2.fromValues(0, 0);
			if (player.controls.up) {
				p2.vec2.add(force, force, p2.vec2.fromValues(0, +1));
			}
			if (player.controls.down) {
				p2.vec2.add(force, force, p2.vec2.fromValues(0, -1));
			}
			if (player.controls.left) {
				p2.vec2.add(force, force, p2.vec2.fromValues(-1, 0));
			}
			if (player.controls.right) {
				p2.vec2.add(force, force, p2.vec2.fromValues(+1, 0));
			}
			p2.vec2.normalize(force, force);
			p2.vec2.multiply(force, force, p2.vec2.fromValues(+200, +200));

			p2.vec2.add(player.body.force, player.body.force, force);
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

	onPlayerConnected(socket) {
		var player = new Player(socket.id, 0.0, 0.0);
		this.players[player.body.id] = player;
		var cloned = clone(player.body);
		this.bodies.push(cloned);
		this.world.addBody(player.body);

		this.events.push({
			name: 'addBody',
			body: cloned,
		});

		this.sessionEvents.push({
			name: 'spawn',
			socket: socket,
			playerBodyID: player.body.id
		});
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

			// send players session id
			socket.emit('game:join', {
				sessionID: socket.id,
				bodyIndex: self.game.bodies.length, // players bodyIndex in list
				bodies: self.game.bodies

			});

			// create player
			self.game.onPlayerConnected(socket);

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

			self.game.sessionEvents.forEach((sEvent) => {
				sEvent.socket.emit('game:spawn', sEvent.playerBodyID);
			});
			self.game.sessionEvents = [];
		}, 50);
	}
}

module.exports = Controller;
