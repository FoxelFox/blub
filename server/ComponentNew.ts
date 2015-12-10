import p2 = require('p2');
import GameObject = require('./GameObjectNew');

export class Component {

    gameObject: GameObject = null;
    type: string;
    isUnique: boolean = true;
    isDirty: boolean = true;

    constructor(type) {
        this.type = type;
    }

    setDirty() {
        this.gameObject.isDirty = this.isDirty = true;
    }

    onAdded() { }
    onRemoved() { }
    update() { }

    toNet(netAccu, isFull) {
        if (!isFull) this.isDirty = false;
        netAccu.type = this.type;
    }
}

export class Model extends Component {

    path: string;

    constructor(path) {
        super("model");
        this.path = 'model/' + path + '.json';
    }

    toNet(netAccu, isFull) {
        super.toNet(netAccu, isFull);
        netAccu.model = {
            path: this.path
        };
    }
}


export class Body extends Component {

    body: p2.Body;

    constructor(bodyOptions) {
        super("body");
        this.isUnique = true;
        this.body = new p2.Body(bodyOptions);
    }

    onAdded() {
        for (var shape of this.gameObject.getComponents("shape")) {
            this.body.addShape(shape.shape, [shape.shape.position, shape.shape.angle]);
        }
    }

    onRemoved() {
        for (var shape of this.gameObject.getComponents("shape")) {
            this.body.removeShape(shape.shape);
        }
    }

    update() {
        if (this.body.sleepState !== p2.Body.SLEEPING) super.setDirty();
    }

    toNet(netAccu, isFull) {
        super.toNet(netAccu, isFull);
        var self = this;
        netAccu.body = {
            "position": self.body.position,
            //"force" : this.body.force,
            "velocity": self.body.velocity,

            "angle": self.body.angle,
            //"angularForce" : this.body.angularForce,
            //"angularVelocity" : this.body.angularVelocity,

            "mass": self.body.mass
        };

    }
}

export class Shape extends Component {

    protected shape: p2.Shape;

    constructor(shape, offset, angle) {
        super("shape");
        this.shape = shape;
    }

    get offset(): number[] {
        return this.shape.position;
    }

    set offset(offset) {
        this.shape.position = offset;
        super.setDirty();
    }

    get angle(): number {
        return this.shape.angle;
    }

    set angle(angle) {
        this.shape.angle = angle;
        super.setDirty();
    }

    onAdded() {
        var bodyComp = this.gameObject.getComponent("body");
        if (bodyComp) bodyComp.body.addShape(this.shape, this.shape.position, this.shape.angle);
    }

    onRemoved() {
        var bodyComp = this.gameObject.getComponent("body");
        if (bodyComp) bodyComp.body.removeShape(this.shape);
    }

    toNet(netAccu, isFull) {
        super.toNet(netAccu, isFull);
        var self = this;
        netAccu.shape = {
            "offset": this.shape.position,
            "angle": this.shape.angle
        };
    }
}

export class CircleShape extends Shape {

    constructor(radius, offset, angle) {
        var shape = new p2.Circle({
            radius: radius
        });
        super(shape, offset, angle);
    }

    get radius(): number {
        return (< p2.Circle > this.shape).radius;
    }

    set radius(radius) {
        (<p2.Circle>this.shape).radius = radius;
        super.setDirty();
    }

    toNet(netAccu, isFull) {
        super.toNet(netAccu, isFull);
        netAccu.shapeType = "circle";
        netAccu.shape.circle = {
            "radius": this.radius
        };
    }
}

export class CapsuleShape extends Shape {
    constructor(radius, length, offset, angle) {
        var shape = new p2.Capsule({
            radius: radius,
            length: length
        });
        super(shape, offset, angle);
        this.shape = shape;
    }

    get radius(): number {
        return (<p2.Capsule>this.shape).radius;
    }

    set radius(radius) {
        (<p2.Capsule>this.shape).radius = radius;
        super.setDirty();
    }

    get length(): number {
        return (<p2.Capsule>this.shape).length;
    }

    set length(length) {
        (<p2.Capsule>this.shape).length = length;
        super.setDirty();
    }

    toNet(netAccu, isFull) {
        super.toNet(netAccu, isFull);
        netAccu.shapeType = "capsule";
        netAccu.shape.capsule = {
            "radius": this.radius,
            "length": this.length
        };
    }
}

export class BoxShape extends Shape {
    constructor(width, height, offset, angle) {
        this.shape = new p2.Box({
            width: width,
            height: height
        });
        super(this.shape, offset, angle);
    }

    get width(): number {
        return (<p2.Box>this.shape).width;
    }

    set width(width) {
        (<p2.Box>this.shape).width = width;
        super.setDirty();
    }

    get height(): number {
        return (<p2.Box>this.shape).height;
    }

    set height(height) {
        (<p2.Box>this.shape).height = height;
        super.setDirty();
    }

    toNet(netAccu, isFull) {
        super.toNet(netAccu, isFull);
        netAccu.shapeType = "box";
        netAccu.box = {
            width: this.width,
            height: this.height
        };
    }
}

export class PlaneShape extends Shape {
    constructor(offset, angle) {
        super(new p2.Plane(), offset, angle);
    }

    toNet(netAccu, isFull) {
        super.toNet(netAccu, isFull);
        netAccu.shapeType = "plane";
    }
}
