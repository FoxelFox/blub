function Player() {
	var geometry = new THREE.CircleGeometry(1, 8);
	var material = new THREE.MeshBasicMaterial({
		color: 0x00ff00
	});

	this.mesh = new THREE.Mesh(geometry, material);
}

var players = {};


function Game() {

	var scene;
	var up = false;
	var down = false;
	var left = false;
	var right = false;


	this.init = function() {
		scene = new THREE.Scene();

		var ar = window.innerWidth / window.innerHeight;
		var camera = new THREE.OrthographicCamera(-ar * 16, ar * 16, 16, -16, 0, 100);

		var renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		// add renderer to DOM
		document.getElementById('viewport').appendChild(renderer.domElement);
		camera.position.z = 5;

		up = false;
		keyboardJS.bind('w', function(e) {
			up = true;
		}, function(e) {
			up = false;
		});

		down = false;
		keyboardJS.bind('s', function(e) {
			down = true;
		}, function(e) {
			down = false;
		});

		left = false;
		keyboardJS.bind('a', function(e) {
			left = true;
		}, function(e) {
			left = false;
		});

		right = false;
		keyboardJS.bind('d', function(e) {
			right = true;
		}, function(e) {
			right = false;
		});

		var render = function() {
			requestAnimationFrame(render);
			renderer.render(scene, camera);
		};

		render();
	};

	this.setSessionID = function(sessionID) {
		//players[sessionID] = new Player();
		//scene.add(players[sessionID].mesh);
		//console.log(players[sessionID].mesh.position.x);
	};

	this.onServerUpdate = function(updates) {


		Object.keys(updates).forEach(function(key) {
			if (players[key]) {
				players[key].mesh.position.x = updates[key].x;
				players[key].mesh.position.y = updates[key].y;

			} else {
				players[key] = new Player();
				players[key].mesh.position.x = updates[key].x;
				players[key].mesh.position.y = updates[key].y;
				scene.add(players[key].mesh);
			}

		});
	};

	this.getLocalPlayerUpdate = function() {
		return {
			up: up,
			down: down,
			left: left,
			right: right
		};
	};
}
