// ======================================================
// TRUCK DEALER - NORMAL 3D PLAYER
// Showroom start + third person follow camera
// ======================================================

const canvas = document.getElementById("gameCanvas");

if (!canvas) {
  console.error("gameCanvas পাওয়া যায়নি");
}

// -------------------- THREE.JS --------------------

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  3000
);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// -------------------- LIGHT --------------------

const hemiLight = new THREE.HemisphereLight(
  0xffffff,
  0x667788,
  2.2
);

scene.add(hemiLight);

const sun = new THREE.DirectionalLight(
  0xffffff,
  3
);

sun.position.set(200, 400, 200);
sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

scene.add(sun);

// ======================================================
// GAME STATE
// ======================================================

let money = Number(localStorage.getItem("td_money")) || 380000;
let fuel = Number(localStorage.getItem("td_fuel")) || 83;

let gameMode = "walking";

const player = {
  x: 0,
  y: 0,
  z: 0,
  speed: 0.16,
  runSpeed: 0.28,
  rotation: 0
};

const keys = {
  up: false,
  down: false,
  left: false,
  right: false,
  run: false
};

// ======================================================
// MAP
// ======================================================

const mapTexture = new THREE.TextureLoader().load("map.png");

const mapMaterial = new THREE.MeshStandardMaterial({
  map: mapTexture
});

const mapGeometry = new THREE.PlaneGeometry(1536, 1024);

const map = new THREE.Mesh(
  mapGeometry,
  mapMaterial
);

map.rotation.x = -Math.PI / 2;
map.position.y = -0.05;

map.receiveShadow = true;

scene.add(map);

// ======================================================
// PLAYER
// ======================================================

const playerGroup = new THREE.Group();

scene.add(playerGroup);

playerGroup.position.set(0, 0, 0);

// ------------------------------------------------------
// BODY
// ------------------------------------------------------

const blackMaterial = new THREE.MeshStandardMaterial({
  color: 0x171717,
  roughness: 0.8
});

const whiteMaterial = new THREE.MeshStandardMaterial({
  color: 0xf4f4f4,
  roughness: 0.7
});

const blueMaterial = new THREE.MeshStandardMaterial({
  color: 0x24528a,
  roughness: 0.9
});

const skinMaterial = new THREE.MeshStandardMaterial({
  color: 0xc98b62,
  roughness: 0.9
});

const hairMaterial = new THREE.MeshStandardMaterial({
  color: 0x241a16,
  roughness: 0.9
});

const shoeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.7
});

// ======================================================
// LEGS
// ======================================================

const legGeometry = new THREE.BoxGeometry(
  0.34,
  1.25,
  0.36
);

const leftLeg = new THREE.Mesh(
  legGeometry,
  blueMaterial
);

const rightLeg = new THREE.Mesh(
  legGeometry,
  blueMaterial
);

leftLeg.position.set(-0.22, 0.72, 0);
rightLeg.position.set(0.22, 0.72, 0);

leftLeg.castShadow = true;
rightLeg.castShadow = true;

playerGroup.add(leftLeg);
playerGroup.add(rightLeg);

// ======================================================
// SHOES
// ======================================================

const shoeGeometry = new THREE.BoxGeometry(
  0.42,
  0.20,
  0.65
);

const leftShoe = new THREE.Mesh(
  shoeGeometry,
  shoeMaterial
);

const rightShoe = new THREE.Mesh(
  shoeGeometry,
  shoeMaterial
);

leftShoe.position.set(-0.22, 0.12, 0.10);
rightShoe.position.set(0.22, 0.12, 0.10);

leftShoe.castShadow = true;
rightShoe.castShadow = true;

playerGroup.add(leftShoe);
playerGroup.add(rightShoe);

// ======================================================
// BODY / JACKET
// ======================================================

const bodyGeometry = new THREE.BoxGeometry(
  0.95,
  1.15,
  0.52
);

const body = new THREE.Mesh(
  bodyGeometry,
  blackMaterial
);

body.position.y = 1.65;
body.castShadow = true;

playerGroup.add(body);

// ======================================================
// WHITE T-SHIRT
// ======================================================

const shirtGeometry = new THREE.BoxGeometry(
  0.43,
  0.72,
  0.56
);

const shirt = new THREE.Mesh(
  shirtGeometry,
  whiteMaterial
);

shirt.position.set(
  0,
  1.68,
  -0.01
);

playerGroup.add(shirt);

// ======================================================
// HEAD
// ======================================================

const headGeometry = new THREE.SphereGeometry(
  0.39,
  24,
  20
);

const head = new THREE.Mesh(
  headGeometry,
  skinMaterial
);

head.position.y = 2.55;
head.castShadow = true;

playerGroup.add(head);

// ======================================================
// HAIR
// ======================================================

const hairGeometry = new THREE.SphereGeometry(
  0.41,
  20,
  14
);

const hair = new THREE.Mesh(
  hairGeometry,
  hairMaterial
);

hair.scale.set(
  1,
  0.65,
  0.95
);

hair.position.set(
  0,
  2.82,
  -0.02
);

playerGroup.add(hair);

// ======================================================
// SUNGLASSES
// ======================================================

const glassesMaterial = new THREE.MeshStandardMaterial({
  color: 0x080808,
  roughness: 0.2,
  metalness: 0.2
});

const glassGeometry = new THREE.BoxGeometry(
  0.30,
  0.10,
  0.035
);

const glassLeft = new THREE.Mesh(
  glassGeometry,
  glassesMaterial
);

const glassRight = new THREE.Mesh(
  glassGeometry,
  glassesMaterial
);

glassLeft.position.set(
  -0.17,
  2.59,
  -0.37
);

glassRight.position.set(
  0.17,
  2.59,
  -0.37
);

playerGroup.add(glassLeft);
playerGroup.add(glassRight);

// ======================================================
// ARMS
// ======================================================

const armGeometry = new THREE.BoxGeometry(
  0.28,
  1.05,
  0.30
);

const leftArm = new THREE.Mesh(
  armGeometry,
  blackMaterial
);

const rightArm = new THREE.Mesh(
  armGeometry,
  blackMaterial
);

leftArm.position.set(
  -0.63,
  1.63,
  0
);

rightArm.position.set(
  0.63,
  1.63,
  0
);

leftArm.castShadow = true;
rightArm.castShadow = true;

playerGroup.add(leftArm);
playerGroup.add(rightArm);

// ======================================================
// HANDS
// ======================================================

const handGeometry = new THREE.SphereGeometry(
  0.15,
  12,
  10
);

const leftHand = new THREE.Mesh(
  handGeometry,
  skinMaterial
);

const rightHand = new THREE.Mesh(
  handGeometry,
  skinMaterial
);

leftHand.position.set(
  -0.63,
  1.08,
  0
);

rightHand.position.set(
  0.63,
  1.08,
  0
);

playerGroup.add(leftHand);
playerGroup.add(rightHand);

// ======================================================
// PLAYER SIZE
// ======================================================

// Realistic game-world scale
playerGroup.scale.set(
  1.0,
  1.0,
  1.0
);

// ======================================================
// SHOWROOM START POSITION
// ======================================================

playerGroup.position.set(
  0,
  0,
  0
);

// ======================================================
// CAMERA
// ======================================================

const cameraOffset = new THREE.Vector3(
  0,
  3.8,
  6.8
);

const cameraLook = new THREE.Vector3();

function updateCamera() {

  const desiredCamera = new THREE.Vector3();

  desiredCamera.copy(cameraOffset);

  desiredCamera.applyAxisAngle(
    new THREE.Vector3(0, 1, 0),
    playerGroup.rotation.y
  );

  desiredCamera.add(playerGroup.position);

  camera.position.lerp(
    desiredCamera,
    0.10
  );

  cameraLook.set(
    playerGroup.position.x,
    playerGroup.position.y + 1.4,
    playerGroup.position.z
  );

  camera.lookAt(cameraLook);
}

// ======================================================
// KEYBOARD
// ======================================================

window.addEventListener("keydown", function(e) {

  if (
    e.key === "ArrowUp" ||
    e.key === "w" ||
    e.key === "W"
  ) {
    keys.up = true;
  }

  if (
    e.key === "ArrowDown" ||
    e.key === "s" ||
    e.key === "S"
  ) {
    keys.down = true;
  }

  if (
    e.key === "ArrowLeft" ||
    e.key === "a" ||
    e.key === "A"
  ) {
    keys.left = true;
  }

  if (
    e.key === "ArrowRight" ||
    e.key === "d" ||
    e.key === "D"
  ) {
    keys.right = true;
  }

  if (
    e.key === "Shift"
  ) {
    keys.run = true;
  }

});

window.addEventListener("keyup", function(e) {

  if (
    e.key === "ArrowUp" ||
    e.key === "w" ||
    e.key === "W"
  ) {
    keys.up = false;
  }

  if (
    e.key === "ArrowDown" ||
    e.key === "s" ||
    e.key === "S"
  ) {
    keys.down = false;
  }

  if (
    e.key === "ArrowLeft" ||
    e.key === "a" ||
    e.key === "A"
  ) {
    keys.left = false;
  }

  if (
    e.key === "ArrowRight" ||
    e.key === "d" ||
    e.key === "D"
  ) {
    keys.right = false;
  }

  if (
    e.key === "Shift"
  ) {
    keys.run = false;
  }

});

// ======================================================
// MOBILE BUTTONS
// ======================================================

function bindButton(id, key) {

  const button = document.getElementById(id);

  if (!button) return;

  button.addEventListener("touchstart", function(e) {
    e.preventDefault();
    keys[key] = true;
  }, { passive: false });

  button.addEventListener("touchend", function(e) {
    e.preventDefault();
    keys[key] = false;
  }, { passive: false });

  button.addEventListener("touchcancel", function() {
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

bindButton("upBtn", "up");
bindButton("downBtn", "down");
bindButton("leftBtn", "left");
bindButton("rightBtn", "right");
bindButton("runBtn", "run");

// ======================================================
// PLAYER MOVEMENT
// ======================================================

let moving = false;
let walkTime = 0;

function updatePlayer() {

  let dx = 0;
  let dz = 0;

  if (keys.up) dz -= 1;
  if (keys.down) dz += 1;
  if (keys.left) dx -= 1;
  if (keys.right) dx += 1;

  const length = Math.sqrt(
    dx * dx + dz * dz
  );

  moving = length > 0;

  if (!moving) {

    leftLeg.rotation.x = THREE.MathUtils.lerp(
      leftLeg.rotation.x,
      0,
      0.20
    );

    rightLeg.rotation.x = THREE.MathUtils.lerp(
      rightLeg.rotation.x,
      0,
      0.20
    );

    leftArm.rotation.x = THREE.MathUtils.lerp(
      leftArm.rotation.x,
      0,
      0.20
    );

    rightArm.rotation.x = THREE.MathUtils.lerp(
      rightArm.rotation.x,
      0,
      0.20
    );

    return;
  }

  dx /= length;
  dz /= length;

  const speed = keys.run
    ? player.runSpeed
    : player.speed;

  playerGroup.position.x += dx * speed;
  playerGroup.position.z += dz * speed;

  // Face movement direction
  const targetRotation = Math.atan2(
    dx,
    dz
  );

  playerGroup.rotation.y = THREE.MathUtils.lerp(
    playerGroup.rotation.y,
    targetRotation,
    0.18
  );

  // Walking animation
  walkTime += keys.run ? 0.25 : 0.18;

  const swing = Math.sin(walkTime) * 0.45;

  leftLeg.rotation.x = swing;
  rightLeg.rotation.x = -swing;

  leftArm.rotation.x = -swing;
  rightArm.rotation.x = swing;
}

// ======================================================
// MAP BOUNDARY
// ======================================================

function keepPlayerInsideMap() {

  playerGroup.position.x = THREE.MathUtils.clamp(
    playerGroup.position.x,
    -740,
    740
  );

  playerGroup.position.z = THREE.MathUtils.clamp(
    playerGroup.position.z,
    -490,
    490
  );
}

// ======================================================
// SHOWROOM MARKER
// ======================================================

const markerMaterial = new THREE.MeshStandardMaterial({
  color: 0xffc107,
  emissive: 0x664400
});

const markerGeometry = new THREE.CylinderGeometry(
  1.3,
  1.3,
  0.08,
  32
);

const showroomMarker = new THREE.Mesh(
  markerGeometry,
  markerMaterial
);

showroomMarker.position.set(
  0,
  0.04,
  -2
);

scene.add(showroomMarker);

// ======================================================
// HUD
// ======================================================

function updateHUD() {

  const moneyElement =
    document.getElementById("money");

  const fuelElement =
    document.getElementById("fuel");

  if (moneyElement) {
    moneyElement.textContent =
      money.toLocaleString("en-US");
  }

  if (fuelElement) {
    fuelElement.textContent =
      Math.round(fuel) + "%";
  }
}

updateHUD();

// ======================================================
// RESIZE
// ======================================================

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

// ======================================================
// START CAMERA
// ======================================================

camera.position.set(
  0,
  3.8,
  6.8
);

camera.lookAt(
  0,
  1.4,
  0
);

// ======================================================
// GAME LOOP
// ======================================================

function gameLoop() {

  requestAnimationFrame(gameLoop);

  updatePlayer();
  keepPlayerInsideMap();
  updateCamera();

  renderer.render(
    scene,
    camera
  );
}

gameLoop();
