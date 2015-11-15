'use strict';
var p2 = require('p2');

class Component {
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
}

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
	}
}

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
		if (body) body.addShape(this.shape, this.offset, this.angle);
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
}

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

class PlaneShape extends Shape {
	constructor(offset, angle) {
		super(new p2.Plane(), offset, angle);
	}

	toNet(netAccu, isFull) {
		super.toNet(netAccu, isFull);
		netAccu.shapeType = "plane";
	}
}

module.exports = Component;
module.exports.Color = Color;
module.exports.Body = Body;
module.exports.Shape = Shape;
module.exports.CircleShape = CircleShape;
module.exports.CapsuleShape = CapsuleShape;
module.exports.BoxShape = BoxShape;
module.exports.PlaneShape = PlaneShape;
