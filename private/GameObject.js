'use strict';

class GameObject {

	var nextID = 0;

	constructor(components) {
		this.id = nextID++;
		this.components = new Map();
		addComponents(components);
	}

	addComponent(component) {
		addComponents({component});
	}

	addComponents(components) {
		components.forEach(comp => {
			// Double use check
			if (comp.gameObject != null) throw "Component already in use!";
			// Type check
			if (comp.type == null) throw "Component type is null!";
			// Unique check
			if (comp.isUnique && this.components.has(comp.type)) throw "Component of type" + comp.type "already exists and is unique!";
			// Integrate
			if (this.components.has(comp.type)) this.components.get(comp.type).push(comp)
			else this.components.set(comp.type, [comp]);
			comp.gameObject = this;
			comp.onAdded();
		});
	}

	getComponent(type) {
		return this.components.get(type)[0];
	}

	getComponents(type) {
		return this.components.get(type);
	}

	removeComponent(comp) {
		if (this.components.has(com))
	}
}

class Component {
	constructor() {
		this.gameObject == null;
		this.type = null;
		this.isUnique = false;
	}
}

class ColorComp extends Component {
	constructor(color) {
		this.type = "Color";
		this.color = color;
	}
}
