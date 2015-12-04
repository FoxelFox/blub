var ComponentMap = (function () {
    function ComponentMap() {
        this.items = {};
    }
    ComponentMap.prototype.addComponent = function (component) {
        this.items[component.type].push(component);
    };
    ComponentMap.prototype.addComponents = function (components) {
        for (var comp in components) {
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
            for (var comp in this.items[key]) {
                result.push(comp);
            }
        }
        return result;
    };
    return ComponentMap;
})();
module.exports = ComponentMap;
//# sourceMappingURL=ComponentMap.js.map