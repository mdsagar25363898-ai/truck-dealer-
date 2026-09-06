// ======================================================
// TRUCK DEALER 3D - PLAYER + FOLLOW CAMERA
// ======================================================

const canvas = document.getElementById("gameCanvas");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// Camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// Lighting
const ambient = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(100, 300, 100);
scene.add(sun);


// ======================================================
// MAP
// ======================================================

const mapTexture = new THREE.TextureLoader().load(
  "map.png",
  function () {
    console.log("MAP LOADED");
  }
);

const mapMaterial = new THREE.MeshBasicMaterial({
  map: mapTexture
});

const mapGeometry = new THREE.PlaneGeometry(1536, 1024);

const map = new THREE.Mesh(
  mapGeometry,
  mapMaterial
);

map.rotation.x = -Math.PI / 2;
map.position.y = 0;

scene.add(map);


// ======================================================
// PLAYER
// ======================================================

const playerGroup = new THREE.Group();
scene.add(playerGroup);

// Character image
const playerTexture = new THREE.TextureLoader().load(
  "player.png",
  function () {
    console.log("PLAYER LOADED");
  }
);

// Character sprite
const playerMaterial = new THREE.SpriteMaterial({
  map: playerTexture,
  transparent: true,
  depthTest: true
});

const player = new THREE.Sprite(playerMaterial);

player.scale.set(55, 80, 1);

player.position.y = 40;

playerGroup.add(player);


// Starting position
playerGroup.position.set(
  768,
  0,
  512
);


// ======================================================
// FOLLOW CAMERA
// ======================================================

const cameraOffset = new THREE.Vector3(
  0,
  85,
  120
);

const cameraTarget = new THREE.Vector3();


// ======================================================
// MOVEMENT
// ======================================================

const keys = {
  up: false,
  down: false,
  left: false,
  right: false
};

let playerSpeed = 3.5;
let playerRotation = 0;


// Keyboard
window.addEventListener("keydown", function (e) {

  if (
    e.key === "ArrowUp" ||
    e.key.toLowerCase() === "w"
  ) keys.up = true;

  if (
    e.key === "ArrowDown" ||
    e.key.toLowerCase() === "s"
  ) keys.down = true;

  if (
    e.key === "ArrowLeft" ||
    e.key.toLowerCase() === "a"
  ) keys.left = true;

  if (
    e.key === "ArrowRight" ||
    e.key.toLowerCase() === "d"
  ) keys.right = true;

});


window.addEventListener("keyup", function (e) {

  if (
    e.key === "ArrowUp" ||
    e.key.toLowerCase() === "w"
  ) keys.up = false;

  if (
    e.key === "ArrowDown" ||
    e.key.toLowerCase() === "s"
  ) keys.down = false;

  if (
    e.key === "ArrowLeft" ||
    e.key.toLowerCase() === "a"
  ) keys.left = false;

  if (
    e.key === "ArrowRight" ||
    e.key.toLowerCase() === "d"
  ) keys.right = false;

});


// ======================================================
// MOBILE BUTTONS
// ======================================================

function holdButton(id, key) {

  const button = document.getElementById(id);

  if (!button) return;

  button.addEventListener("touchstart", function(e) {
    e.preventDefault();
    keys[key] = true;
  });

  button.addEventListener("touchend", function(e) {
    e.preventDefault();
    keys[key] = false;
  });

  button.addEventListener("mousedown", function() {
    keys[key] = true;
  });

  button.addEventListener("mouseup", function() {
    keys[key] = false;
  });

  button.addEventListener("mouseleave", function() {
    keys[key] = false;
  });
}

holdButton("up", "up");
holdButton("down", "down");
holdButton("left", "left");
holdButton("right", "right");


// ======================================================
// PLAYER MOVEMENT
// ======================================================

function updatePlayer() {

  let moving = false;

  if (keys.left) {
    playerRotation += 0.045;
  }

  if (keys.right) {
    playerRotation -= 0.045;
  }

  playerGroup.rotation.y = playerRotation;


  if (keys.up) {

    playerGroup.position.x +=
      Math.sin(playerRotation) * playerSpeed;

    playerGroup.position.z +=
      Math.cos(playerRotation) * playerSpeed;

    moving = true;
  }


  if (keys.down) {

    playerGroup.position.x -=
      Math.sin(playerRotation) * playerSpeed;

    playerGroup.position.z -=
      Math.cos(playerRotation) * playerSpeed;

    moving = true;
  }


  // Map boundary
  playerGroup.position.x =
    Math.max(-700, Math.min(700, playerGroup.position.x));

  playerGroup.position.z =
    Math.max(-470, Math.min(470, playerGroup.position.z));


  if (moving) {

    const fuelElement =
      document.getElementById("fuel");

    if (fuelElement) {

      let fuel =
        Number(fuelElement.textContent);

      fuel -= 0.003;

      if (fuel < 0) fuel = 0;

      fuelElement.textContent =
        Math.floor(fuel);
    }
  }
}


// ======================================================
// CAMERA FOLLOW PLAYER
// ======================================================

function updateCamera() {

  const offset =
    cameraOffset.clone();

  offset.applyAxisAngle(
    new THREE.Vector3(0, 1, 0),
    playerRotation
  );

  const desiredPosition =
    playerGroup.position.clone().add(offset);

  // Camera stays behind player
  camera.position.lerp(
    desiredPosition,
    0.12
  );


  cameraTarget.copy(
    playerGroup.position
  );

  cameraTarget.y += 25;


  camera.lookAt(cameraTarget);
}


// ======================================================
// LOCATION
// ======================================================

function updateLocation() {

  const x = playerGroup.position.x;
  const z = playerGroup.position.z;

  const location =
    document.getElementById("location");

  if (!location) return;


  // Showroom area
  if (
    x > 500 &&
    x < 900 &&
    z > 250 &&
    z < 500
  ) {

    location.textContent =
      "🏪 Showroom";

  }

  // Used Truck Market
  else if (
    x > 150 &&
    x < 550 &&
    z > -100 &&
    z < 180
  ) {

    location.textContent =
      "🚛 Used Truck Market";

  }

  // Garage
  else if (
    x > -650 &&
    x < -300 &&
    z > -50 &&
    z < 250
  ) {

    location.textContent =
      "🔧 Truck Garage";

  }

  else {

    location.textContent =
      "🛣️ Road";

  }
}


// ======================================================
// RESIZE
// ======================================================

window.addEventListener(
  "resize",
  function() {

    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

  }
);


// ======================================================
// GAME LOOP
// ======================================================

function gameLoop() {

  requestAnimationFrame(gameLoop);

  updatePlayer();

  updateCamera();

  updateLocation();

  renderer.render(
    scene,
    camera
  );
}


// Start camera behind player
camera.position.set(
  768,
  85,
  632
);

camera.lookAt(
  768,
  30,
  512
);

gameLoop();
