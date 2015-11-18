function Grid(world, width, height) {
	var loader = new THREE.TextureLoader();

	// PLAYFIELD
	var geometry = new THREE.PlaneGeometry(width, height);
	var gridTex = loader.load('img/grid.png');
	gridTex.wrapS = THREE.RepeatWrapping;
	gridTex.wrapT = THREE.RepeatWrapping;
	gridTex.repeat.set(width, height);
	var material = new THREE.MeshBasicMaterial({
		map: gridTex
	});
	this.meshPlayField = new THREE.Mesh(geometry, material);

	// Borders
	this.borderBody = new p2.Body({
		mass: 0
	});
	this.borderBody.addShape(new p2.Plane(), [0, height / 2], Math.PI);
	this.borderBody.addShape(new p2.Plane(), [0, -height / 2], 0);
	this.borderBody.addShape(new p2.Plane(), [height / 2, 0], Math.PI / 2);
	this.borderBody.addShape(new p2.Plane(), [-height / 2, 0], -Math.PI / 2);
	world.addBody(this.borderBody);
}

function GameObject(pGameObject) {

	var self = this;
	var colorComp;
	var shapeComps = [];
	var bodyComp;

	this.fromNet = function (net) {
		// parse components
		net.components.forEach(function (comp) {
			switch (comp.type) {
				case 'shape':
					shapeComps.push(comp);
					break;
				case 'body':
					bodyComp = comp;
					break;
				case 'color':
					colorComp = comp;
					break;
			}
		});

		if (!self.isInitialized)
			return; // object is not fully created

		// update
		body.position = bodyComp.body.position || body.position;
		body.velocity = bodyComp.body.velocity || body.velocity;
		body.force = bodyComp.body.force || body.force;


	};
	this.fromNet(pGameObject);

	// build objects based from components
	var body = new p2.Body({
		mass: bodyComp.body.mass,
		position: bodyComp.body.position,
		damping: 0.99
	});
	var geometry;
	shapeComps.forEach(function (shape) {
		switch (shape.shapeType) {
			case 'circle':
				geometry = new THREE.CircleGeometry(shape.radius, 8);
				body.addShape(new p2.Circle({
					radius: shape.radius
				}));
				break;
			default:
				geometry = new THREE.CircleGeometry(1, 8);
		}
	});
	var material = new THREE.MeshBasicMaterial({
		color: colorComp.color
	});


	// store properties to object
	this.id = pGameObject.id;
	this.mesh = new THREE.Mesh(geometry, material);
	this.body = body;
	this.isInitialized = true;
}

var sessionID;
var localPlayerID;
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

				if(localPlayerID === obj.id) {
					this.camera.position.x = obj.body.position[0];
					this.camera.position.y = obj.body.position[1];
				}
			});
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

		// add all gameObjects from server
		res.gameObjects.forEach(function(go) {
			addGameObject(go);
		});
	};

	this.onSpawn = function(playerID) {
		localPlayerID = playerID;
	};

	this.onServerUpdate = function(updates) {

		updates.globalEvents.forEach(function(event) {
			switch (event.name) {
				case 'addGameObject':
					addGameObject(event.gameObject);
					break;
				case 'removeGameObject':
					deleteGameObject(event.gameObjectID);
					break;
				default:

			}
		});

		updates.gameObjects.forEach(function(goUpdate, i) {
			gameObjects[i].fromNet(goUpdate);
		});
	};

	this.getLocalPlayerUpdate = function() {
		return {
			sessionID: sessionID,
			controls: controls
		};
	};

	function addGameObject(pGameObject) {

		// duplicate check
		gameObjects.forEach(function(go) {
			if (go.id === pGameObject.id) {
				return;
			}
		});

		var obj = new GameObject(pGameObject);
		gameObjects.push(obj);
		world.addBody(obj.body);
		scene.add(obj.mesh);
	}

	function deleteGameObject(id) {
		world.removeBody(gameObjects[id].body);
		scene.remove(gameObjects[id].mesh);
		// todo scene remove
		delete gameObjects[id];
	}
}
