import GameObject = require('./../GameObjectNew');
import component = require('./../ComponentNew');

function instantiatePlayfield(options) {
    return new GameObject([
        new component.PlaneShape([0, +options.height / 2], +Math.PI),
        new component.PlaneShape([0, -options.height / 2], 0),
        new component.PlaneShape([+options.height / 2, 0], +Math.PI / 2),
        new component.PlaneShape([-options.height / 2, 0], -Math.PI / 2),
        new component.Body({
            mass: 0,
        })
    ]);
}