///<reference path="p2"/>
var p2 = require('./p2');
var Game = (function () {
    function Game() {
        this.gameObjects = [];
        this.players = [];
        this.sessionEvents = [];
        this.globalEvents = [];
        this.world = new p2.World({
            gravity: [0.0, 0.0]
        });
    }
    Game.prototype.update = function () {
        for (var go in this.gameObjects) {
            go.update();
        }
        this.world.step(0.05);
    };
    Game.prototype.onPlayerConnected = function (socket) {
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
    };
    Game.prototype.onPlayerDisconnected = function (sessionID) {
        var go = this.players[sessionID];
        this.removeGameObject(go);
        delete this.players[sessionID];
    };
    Game.prototype.onPlayerUpdate = function (update) {
        // just update controls
        if (this.players[update.sessionID]) {
            this.players[update.sessionID].getComponent('player').controls = update.controls;
        }
    };
    Game.prototype.addGameObject = function (gameObject) {
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
    };
    Game.prototype.removeGameObject = function (gameObject) {
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
    };
    Game.prototype.getNetGameObjects = function (isFull) {
        var go = [];
        var length = this.gameObjects.length;
        for (var i = 0; i < length; i++) {
            go.push(this.gameObjects[i].toNet(isFull));
        }
        return go;
    };
    return Game;
})();
module.exports = Game;
//# sourceMappingURL=GameNew.js.map