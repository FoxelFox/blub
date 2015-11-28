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
	var modelComp;

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
				case 'model':
					modelComp = comp;
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
		angle: bodyComp.body.angle,
		position: bodyComp.body.position,
		damping: 0.99
	});
	shapeComps.forEach(function (shape) {
		switch (shape.shapeType) {
			case 'circle':
				body.addShape(new p2.Circle({
					radius: shape.radius
				}));
				break;
			case 'plane':
				body.addShape(new p2.Plane());
				break;
			default:
		}
	});


	// store properties to object
	this.id = pGameObject.id;
	this.body = body;
	if (modelComp) {
		var materials = new THREE.MeshFaceMaterial( models[modelComp.model.path].materials );
		this.mesh = new THREE.Mesh( models[modelComp.model.path].geometry, materials );
	}
	this.isInitialized = true;
}

var sessionID;
var localPlayerID;
var gameObjects = [];
var models = {};

function Game() {
	var game = this;
	var scene;
	var camera;
	var world = new p2.World({
		gravity: [0.0, 0.0]
	});
	var controls = {
		up: false,
		down: false,
		left: false,
		right: false,
		mouse: {
			rel: [0,0],
			abs: [0,0]
		}
	};

	game.serverUpdate = null;
	game.serverEventQueue = [];

	this.init = function() {

		// set event listener for mouse movement
		window.onmousemove = setMouseRel;

		scene = new THREE.Scene();

		// fulbright light
		var light = new THREE.AmbientLight( 0xffffff );
		scene.add( light );

		var ar = window.innerWidth / window.innerHeight;
		camera = new THREE.OrthographicCamera(-ar * 16, ar * 16, 16, -16, 0, 100);

		var renderer = new THREE.WebGLRenderer({antialias : true});
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

		var physics = function() {

			if (game.serverUpdate) {
				// server has physics update and more
				game.onServerUpdate();
			} else {
				// local physics update
				world.step(0.0166666666667);
			}

			// update render stuf
			gameObjects.forEach(function(obj) {

				// copy new position to render objects
				obj.mesh.position.x = obj.body.position[0];
				obj.mesh.position.y = obj.body.position[1];

				// set camera to players position
				if(localPlayerID === obj.id) {
					camera.position.x = obj.body.position[0];
					camera.position.y = obj.body.position[1];
				}
			});

			setMouseAbs();
		};

		var render = function() {
			requestAnimationFrame(render);
			physics();
			renderer.render(scene, camera);
		};

		render();

		var grid = new Grid(world, 50, 50);
		scene.add(grid.meshPlayField);
	};

	this.onPlayerLoad = function(res, onFinish) {
		sessionID = res.sessionID;

		var loader = new THREE.JSONLoader();

		// async resource checker if all resources loaded
		var i = 0, onResourceLoaded = function () {
			if (++i === res.models.length)
				onFinish();
		};

		// load rescources async
		// TODO Check if we can use the same loader instance for all requests
		res.models.forEach(function (filePath) {
			loader.load(filePath,
				function ( geometry, materials ) {
					models[filePath] = {
						geometry : geometry,
						materials : materials
					};
					onResourceLoaded();
				}
			);
		});
	};

	this.onJoin = function(res) {
		// add all gameObjects from server
		res.gos.forEach(function(go) {
			addGameObject(go);
		});
	};

	this.onSpawn = function(playerID) {
		localPlayerID = playerID;
	};

	this.addServerUpdate = function (update) {
		update.globalEvents.forEach(function (event) {
			console.log(event);
			game.serverEventQueue.push(event);
		});
		game.serverUpdate = update.gos;
	};

	this.onServerUpdate = function() {
		var event;
		while ((event = game.serverEventQueue.shift())) {
			switch (event.name) {
				case 'addGameObject':
					addGameObject(event.gameObject);
					break;
				case 'removeGameObject':
					deleteGameObject(event.gameObjectID);
					break;
			}
		}

		this.serverUpdate.forEach(function(goUpdate, i) {
			gameObjects[goUpdate.id].fromNet(goUpdate);
		});
		game.serverUpdate = null;
	};

	this.getLocalPlayerUpdate = function() {

		return {
			sessionID: sessionID,
			controls: controls
		};
	};

	function setMouseRel (event) {
		controls.mouse.rel = [(event.clientX / window.innerWidth) * 2 - 1,  - ( event.clientY / window.innerHeight ) * 2 + 1];
	}

	function setMouseAbs () {
		var vector = new THREE.Vector3();
		vector.set(controls.mouse.rel[0], controls.mouse.rel[1], 0.5 );
		vector.unproject(camera);
		var dir = vector.sub(camera.position).normalize();
		var distance = - camera.position.z / dir.z;
		var pos = camera.position.clone().add(dir.multiplyScalar(distance));
		controls.mouse.abs = [pos.x,pos.y];
	}

	function addGameObject(pGameObject) {

		// duplicate check
		if (gameObjects[pGameObject.id]) {
			return;
		}

		var obj = new GameObject(pGameObject);
		gameObjects[obj.id] = obj;
		world.addBody(obj.body);
		scene.add(obj.mesh);
	}

	function deleteGameObject(id) {
		world.removeBody(gameObjects[id].body);
		scene.remove(gameObjects[id].mesh);
		delete gameObjects[id];
	}
}
