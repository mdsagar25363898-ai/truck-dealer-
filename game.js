// =====================================================
// TRUCK DEALER GAME
// STEP 1 — PLAYER + FOLLOW CAMERA
// =====================================================

const canvas = document.getElementById("gameCanvas");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// ---------------- CAMERA ----------------

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);

// Camera will stay behind the player
camera.position.set(0, 85, 120);

// ---------------- RENDERER ----------------

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// ---------------- LIGHT ----------------

const ambient = new THREE.AmbientLight(0xffffff, 1.8);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(200, 500, 200);
scene.add(sun);

// =====================================================
// MAP
// =====================================================

const WORLD_W = 1536;
const WORLD_H = 1024;

const mapTexture = new THREE.TextureLoader().load("map.png");

const mapMaterial = new THREE.MeshBasicMaterial({
  map: mapTexture
});

const mapGeometry = new THREE.PlaneGeometry(
  WORLD_W,
  WORLD_H
);

const map = new THREE.Mesh(
  mapGeometry,
  mapMaterial
);

// Make map horizontal
map.rotation.x = -Math.PI / 2;
map.position.set(0, 0, 0);

scene.add(map);

// =====================================================
// PLAYER
// =====================================================

const player = {
  x: 0,
  z: 0,
  speed: 1.8,
  direction: 0
};

// Player image
const playerTexture = new THREE.TextureLoader().load(
  "player.png"
);

// Use the character sheet as a billboard.
// The sheet is cropped to the FRONT character area.
const playerMaterial = new THREE.MeshBasicMaterial({
  map: playerTexture,
  transparent: true,
  side: THREE.DoubleSide
});

const playerGeometry = new THREE.PlaneGeometry(
  55,
  85
);

const playerMesh = new THREE.Mesh(
  playerGeometry,
  playerMaterial
);

playerMesh.position.set(
  player.x,
  42,
  player.z
);

scene.add(playerMesh);

// =====================================================
// CONTROLS
// =====================================================

const keys = {
  up: false,
  down: false,
  left: false,
  right: false
};

window.addEventListener("keydown", function(e) {

  if (
    e.key === "ArrowUp" ||
    e.key.toLowerCase() === "w"
  ) {
    keys.up = true;
  }

  if (
    e.key === "ArrowDown" ||
    e.key.toLowerCase() === "s"
  ) {
    keys.down = true;
  }

  if (
    e.key === "ArrowLeft" ||
    e.key.toLowerCase() === "a"
  ) {
    keys.left = true;
  }

  if (
    e.key === "ArrowRight" ||
    e.key.toLowerCase() === "d"
  ) {
    keys.right = true;
  }

});

window.addEventListener("keyup", function(e) {

  if (
    e.key === "ArrowUp" ||
    e.key.toLowerCase() === "w"
  ) {
    keys.up = false;
  }

  if (
    e.key === "ArrowDown" ||
    e.key.toLowerCase() === "s"
  ) {
    keys.down = false;
  }

  if (
    e.key === "ArrowLeft" ||
    e.key.toLowerCase() === "a"
  ) {
    keys.left = false;
  }

  if (
    e.key === "ArrowRight" ||
    e.key.toLowerCase() === "d"
  ) {
    keys.right = false;
  }

});

// =====================================================
// MOBILE BUTTONS
// =====================================================

function holdButton(id, keyName) {

  const button = document.getElementById(id);

  if (!button) return;

  const start = function(e) {
    e.preventDefault();
    keys[keyName] = true;
  };

  const stop = function(e) {
    e.preventDefault();
    keys[keyName] = false;
  };

  button.addEventListener("touchstart", start, {
    passive: false
  });

  button.addEventListener("touchend", stop, {
    passive: false
  });

  button.addEventListener("touchcancel", stop, {
    passive: false
  });

  button.addEventListener("mousedown", start);
  button.addEventListener("mouseup", stop);
  button.addEventListener("mouseleave", stop);
}

holdButton("upBtn", "up");
holdButton("downBtn", "down");
holdButton("leftBtn", "left");
holdButton("rightBtn", "right");

// =====================================================
// PLAYER MOVEMENT
// =====================================================

function updatePlayer() {

  let dx = 0;
  let dz = 0;

  if (keys.up) {
    dz -= player.speed;
  }

  if (keys.down) {
    dz += player.speed;
  }

  if (keys.left) {
    dx -= player.speed;
  }

  if (keys.right) {
    dx += player.speed;
  }

  // Normalize diagonal movement
  if (dx !== 0 && dz !== 0) {
    dx *= 0.707;
    dz *= 0.707;
  }

  player.x += dx;
  player.z += dz;

  // Keep player inside map
  const limitX = WORLD_W / 2 - 30;
  const limitZ = WORLD_H / 2 - 30;

  player.x = Math.max(
    -limitX,
    Math.min(limitX, player.x)
  );

  player.z = Math.max(
    -limitZ,
    Math.min(limitZ, player.z)
  );

  playerMesh.position.x = player.x;
  playerMesh.position.z = player.z;

  // Character stays upright
  playerMesh.rotation.x = 0;
  playerMesh.rotation.y = 0;
}

// =====================================================
// FOLLOW CAMERA
// =====================================================

function updateCamera() {

  // Camera follows behind player
  const distance = 115;
  const height = 75;

  const targetX = player.x;
  const targetY = 35;
  const targetZ = player.z + distance;

  // Smooth camera movement
  camera.position.x +=
    (targetX - camera.position.x) * 0.08;

  camera.position.y +=
    (height - camera.position.y) * 0.08;

  camera.position.z +=
    (targetZ - camera.position.z) * 0.08;

  // Look slightly ahead of player
  camera.lookAt(
    player.x,
    targetY,
    player.z - 30
  );
}

// =====================================================
// RESIZE
// =====================================================

window.addEventListener("resize", function() {

  camera.aspect =
    window.innerWidth /
    window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

});

// =====================================================
// GAME LOOP
// =====================================================

function gameLoop() {

  requestAnimationFrame(gameLoop);

  updatePlayer();
  updateCamera();

  renderer.render(
    scene,
    camera
  );
}

gameLoop();
