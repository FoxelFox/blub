var p2 = require('p2');
var player = require('./asset/PlayerNew');
var Game = (function () {
    function Game() {
        this.gameObjects = [];
        this.players = [];
        this.sessionEvents = [];
        this.globalEvents = [];
        this.world = new p2.World({
            gravity: [0.0, 0.0]
        });
        // Game Startup code here...
        console.log('start');
    }
    Game.prototype.update = function () {
        for (var _i = 0, _a = this.gameObjects; _i < _a.length; _i++) {
            var go = _a[_i];
            go.update();
        }
        this.world.step(0.05);
    };
    Game.prototype.onPlayerConnected = function (socket) {
        console.log("connect:");
        console.log("id:" + socket.id);
        var id = socket.id;
        var cPlayer = player.instantiate(id, 0, 0);
        console.log("player:" + cPlayer);
        this.sessionEvents.push({
            name: 'spawn',
            socket: socket,
            gameObjectID: cPlayer.id
        });
        this.players[socket.id] = cPlayer;
        this.addGameObject(cPlayer);
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
        console.log("add:" + gameObject.id);
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
        if (!gameObject)
            return;
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