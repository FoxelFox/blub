
function Player() {
	var geometry = new THREE.CircleGeometry(1, 8);
	var material = new THREE.MeshBasicMaterial({
		color: 0x00ff00
	});

	this.mesh = new THREE.Mesh(geometry, material);
}

var playerID;
var players = {};


function Game() {

	var scene;
	var controls = {
		up: false,
		down: false,
		left: false,
		right: false
	};


	this.init = function() {
		scene = new THREE.Scene();

		var ar = window.innerWidth / window.innerHeight;
		camera = new THREE.OrthographicCamera(-ar * 16, ar * 16, 16, -16, 0, 100);

		var renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		// add renderer to DOM
		document.getElementById('viewport').appendChild(renderer.domElement);
		camera.position.z = 5;

		controls.up = false;
		keyboardJS.bind('w', function(e) {
			controls.up = true;
		}, function(e) {
			controls.up = false;
		});

		controls.down = false;
		keyboardJS.bind('s', function(e) {
			controls.down = true;
		}, function(e) {
			controls.down = false;
		});

		controls.left = false;
		keyboardJS.bind('a', function(e) {
			controls.left = true;
		}, function(e) {
			controls.left = false;
		});

		controls.right = false;
		keyboardJS.bind('d', function(e) {
			controls.right = true;
		}, function(e) {
			controls.right = false;
		});

		var render = function() {
			requestAnimationFrame(render);
			renderer.render(scene, camera);
		};

		render();

		var gridHelper = new THREE.GridHelper( 200, 1 );
		gridHelper.rotation.x = Math.PI / 2;
		scene.add( gridHelper );
	};

	this.setSessionID = function(sessionID) {
		console.log("id is: "+sessionID);
		playerID = sessionID;
	};

	this.onServerUpdate = function(updates) {


		Object.keys(updates).forEach(function(key) {
			if (players[key]) {
				players[key].mesh.position.x = updates[key].x;
				players[key].mesh.position.y = updates[key].y;
				if (key == playerID) {
					this.camera.position.x = updates[key].x;
					this.camera.position.y = updates[key].y;
				}

			} else {
				players[key] = new Player();
				players[key].mesh.position.x = updates[key].x;
				players[key].mesh.position.y = updates[key].y;
				scene.add(players[key].mesh);
			}

		});
	};

	this.getLocalPlayerUpdate = function() {
		return controls;
	};
}
