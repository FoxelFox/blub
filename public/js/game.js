function Grid(world, width, height) {
	var loader = new THREE.TextureLoader();

	// PLAYFIELD
	var geometry = new THREE.PlaneGeometry(width, height);
	var gridTex = loader.load('img/grid.png');
	gridTex.wrapS = THREE.RepeatWrapping;
	gridTex.wrapT = THREE.RepeatWrapping;
	gridTex.repeat.set( width, height );
	var material = new THREE.MeshBasicMaterial({
		map: gridTex
	});
	this.meshPlayField = new THREE.Mesh(geometry, material);

	// Borders
	this.borderBody = new p2.Body({ mass: 0});
	this.borderBody.addShape(new p2.Plane(), [0, height / 2], Math.PI);
	this.borderBody.addShape(new p2.Plane(), [0, -height / 2], 0);
	this.borderBody.addShape(new p2.Plane(), [height / 2, 0], Math.PI / 2);
	this.borderBody.addShape(new p2.Plane(), [-height / 2, 0], -Math.PI / 2);
	world.addBody(this.borderBody);
}

function GameObject(body) {

	var geometry = new THREE.CircleGeometry(1, 8);
	var material = new THREE.MeshBasicMaterial({
		color: 0x00ff00ddddddddd
	});

	this.id = body.id;

	this.mesh = new THREE.Mesh(geometry, material);

	this.body = new p2.Body({
		mass: body.mass,
		position: body.position
	});

	this.body.addShape(new p2.Circle({
		radius: 1
	}));
}

var sessionID;
var myPlayer;
var gameObjects = [];


function Game() {

	var scene;

	var world = new p2.World({
		gravity: [0.0, 0.0]
	});

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


		var phcsics = function() {
			world.step(0.0166666666667);
			gameObjects.forEach(function(obj) {
				if (obj.body.position) {
					obj.mesh.position.x = obj.body.position[0];
					obj.mesh.position.y = obj.body.position[1];
				}
			});

			if (myPlayer) {
				this.camera.position.x = myPlayer.body.position[0];
				this.camera.position.y = myPlayer.body.position[1];
			}
		};

		var render = function() {


			requestAnimationFrame(render);
			phcsics();
			renderer.render(scene, camera);
		};

		render();

		var grid = new Grid(world, 50, 50);
		//grid.mesh.rotation.x = Math.PI * 0.5;
		scene.add(grid.meshPlayField);
	};

	this.onGameJoin = function(res) {
		sessionID = res.sessionID;

		// add all bodies from server
		res.bodies.forEach(function(body) {
			addGameObject(body);
		});
	};

	this.onSpawn = function(serverBodyID) {
		gameObjects.forEach(function(obj) {
			if (obj.id === serverBodyID) {
				myPlayer = obj;
			}
		});
	};

	this.onServerUpdate = function(updates) {


		updates.events.forEach(function(event) {
			switch (event.name) {
				case 'addBody':
					addGameObject(event.body);
					break;
				case 'removeBody':
					deleteGameObject(event.id);
					break;
				default:

			}
		});

		updates.bodies.forEach(function(body, i) {
			gameObjects[i].body.position = body.p;
			gameObjects[i].body.velocity = body.v;
			gameObjects[i].body.force = body.f;
		});
	};

	this.getLocalPlayerUpdate = function() {
		return {
			sessionID: sessionID,
			controls: controls
		};
	};

	function addGameObject(body) {

		// duplicate check
		gameObjects.forEach(function(o) {
			if (o.id === body.id) {
				return;
			}
		});

		var obj = new GameObject(body);
		gameObjects.push(obj);
		world.addBody(obj.body);
		scene.add(obj.mesh);
	}

	function deleteGameObject(id) {
		world.removeBody(gameObjects[id]);
		// todo scene remove
		delete gameObjects[id];
	}
}
