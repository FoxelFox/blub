var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var GameObject = require('./../GameObjectNew');
var component = require('./../ComponentNew');
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(sessionID) {
        _super.call(this, 'player');
        this.sessionID = sessionID;
        this.controls = {
            up: false,
            down: false,
            left: false,
            right: false,
            mouse: {
                btn: [false, false, false],
                rel: [0, 0],
                abs: [0, 0] // absolute position
            }
        };
    }
    Player.prototype.update = function () {
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
    };
    return Player;
})(component.Component);
exports.Player = Player;
/**
 * Instantiate a new Player gameObject
 * @param {String} [options.sessionID] Players unique session id
 * @param {Number} [options.x] Players spawn position x
 * @param {Number} [options.y] Players spawn position y
 */
function instantiate(options) {
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
exports.instantiate = instantiate;
//# sourceMappingURL=PlayerNew.js.map