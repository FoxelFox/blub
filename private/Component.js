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

	toNet() {
		return {
			type: this.type
		};
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

	toNet() {
		var net = super.toNet();
		net.color = this.color;
		return net;
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

	toNet() {
		var net = super.toNet();

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
}

class PlaneShape extends Shape {
	constructor(offset, angle) {
		this.shape = new p2.Plane();
		super(this.shape, offset, angle);
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
