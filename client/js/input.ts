import keyboardJS = require('keyboardjs');
import THREE = require('three');

// local user input as globaly accessable instance
var Input = new function () {
    var self = this;
    self.up = false,
    self.down = false,
    self.left = false,
    self.right = false,
    self.mouse = {
        btn: [false, false, false], // mouse buttons left midle right clicks
        rel: [0, 0],                // relative position
        abs: [0, 0]                 // absolute position
    };

    keyboardJS.bind('w', function (e) {
        self.up = true;
        
    }, function (e) {
        self.up = false;
    });

    keyboardJS.bind('s', function (e) {
        self.down = true;
    }, function (e) {
        self.down = false;
    });

    keyboardJS.bind('a', function (e) {
        self.left = true;
    }, function (e) {
        Input.left = false;
    });

    keyboardJS.bind('d', function (e) {
        self.right = true;
    }, function (e) {
        self.right = false;
    });


    self.update = function (camera) {
        var vector = new THREE.Vector3();
        vector.set(self.mouse.rel[0], self.mouse.rel[1], 0.5);
        vector.unproject(camera);
        var dir = vector.sub(camera.position).normalize();
        var distance = - camera.position.z / dir.z;
        var pos = camera.position.clone().add(dir.multiplyScalar(distance));
        self.mouse.abs = [pos.x, pos.y];
    };

    self.onMouseMove = function (event) {
        self.mouse.rel = [(event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1];
    };

    self.onMouseDown = function (event) {
        self.btn[event.button] = true;
    };

    self.onMouseUp = function (event) {
        self.btn[event.button] = false;
    };

    window.onmousemove = self.onMouseMove;
    window.onmousedown = self.onMouseDown;
    window.onmouseup = self.onmouseup;
}
export = Input;