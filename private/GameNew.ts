import p2 = require('p2');
import GameObject = require('./GameObjectNew');
import player = require('./asset/PlayerNew');


class Game {

    gameObjects: GameObject[] = [];
    players: GameObject[] = [];
    sessionEvents = [];
    globalEvents = [];

    world: p2.World = new p2.World({
        gravity: [0.0, 0.0]
    });

    constructor() {
    }

    update() {
        for (var go in this.gameObjects) {
            go.update();
        }
        this.world.step(0.05);
    }

    onPlayerConnected(socket) {
        var player = player.instantiatePlayer({
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
            this.players[update.sessionID].getComponent('player').controls = update.controls;
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
export = Game;