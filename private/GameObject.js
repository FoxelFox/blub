'use strict';
var Component = require('./Component');

class GameObject {

	static getID(){
	    if (!this.lastID && this.lastID!==0) {
	      this.lastID=0;
	    } else {
	      this.lastID++;
	    }
	    return this.lastID;
  	}

	//static fromNet(netObject) {
	//	var go = new GameObject();
	//	go.id = netObject.id;
	//	go.fromNet(netObject);
	//	return go;
	//}

	constructor(components) {
		this.id = GameObject.getID();
		this.components = new Map();
		this.addComponents(components);
		this.isDirty = true;
	}

	update() {
		for (var compList of this.components.values()) {
			var length = compList.length;
			for (var i = 0; i < length; i++) {
				compList[i].update();
			}
		}
	}

	toNet(isFull) {
		if (!this.isDirty && !isFull) return {};
		var netComponents = [];
		for (var compList of this.components.values()) {
			var length = compList.length;
			for (var i = 0; i < length; i++) {
				if (compList[i].isDirty || isFull) {
					var netAccu = {};
					compList[i].toNet(netAccu, isFull);
					netComponents.push(netAccu);
				}
			}
		}
		
		return {
			"id" : this.id,
			"components" : netComponents
		};
	}

	//fromNet(netObject) {
	//	var self = this;
	//	netObject.components.forEach((netComp) => {
	//		var comp = self.getComponent(netComp.type);
	//		if (comp) comp.updateFromNet(netComp);
	//		else {
	//			self.addComponent(
	//				Component.FromNet(netComp)
	//			);
	//		}
	//	});
	//}

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
