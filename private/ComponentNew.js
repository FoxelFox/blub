var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Component = (function () {
    function Component(type) {
        this.isUnique = true;
        this.isDirty = true;
        this.type = type;
    }
    Component.prototype.setDirty = function () {
        this.gameObject.isDirty = this.isDirty = true;
    };
    Component.prototype.onAdded = function () { };
    Component.prototype.onRemoved = function () { };
    Component.prototype.update = function () { };
    Component.prototype.toNet = function (netAccu, isFull) {
        if (!isFull)
            this.isDirty = false;
        netAccu.type = this.type;
    };
    return Component;
})();
exports.Component = Component;
var Model = (function (_super) {
    __extends(Model, _super);
    function Model(path) {
        _super.call(this, "model");
        this.path = 'model/' + path + '.json';
    }
    Model.prototype.toNet = function (netAccu, isFull) {
        _super.prototype.toNet.call(this, netAccu, isFull);
        netAccu.model = {
            path: this.path
        };
    };
    return Model;
})(Component);
exports.Model = Model;
var Body = (function (_super) {
    __extends(Body, _super);
    function Body(bodyOptions) {
        _super.call(this, "body");
        this.isUnique = true;
        this.body = new p2.Body(bodyOptions);
    }
    Body.prototype.onAdded = function () {
        for (var shape in this.gameObject.getComponents("shape")) {
            this.body.addShape(shape.shape, [shape.shape.position, shape.shape.angle]);
        }
    };
    Body.prototype.onRemoved = function () {
        for (var shape in this.gameObject.getComponents("shape")) {
            this.body.removeShape(shape.shape);
        }
    };
    Body.prototype.update = function () {
        if (this.body.sleepState !== p2.Body.SLEEPING)
            _super.prototype.setDirty.call(this);
    };
    Body.prototype.toNet = function (netAccu, isFull) {
        _super.prototype.toNet.call(this, netAccu, isFull);
        var self = this;
        netAccu.body = {
            "position": self.body.position,
            //"force" : this.body.force,
            "velocity": self.body.velocity,
            "angle": self.body.angle,
            //"angularForce" : this.body.angularForce,
            //"angularVelocity" : this.body.angularVelocity,
            "mass": self.body.mass
        };
    };
    return Body;
})(Component);
exports.Body = Body;
var Shape = (function (_super) {
    __extends(Shape, _super);
    function Shape(shape, offset, angle) {
        _super.call(this, "shape");
        this.shape = shape;
    }
    Object.defineProperty(Shape.prototype, "offset", {
        get: function () {
            return this.shape.position;
        },
        set: function (offset) {
            this.shape.position = offset;
            _super.prototype.setDirty.call(this);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "angle", {
        get: function () {
            return this.shape.angle;
        },
        set: function (angle) {
            this.shape.angle = angle;
            _super.prototype.setDirty.call(this);
        },
        enumerable: true,
        configurable: true
    });
    Shape.prototype.onAdded = function () {
        var bodyComp = this.gameObject.getComponent("body");
        if (bodyComp)
            bodyComp.body.addShape(this.shape, this.shape.position, this.shape.angle);
    };
    Shape.prototype.onRemoved = function () {
        var bodyComp = this.gameObject.getComponent("body");
        if (bodyComp)
            bodyComp.body.removeShape(this.shape);
    };
    Shape.prototype.toNet = function (netAccu, isFull) {
        _super.prototype.toNet.call(this, netAccu, isFull);
        var self = this;
        netAccu.shape = {
            "offset": this.shape.position,
            "angle": this.shape.angle
        };
    };
    return Shape;
})(Component);
exports.Shape = Shape;
var CircleShape = (function (_super) {
    __extends(CircleShape, _super);
    function CircleShape(radius, offset, angle) {
        var shape = new p2.Circle({
            radius: radius
        });
        _super.call(this, shape, offset, angle);
    }
    Object.defineProperty(CircleShape.prototype, "radius", {
        get: function () {
            return this.shape.radius;
        },
        set: function (radius) {
            this.shape.radius = radius;
            _super.prototype.setDirty.call(this);
        },
        enumerable: true,
        configurable: true
    });
    CircleShape.prototype.toNet = function (netAccu, isFull) {
        _super.prototype.toNet.call(this, netAccu, isFull);
        netAccu.shapeType = "circle";
        netAccu.shape.circle = {
            "radius": this.radius
        };
    };
    return CircleShape;
})(Shape);
exports.CircleShape = CircleShape;
var CapsuleShape = (function (_super) {
    __extends(CapsuleShape, _super);
    function CapsuleShape(radius, length, offset, angle) {
        var shape = new p2.Capsule({
            radius: radius,
            length: length
        });
        _super.call(this, shape, offset, angle);
        this.shape = shape;
    }
    Object.defineProperty(CapsuleShape.prototype, "radius", {
        get: function () {
            return this.shape.radius;
        },
        set: function (radius) {
            this.shape.radius = radius;
            _super.prototype.setDirty.call(this);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CapsuleShape.prototype, "length", {
        get: function () {
            return this.shape.length;
        },
        set: function (length) {
            this.shape.length = length;
            _super.prototype.setDirty.call(this);
        },
        enumerable: true,
        configurable: true
    });
    CapsuleShape.prototype.toNet = function (netAccu, isFull) {
        _super.prototype.toNet.call(this, netAccu, isFull);
        netAccu.shapeType = "capsule";
        netAccu.shape.capsule = {
            "radius": this.radius,
            "length": this.length
        };
    };
    return CapsuleShape;
})(Shape);
exports.CapsuleShape = CapsuleShape;
var BoxShape = (function (_super) {
    __extends(BoxShape, _super);
    function BoxShape(width, height, offset, angle) {
        this.shape = new p2.Box({
            width: width,
            height: height
        });
        _super.call(this, this.shape, offset, angle);
    }
    Object.defineProperty(BoxShape.prototype, "width", {
        get: function () {
            return this.shape.width;
        },
        set: function (width) {
            this.shape.width = width;
            _super.prototype.setDirty.call(this);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BoxShape.prototype, "height", {
        get: function () {
            return this.shape.height;
        },
        set: function (height) {
            this.shape.height = height;
            _super.prototype.setDirty.call(this);
        },
        enumerable: true,
        configurable: true
    });
    BoxShape.prototype.toNet = function (netAccu, isFull) {
        _super.prototype.toNet.call(this, netAccu, isFull);
        netAccu.shapeType = "box";
        netAccu.box = {
            width: this.width,
            height: this.height
        };
    };
    return BoxShape;
})(Shape);
exports.BoxShape = BoxShape;
var PlaneShape = (function (_super) {
    __extends(PlaneShape, _super);
    function PlaneShape(offset, angle) {
        _super.call(this, new p2.Plane(), offset, angle);
    }
    PlaneShape.prototype.toNet = function (netAccu, isFull) {
        _super.prototype.toNet.call(this, netAccu, isFull);
        netAccu.shapeType = "plane";
    };
    return PlaneShape;
})(Shape);
exports.PlaneShape = PlaneShape;
//# sourceMappingURL=ComponentNew.js.map