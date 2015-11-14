'use strict';
var GameObject = require('./GameObject');
var Component = require('./Component');
var p2 = require('p2');

class Player extends Component {

	constructor(sessionID) {
		super('player');
		this.sessionID = sessionID;

		this.controls = {
			up: false,
			down: false,
			left: false,
			right: false
		};
	}

	update() {
		var body = this.gameObject.getComponent('body').body;
		var force = p2.vec2.fromValues(0, 0);

		if (this.controls.up) {
			p2.vec2.add(force, force, p2.vec2.fromValues(0, +1));
		}
		if (this.controls.down) {
			p2.vec2.add(force, force, p2.vec2.fromValues(0, -1));
		}
		if (this.controls.left) {
			p2.vec2.add(force, force, p2.vec2.fromValues(-1, 0));
		}
		if (this.controls.right) {
			p2.vec2.add(force, force, p2.vec2.fromValues(+1, 0));
		}
		p2.vec2.normalize(force, force);
		p2.vec2.multiply(force, force, p2.vec2.fromValues(+200, +200));

		p2.vec2.add(body.force, body.force, force);
	}
}

function instantiate(options) {
	return new GameObject([
		new Component.Color(0x00ff00),
		new Component.CircleShape(1, [0, 0], 0),
		new Player(options.sessionID),
		new Component.Body({
			mass: 5,
			position: [options.x, options.y],
			damping: 0.99
		})
	]);
}

module.exports = instantiate;
