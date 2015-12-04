﻿import component = require('./ComponentNew');

class ComponentMap {

    private items: { [key: string]: component.Component[] };

    constructor() {
        this.items = {};
    }

    addComponent(component: component.Component): void {
        this.items[component.type].push(component);
    }

    addComponents(components: component.Component[]): void {
        for (var comp in components) {
            this.addComponent(comp);
        }
    }

    has(key: string): boolean {
        return key in this.items;
    }

    get(type: string): component.Component[] {
        return this.items[type];
    }

    getFirst(type: string): component.Component {
        return this.get(type)[0];
    }

    getComponents(): component.Component[] {
        var result: component.Component[] = [];
        for (var key in this.items) {
            for (var comp in this.items[key]) {
                result.push(comp);
            }
        }
        return result;
    }
}
export = ComponentMap;