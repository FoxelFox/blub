'use strict'

class Player {
	constructor(x,y) {
		this.x = x;
		this.y = y;
	}
}

var players = {};

class Controller {
	constructor(io) {
		this.createSockets(io);
	}

	createSockets(io) {
		io.on('connection', function(socket) {
			socket.emit('sessionID', socket.io);

			players[socket.id] = new Player(0,0);

			socket.on('disconnect', function() {
				delete players[socket.id];
				console.log('user disconnected');
			});

			socket.on('chat message', function(msg) {
				console.log('message: ', msg);
				io.emit('chat log', msg);
			});

			socket.on('player:update', function(update) {
				if (update.up) {
					players[socket.id].y += 0.1;
				}
				if (update.down) {
					players[socket.id].y -= 0.1;
				}
				if (update.left) {
					players[socket.id].x -= 0.1;
				}
				if (update.right) {
					players[socket.id].x += 0.1;
				}
				console.log(update);
			});

			setInterval(function() {
				io.emit('server:update', players);
			}, 20);
		});
	}
}

module.exports = Controller;
