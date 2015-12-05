'use strict';
var p2 = require('p2');
var Player = require('./asset/Player');
var Playfield = require('./asset/Playfield');

class Game {
	constructor() {
		this.gameObjects = [];
		this.players = {};
		this.sessionEvents = [];
		this.globalEvents = [];
		this.world = new p2.World({
			gravity: [0.0, 0.0]
		});
		//this.addGameObject(new Playfield({
		//	height: 50,
		//	width: 50
		//}));
	}

	update() {
		this.gameObjects.forEach(obj => {
			obj.update();
		});
		this.world.step(0.05);
	}

	onPlayerConnected(socket) {
		var player = new Player({
			sessionID: socket.id,
			x: 0,
			y: 0
		});



		this.sessionEvents.push({
			name: 'spawn',
			socket: socket,
			gameObjectID: player.id
		});

		this.players[socket.id] = player;
		this.addGameObject(player);
	}

	onPlayerDisconnected(sessionID) {
		var go = this.players[sessionID];
		this.removeGameObject(go);
		delete this.players[sessionID];
	}

	onPlayerUpdate(update) {
		// just update controls
		if (this.players[update.sessionID]) {
			this.players[update.sessionID].getComponent('player').input = update.input;
		}
	}

	addGameObject(gameObject) {
		gameObject.game = this;
		this.gameObjects.push(gameObject);

		// if obj has a body then add it to the world
		var goBody = gameObject.getComponent('body');
		if (goBody)
			this.world.addBody(goBody.body);

		this.globalEvents.push({
			name: 'addGameObject',
			gameObject: gameObject.toNet(false)
		});
	}

	removeGameObject(gameObject) {
		// if obj has a body then remove it from the world
		var goBody = gameObject.getComponent('body').body;

		if (goBody)
			this.world.removeBody(goBody);

		// remove gameObject from list
		// TODO: is there any simpler way to do this?
		this.gameObjects.splice(this.gameObjects.indexOf(gameObject), 1);

		this.globalEvents.push({
			name: 'removeGameObject',
			gameObjectID: gameObject.id
		});
	}

	getNetGameObjects(isFull) {
		var go = [];
		var length = this.gameObjects.length;

		for (var i = 0; i < length; i++) {
			go.push(this.gameObjects[i].toNet(isFull));
		}

		return go;
	}
}

module.exports = Game;
