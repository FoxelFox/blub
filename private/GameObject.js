'use strict';

class GameObject {

	static getID() {
		if (!this.lastID && this.lastID !== 0) {
			this.lastID = 0;
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
			// TODO: update is not always a fuction, but why?
			if (typeof comp.update === 'function')
				comp.update();
		});
	}

	toNet(isFull) {
		if (!this.isDirty && !isFull) return {};
		var self = this;
		var netComponents = [];
		this.components.forEach((comp) => {
			if (comp.isDirty || isFull) {
				var netAccu;
				comp.toNet(netAccu, isFull);
				netComponents.push(netAccu);
			}
		});
		return {
			"id": this.id,
			"components": netComponents
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

module.exports = GameObject;
