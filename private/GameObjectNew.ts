import component = require('./ComponentNew');
import ComponentMap = require('./ComponentMap');

class GameObject {

    static nextID: number = 0;

    id: number;
    isDirty: boolean = true;

    private components: ComponentMap = new ComponentMap();

    constructor(components: component.Component[]) {
        this.id = GameObject.nextID++;
        this.addComponents(components);
    }

    addComponent(comp: component.Component) {
        // Double use check
        if (comp.gameObject !== null) throw "Component already in use!";
        // Type check
        if (comp.type === null) throw "Component type is null!";
        // Unique check
        if (comp.isUnique && this.components.has(comp.type)) throw "Component of type" + comp.type + "already exists and is unique!";
        // Integrate
        this.components.addComponent(comp);

        // Set back reference and call event 
        comp.gameObject = this;
        comp.onAdded();
        this.isDirty = true;
    }

    addComponents(comps: component.Component[]) {
        comps = comps || [];
        for (var comp in comps) {
            this.addComponent(comp);
        }
    }

    getComponent(type: string): any {
        var comps = this.getComponents(type);
        if (comps) return comps[0];
        return null;
    }

    getComponents(type: string): any {
        return this.components.get(type);
    }

    removeComponent(comp: component.Component) {
        if (this.components.has(comp.type)) {
            var ary: component.Component[] = this.components.get(comp.type);
            var index = ary.indexOf(comp);
            if (index !== -1) {
                ary.splice(index, 1);
                comp.onRemoved();
                this.isDirty = true;
            }
        }
    }

    update() {
        for (var comp in this.components.getComponents()) {
            comp.update();
        }
    }

    toNet(isFull: boolean): Object {
        if (!this.isDirty && !isFull) return {};
        var netComponents = [];
        for (var comp in this.components.getComponents()) {
            if (comp.isDirty || isFull) {
                var netAccu = {};
                comp.toNet(netAccu, isFull);
                netComponents.push(netAccu);
            }  
        }

        return {
            "id": this.id,
            "components": netComponents
        };
    }
}
export = GameObject;