'use strict';
var Player = require('../private/Player');

var myPlayer = new Player({
	sessionID: '0815',
	x: 0,
	y: 0
});

console.log(myPlayer.getComponents('player'));
