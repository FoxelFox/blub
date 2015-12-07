var Game = require('./GameNew');
var Controller = (function () {
    function Controller(io) {
        this.game = new Game();
        this.socket(io);
    }
    Controller.prototype.socket = function (io) {
        var _this = this;
        io.on('connection', function (socket) {
            // send players session id and all infos for preload
            socket.emit('player:load', _this.createLoadPaket(socket.id));
            // send player all gameObjects
            socket.on('player:join', function (emptyData, joinCallback) {
                // send current game data
                joinCallback(_this.createJoinPaket());
                // create the player
                _this.game.onPlayerConnected(socket);
            });
            socket.on('disconnect', function () {
                _this.game.onPlayerDisconnected(socket.id);
            });
            socket.on('chat:message', function (msg) {
                io.emit('chat log', msg);
            });
            socket.on('player:update', function (update) {
                _this.game.onPlayerUpdate(JSON.parse(update));
            });
        });
        setInterval(function () {
            _this.game.update();
            io.emit('server:update', _this.createUpdatePaket());
            _this.game.sessionEvents.forEach(function (sEvent) {
                sEvent.socket.emit('game:spawn', sEvent.gameObjectID);
            });
            // clear events
            _this.game.sessionEvents = [];
            _this.game.globalEvents = [];
        }, 50);
    };
    Controller.prototype.createLoadPaket = function (socketID) {
        return JSON.stringify({
            data: {
                sessionID: socketID,
                models: ['model/player.json']
            }
        });
    };
    Controller.prototype.createJoinPaket = function () {
        return JSON.stringify({
            data: {
                gos: this.game.getNetGameObjects(true)
            }
        });
    };
    Controller.prototype.createUpdatePaket = function () {
        return JSON.stringify({
            data: {
                gos: this.game.getNetGameObjects(false),
                globalEvents: this.game.globalEvents
            }
        });
    };
    return Controller;
})();
module.exports = Controller;
//# sourceMappingURL=ControllerNew.js.map