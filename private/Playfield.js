'use strict';
var GameObject = require('./GameObject');
var Component = require('./Component');

function instantiate(options) {
	return new GameObject([
		new Component.PlaneShape([0, +options.height / 2], +Math.PI),
		new Component.PlaneShape([0, -options.height / 2], 0),
		new Component.PlaneShape([+options.height / 2, 0], +Math.PI / 2),
		new Component.PlaneShape([-options.height / 2, 0], -Math.PI / 2),
		new Component.Body({
			mass: 0,
		})
	]);
}

module.exports = instantiate;
