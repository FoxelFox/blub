import GameObject = require('./../GameObjectNew');
import component = require('./../ComponentNew');

export class Player extends component.Component {

    sessionID: number;
    controls;

    constructor(sessionID) {
        super('player');
        this.sessionID = sessionID;

        this.controls = {
            up: false,
            down: false,
            left: false,
            right: false,
            mouse: {
                btn: [false, false, false], // mouse buttons left midle right clicks
                rel: [0, 0],                // relative position
                abs: [0, 0]                 // absolute position
            }
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


/**
 * Instantiate a new Player gameObject
 * @param {String} [options.sessionID] Players unique session id
 * @param {Number} [options.x] Players spawn position x
 * @param {Number} [options.y] Players spawn position y
 */
export function instantiate(options) {
    return new GameObject([
        new Player(options.sessionID),
        new component.Model('player'),
        new component.CircleShape(1, [0, 0], 0),
        new component.Body({
            mass: 5,
            position: [options.x, options.y],
            damping: 0.99
        })
    ]);
}