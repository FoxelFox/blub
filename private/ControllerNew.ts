import Game = require('./GameNew');

export class Controller {

    game: Game = new Game();

    constructor(io) {
        this.socket(io);
    }

    socket(io) {
        io.on('connection', (socket) => {
            // send players session id and all infos for preload
            socket.emit('player:load', this.createLoadPaket(socket.id));

            // send player all gameObjects
            socket.on('player:join', (emptyData, joinCallback) => {
                // send current game data
                joinCallback(this.createJoinPaket());
                // create the player
                this.game.onPlayerConnected(socket);
            });

            socket.on('disconnect', () => {
                this.game.onPlayerDisconnected(socket.id);
            });

            socket.on('chat:message', (msg) => {
                io.emit('chat log', msg);
            });

            socket.on('player:update', (update) => {
                this.game.onPlayerUpdate(JSON.parse(update));
            });
        });

        setInterval(() => {
            this.game.update();
            io.emit('server:update', this.createUpdatePaket());

            this.game.sessionEvents.forEach((sEvent) => {
                sEvent.socket.emit('game:spawn', sEvent.gameObjectID);
            });

            // clear events
            this.game.sessionEvents = [];
            this.game.globalEvents = [];
        }, 50);
    }

    createLoadPaket(socketID) {
        return JSON.stringify({
            data: {
                sessionID: socketID,
                models: ['model/player.json']
            }
        });
    }

    createJoinPaket() {
        return JSON.stringify({
            data: {
                gos: this.game.getNetGameObjects(true)
            }
        });
    }

    createUpdatePaket() {
        return JSON.stringify({
            data: {
                gos: this.game.getNetGameObjects(false),
                globalEvents: this.game.globalEvents
            }
        });
    }
}