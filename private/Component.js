'use strict';
var p2 = require('p2');

class Component {

	//static registerClass(compClass) {
	//	if (!this.classes) this.classes = new Map();
	//	this.classes.set(compClass.name, compClass);
	//}

	//static fromNet(gameObject, netComponent) {
	//	this.classes.get(netComponent.className).fromNet(netComponent);
	//}

	constructor(type) {
		this.gameObject = null;
		this.type = type;
		this.isUnique = false;
		this.isDirty = true;
	}

	setDirty() {
		this.gameObject.isDirty = this.isDirty = true;
	}

	onAdded() {}
	onRemoved() {}
	update() {}

	toNet(netAccu, isFull) {
		if (!isFull) this.isDirty = false;
		netAccu.type = this.type;
	}
}

class Color extends Component {

	constructor(color) {
		super("color");
		this._color = color;
	}

	get color() {
		return this._color;
	}

	set color(color) {
		this._color = color;
		super.setDirty();
	}

	toNet(netAccu, isFull) {
		super.toNet(netAccu, isFull);
		netAccu.color = this.color;
	}

	//fromNet(netComponent) {
	//	this._color = netComponent.color;
	//}

	//static fromNet(gameObject, netComponent) {
	//	var comp = new Color(netComponent.color);
	//	gameObject.addComponent(comp);
	//}
}
//Component.registerClass(Color);

class Body extends Component {
	constructor(bodyOptions) {
		super("body");
		this.isUnique = true;
		this.body = new p2.Body(bodyOptions);
	}

	onAdded() {
		var self = this;
		this.gameObject.getComponents("shape").forEach((shape) => {
			self.body.addShape(shape.shape);
		});
	}

	onRemoved() {
		var self = this;
		this.gameObject.getComponents("shape").forEach((shape) => {
			self.body.removeShape(shape.shape);
		});
	}

	update() {
		if (this.body.sleepState !== p2.Body.SLEEPING) super.setDirty();
	}

	toNet(netAccu, isFull) {
		super.toNet(netAccu, isFull);
		netAccu.position = this.body.position;
		//netAccu.force = this.body.force;
		netAccu.velocity = this.body.velocity;

		netAccu.angle = this.body.angle;
		//netAccu.angularForce = this.body.angularForce;
		//netAccu.angularVelocity = this.body.angularVelocity;

		netAccu.mass = this.body.mass;
	}

	//fromNet(netComponent) {
	//	this.body.position = netComponent.position;
	//	//this.body.force = netComponent.force;
	//	this.body.velocity = netComponent.velocity;
	//
	//	this.body.angle = netComponent.angle;
	//	//this.body.angularForce  = netComponent.angularForce;
	//	//this.body.angularVelocity  = netComponent.angularVelocity;
	//
	//	this.body.mass = netComponent.mass;
	//}

	//static fromNet(gameObject, netComponent) {
	//	var comp = new Body();
	//	gameObject.addComponent(comp);
	//	comp.fromNet(netComponent);
	//}
}
//Component.registerClass(Body);

class Shape extends Component {
	constructor(shape, offset, angle) {
		super("shape");
		this.shape = shape;
		this._offset = offset;
		this._angle = angle;
	}

	get offset() {
		return this._offset;
	}

	set offset(offset) {
		this._offset = offset;
		this.shape.position = offset;
		super.setDirty();
	}

	get angle() {
		return this._angle;
	}

	set angle(angle) {
		this._angle = angle;
		this.shape.angle = angle;
		super.setDirty();
	}

	onAdded() {
		var body = this.gameObject.getComponent("body");
		if (body) body.addShape(this.shape, this._offset, this._angle);
	}

	onRemoved() {
		var body = this.gameObject.getComponent("body");
		if (body) body.body.removeShape(this.shape);
	}

	toNet(netAccu, isFull) {
		super.toNet(netAccu, isFull);
		netAccu.offset = this._offset;
		netAccu.angle = this._angle;
	}

	//fromNet(netComponent) {
	//	this._offset = netComponent.offset;
	//	this.shape.position = netComponent.offset;
	//	this._angle = netComponent.angle;
	//	this.shape.angle = netComponent.offset;
	//}
}

class CircleShape extends Shape {
	constructor(radius, offset, angle) {
		var shape = new p2.Circle({
			radius: radius
		});
		super(shape, offset, angle);
		this.shape = shape;
		this._radius = radius;
	}

	get radius() {
		return this._radius;
	}

	set radius(radius) {
		this._radius = radius;
		this.shape.radius = radius;
		super.setDirty();
	}

	toNet(netAccu, isFull) {
		super.toNet(netAccu, isFull);
		netAccu.shapeType = "circle";
		netAccu.radius = this._radius;
	}

	//fromNet(netComponent) {
	//	super.fromNet(netComponent);
	//	this._radius = netComponent.radius;
	//	this.shape.radius = netComponent.radius;
	//}
}
//Component.registerClass(CircleShape);

class CapsuleShape extends Shape {
	constructor(radius, length, offset, angle) {
		var shape = new p2.Capsule({
			radius: radius,
			length: length
		});
		super(shape, offset, angle);
		this.shape = shape;
		this._radius = radius;
		this._length = length;
	}

	get radius() {
		return this._radius;
	}

	set radius(radius) {
		this._radius = radius;
		this.shape.radius = radius;
		super.setDirty();
	}

	get length() {
		return this._length;
	}

	set length(length) {
		this._length = length;
		this.shape.length = length;
		super.setDirty();
	}

	toNet(netAccu, isFull) {
		super.toNet(netAccu, isFull);
		netAccu.shapeType = "capsule";
		netAccu.radius = this._radius;
		netAccu.length = this._length;
	}
}
//Component.registerClass(CapsuleShape);

class BoxShape extends Shape {
	constructor(width, height, offset, angle) {
		this.shape = new p2.Box({
			width: width,
			height: height
		});
		super(this.shape, offset, angle);
		this._width = width;
		this._height = height;
	}

	get width() {
		return this._width;
	}

	set width(width) {
		this._width = width;
		this.shape.width = width;
		super.setDirty();
	}

	get height() {
		return this._height;
	}

	set height(height) {
		this._height = height;
		this.shape.height = height;
		super.setDirty();
	}

	toNet(netAccu, isFull) {
		super.toNet(netAccu, isFull);
		netAccu.shapeType = "box";
		netAccu.width = this._width;
		netAccu.height = this._height;
	}
}
//Component.registerClass(BoxShape);

class PlaneShape extends Shape {
	constructor(offset, angle) {
		super(new p2.Plane(), offset, angle);
	}

	toNet(netAccu, isFull) {
		super.toNet(netAccu, isFull);
		netAccu.shapeType = "plane";
	}
}
//Component.registerClass(PlaneShape);

module.exports = Component;
module.exports.Color = Color;
module.exports.Body = Body;
module.exports.Shape = Shape;
module.exports.CircleShape = CircleShape;
module.exports.CapsuleShape = CapsuleShape;
module.exports.BoxShape = BoxShape;
module.exports.PlaneShape = PlaneShape;
