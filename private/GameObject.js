'use strict';
var p2 = require('p2');
var proto = require('protobufjs');

class GameObject {

	static getID(){
	    if (!this.lastID && this.lastID!==0) {
	      this.lastID=0;
	    } else {
	      this.lastID++;
	    }
	    return this.lastID;
  	}

	constructor(components) {
		this.id = GameObject.getID();
		this.components = new Map();
		this.addComponents(components);
		this.isDirty = true;
	}

	update() {
		this.components.forEach(comp => {
			comp.update();
		});
	}

	toNet() {
		if (!this.isDirty) return {};
		return {
			"id" : this.id
			//"component" :
		};
	}

	addComponent(component) {
		this.addComponents([component]);
	}

	addComponents(components) {
		components = components || [];
		var self = this;
		components.forEach((comp) => {
			// Double use check
			if (comp.gameObject !== null) throw "Component already in use!";
			// Type check
			if (comp.type === null) throw "Component type is null!";
			// Unique check
			if (comp.isUnique && self.components.has(comp.type)) throw "Component of type" + comp.type + "already exists and is unique!";
			// Integrate
			if (self.components.has(comp.type)) {
				self.components.get(comp.type).push(comp);
			} else {
				self.components.set(comp.type, [comp]);
			}
			comp.gameObject = self;
			comp.onAdded();
			this.isDirty = true;
		});
	}

	getComponent(type) {
		var comps = this.getComponents(type);
		if (comps) return comps[0];
		return null;
	}

	getComponents(type) {
		return this.components.get(type);
	}

	removeComponent(comp) {
		if (this.components.has(comp.type)) {
			var ary = this.components.get(comp.type);
			var index = ary.indexOf(comp);
			if (index !== -1) {
				ary.splice(index, 1);
				comp.onRemoved();
				this.isDirty = true;
			}
		}
	}
}

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
}

class ColorComp extends Component {
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
}

class BodyComp extends Component {
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
}

class ShapeComp extends Component {
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

class CircleShapeComp extends ShapeComp {
	constructor(radius, offset, angle) {
		var shape = new p2.Circle({radius: radius});
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

class CapsuleShapeComp extends ShapeComp {
	constructor(radius, length, offset, angle) {
		var shape = new p2.Capsule({radius: radius, length: length});
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

class BoxShapeComp extends ShapeComp {
	constructor(width, height, offset, angle) {
		this.shape = new p2.Box({width: width, height: height});
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

class PlaneShapeComp extends ShapeComp {
	constructor(offset, angle) {
		this.shape = new p2.Plane();
		super(this.shape, offset, angle);
	}
}

var go = new GameObject();
go.addComponent(new ColorComp(0xffffff));
var circle = new CircleShapeComp(3,[0,0],0);
go.addComponent(circle);
var body = new BodyComp({mass: 1});
go.addComponent(body);
go.removeComponent(circle);
go.removeComponent(body);
