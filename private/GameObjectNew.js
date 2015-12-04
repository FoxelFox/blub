var ComponentMap = require('./ComponentMap');
var GameObject = (function () {
    function GameObject(components) {
        this.isDirty = true;
        this.components = new ComponentMap();
        this.id = GameObject.nextID++;
        this.addComponents(components);
    }
    GameObject.prototype.addComponent = function (comp) {
        // Double use check
        if (comp.gameObject !== null)
            throw "Component already in use!";
        // Type check
        if (comp.type === null)
            throw "Component type is null!";
        // Unique check
        if (comp.isUnique && this.components.has(comp.type))
            throw "Component of type" + comp.type + "already exists and is unique!";
        // Integrate
        this.components.addComponent(comp);
        // Set back reference and call event 
        comp.gameObject = this;
        comp.onAdded();
        this.isDirty = true;
    };
    GameObject.prototype.addComponents = function (comps) {
        comps = comps || [];
        for (var comp in comps) {
            this.addComponent(comp);
        }
    };
    GameObject.prototype.getComponent = function (type) {
        var comps = this.getComponents(type);
        if (comps)
            return comps[0];
        return null;
    };
    GameObject.prototype.getComponents = function (type) {
        return this.components.get(type);
    };
    GameObject.prototype.removeComponent = function (comp) {
        if (this.components.has(comp.type)) {
            var ary = this.components.get(comp.type);
            var index = ary.indexOf(comp);
            if (index !== -1) {
                ary.splice(index, 1);
                comp.onRemoved();
                this.isDirty = true;
            }
        }
    };
    GameObject.prototype.update = function () {
        for (var comp in this.components.getComponents()) {
            comp.update();
        }
    };
    GameObject.prototype.toNet = function (isFull) {
        if (!this.isDirty && !isFull)
            return {};
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
    };
    GameObject.nextID = 0;
    return GameObject;
})();
module.exports = GameObject;
//# sourceMappingURL=GameObjectNew.js.map