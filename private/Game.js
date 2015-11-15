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
		this.players[update.sessionID].getComponent('player').controls = update.controls;
	}

	addGameObject(gameObject) {
		gameObject.game = this;
		this.gameObjects.push(gameObject);

		// if obj has a body then add it to the world
		var goBody = gameObject.getComponent('body');
		if (goBody)
			this.world.addBody(goBody);

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

	getGameObjects(isFull) {
		var go = [];
		this.gameObjects.forEach(obj => {
			go.push(obj.toNet(isFull));
		});
		return go;
	}
}

module.exports = Game;