function Grid(width, height) {
	var geometry = new THREE.Geometry();

	for (var y = 0; y < height; y++) {
		for (var x = 0; x < width; x++) {
			geometry.vertices.push(new THREE.Vector3(x, y, 0));
		}
	}

	for (var rowY = 0; rowY < height - 1; rowY++) {
		for (var rowX = 0; rowX < width - 1; rowX++) {
			var v0 = rowY * width + rowX;
			var v1 = v0 + width + 1;
			var v2 = v0 + width;
			geometry.faces.push(new THREE.Face3(v0, v1, v2));
			geometry.faceVertexUvs[0].push(
				[
					new THREE.Vector2(0, 0),
					new THREE.Vector2(1, 1),
					new THREE.Vector2(0, 1),
				]
			);

			v1 = v0 + 1;
			v2 = v0 + width + 1;
			geometry.faces.push(new THREE.Face3(v0, v1, v2));

			geometry.faceVertexUvs[0].push(
				[
					new THREE.Vector2(0, 0),
					new THREE.Vector2(1, 0),
					new THREE.Vector2(1, 1),
				]
			);
		}
	}

	geometry.computeBoundingSphere();

	var loader = new THREE.TextureLoader();
	var tex = loader.load('img/grid.png');
	var material = new THREE.MeshBasicMaterial({
		map: tex
	});
	this.mesh = new THREE.Mesh(geometry, material);
}

function GameObject(body) {
	var geometry = new THREE.CircleGeometry(1, 8);
	var material = new THREE.MeshBasicMaterial({
		color: 0x00ff00
	});

	this.mesh = new THREE.Mesh(geometry, material);

	this.body = new p2.Body({
		mass: body.mass,
		position: body.position
	});

	this.body.addShape(new p2.Circle({
		radius: 1
	}));
}

var playerID;
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

		var grid = new Grid(50, 50);
		//grid.mesh.rotation.x = Math.PI * 0.5;
		scene.add(grid.mesh);
	};

	this.onGameJoin = function(res) {
		playerID = res.sessionID;

		// add all bodies from server
		res.bodies.forEach(function(body) {
			addGameObject(body);
		});

		myPlayer = gameObjects[res.bodyIndex];
	};

	this.onServerUpdate = function(updates) {

		/*
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
		})
		*/
		;

		updates.bodies.forEach(function(body, i) {
			gameObjects[i].body.position = body.p;
			gameObjects[i].body.velocity = body.v;
			gameObjects[i].body.force = body.f;
		});
	};

	this.getLocalPlayerUpdate = function() {
		return {
			sessionID: playerID,
			controls: controls
		};
	};

	function addGameObject(body) {
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
