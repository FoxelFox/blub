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

class Playfield {
	constructor(world, width, height) {
		this.width = width;
		this.height = height;

		// Borders
		this.borderBody = new p2.Body({ mass: 0});
		this.borderBody.addShape(new p2.Plane(), [0, height / 2], Math.PI);
		this.borderBody.addShape(new p2.Plane(), [0, -height / 2], 0);
		this.borderBody.addShape(new p2.Plane(), [height / 2, 0], Math.PI / 2);
		this.borderBody.addShape(new p2.Plane(), [-height / 2, 0], -Math.PI / 2);
		this.clone = clone(this.borderBody);
		world.addBody(this.borderBody);
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

		var level = new Playfield(this.world, 50, 50);
		this.bodies.push(level.clone);
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
