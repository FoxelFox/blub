
function Grid(width, height) {
	var geometry = new THREE.Geometry();

	for (var y = 0; y < height; y++) {
		for (var x = 0; x < width; x++) {
			geometry.vertices.push(new THREE.Vector3(x, y, 0));
		}
	}

	for (var rowY = 0; rowY < height-1; rowY++) {
		for (var rowX = 0; rowX < width-1; rowX++) {
			var v0 = rowY * width + rowX;
			var v1 = v0 + width + 1;
			var v2 = v0 + width;
			geometry.faces.push( new THREE.Face3(v0, v1, v2));
			geometry.faceVertexUvs[ 0 ].push(
			    [
			        new THREE.Vector2( 0, 0 ),
			        new THREE.Vector2( 1, 1 ),
			        new THREE.Vector2( 0, 1 ),
			    ]
			);

			v1 = v0 + 1;
			v2 = v0 + width + 1;
			geometry.faces.push( new THREE.Face3(v0, v1, v2));

			geometry.faceVertexUvs[ 0 ].push(
			    [
			        new THREE.Vector2( 0, 0 ),
			        new THREE.Vector2( 1, 0 ),
			        new THREE.Vector2( 1, 1 ),
			    ]
			);
		}
	}

	geometry.computeBoundingSphere();

	var loader = new THREE.TextureLoader();
	var tex = loader.load('img/grid.png');
	var material = new THREE.MeshBasicMaterial( {map: tex} );
	this.mesh = new THREE.Mesh( geometry, material );
}

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

		var grid = new Grid(50, 50);
		//grid.mesh.rotation.x = Math.PI * 0.5;
		scene.add(grid.mesh);
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
