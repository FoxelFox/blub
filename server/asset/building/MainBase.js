'use strict';

var GameObject = require('../../GameObject');
var Component = require('../../Component');

function instantiate(options) {
	return new GameObject([
		new Component.Color(0x0000ff),
		new Component.BoxShape(10, 10, [0, 0], 0),
		new Component.Body({
			mass: 0,
			position: [options.x, options.y],
		})
	]);
}

module.exports = instantiate;
