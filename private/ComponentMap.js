var ComponentMap = (function () {
    function ComponentMap() {
        this.items = {};
    }
    ComponentMap.prototype.addComponent = function (component) {
        if (!this.items[component.type])
            this.items[component.type] = [];
        this.items[component.type].push(component);
    };
    ComponentMap.prototype.addComponents = function (components) {
        for (var _i = 0; _i < components.length; _i++) {
            var comp = components[_i];
            this.addComponent(comp);
        }
    };
    ComponentMap.prototype.has = function (key) {
        return key in this.items;
    };
    ComponentMap.prototype.get = function (type) {
        return this.items[type];
    };
    ComponentMap.prototype.getFirst = function (type) {
        return this.get(type)[0];
    };
    ComponentMap.prototype.getComponents = function () {
        var result = [];
        for (var key in this.items) {
            for (var _i = 0, _a = this.items[key]; _i < _a.length; _i++) {
                var comp = _a[_i];
                result.push(comp);
            }
        }
        return result;
    };
    return ComponentMap;
})();
module.exports = ComponentMap;
//# sourceMappingURL=ComponentMap.js.map