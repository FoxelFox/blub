'use strict';
var GameObject = require('../GameObject');
var Component = require('../Component');
var p2 = require('p2');

class Button {

    constructor() {
        this.isPressed = false;
        this.isNewPressed = false;
    }

    set pressed(value) {
        this.isNewPressed = value;
        if (this.isPressed && value)
            this.isNewPressed = false;
        this.isPressed = value;
    }
    
    get pressed() {
        return this.isPressed;
    }

    get newPressed() {
        return this.isNewPressed;
    }    

}
class Player extends Component {

	constructor(sessionID) {
		super('player');
		this.sessionID = sessionID;

        this.key = {
            up: new Button(),
            down: new Button(),
            left: new Button(),
            right: new Button()
        };

        this.mouse = {            
            btn: [new Button(), new Button(), new Button()], // mouse buttons left midle right clicks
            rel: [0, 0],                                     // relative position
            abs: [0, 0]                                      // absolute position
        }
	}

	update() {
		var body = this.gameObject.getComponent('body').body;
		var force = p2.vec2.fromValues(0, 0);

        if (this.key.up.pressed) {
			p2.vec2.add(force, force, p2.vec2.fromValues(0, +1));
		}
        if (this.key.down.pressed) {
			p2.vec2.add(force, force, p2.vec2.fromValues(0, -1));
		}
        if (this.key.left.pressed) {
			p2.vec2.add(force, force, p2.vec2.fromValues(-1, 0));
		}
        if (this.key.right.pressed) {
			p2.vec2.add(force, force, p2.vec2.fromValues(+1, 0));
		}
		p2.vec2.normalize(force, force);
		p2.vec2.multiply(force, force, p2.vec2.fromValues(+200, +200));

		p2.vec2.add(body.force, body.force, force);
    }

    set input(input) {
        Object.keys(input.key).forEach(k => {
            this.key[k].pressed = input.key[k];
        });
        
        this.mouse.btn[0].pressed = input.mouse.btn[0];
        this.mouse.btn[1].pressed = input.mouse.btn[1];
        this.mouse.btn[2].pressed = input.mouse.btn[2];
        this.mouse.rel = input.mouse.rel;
        this.mouse.abs = input.mouse.abs;
    }
}


/**
 * Instantiate a new Player gameObject
 * @param {String} [options.sessionID] Players unique session id
 * @param {Number} [options.x] Players spawn position x
 * @param {Number} [options.y] Players spawn position y
 */
function instantiate(options) {
	return new GameObject([
		new Player(options.sessionID),
		new Component.Model('player'),
		new Component.CircleShape(1, [0, 0], 0),
		new Component.Body({
			mass: 5,
			position: [options.x, options.y],
			damping: 0.99
		})
	]);
}

module.exports = instantiate;
