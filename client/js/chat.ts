app.controller('chatController', function (socket) {
	var chat = this;
	chat.log = [];
	chat.message = '';

	this.onPost = function () {
		if (chat.message !== '') {
			socket.emit('chat message', chat.message);
			chat.message = '';
		}
	};

	socket.on('chat log', function (res) {
		var div = document.getElementById("chat-log-div");
		div.scrollTop = div.scrollHeight;
		chat.log.push(res);
	});
});
