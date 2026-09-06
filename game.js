// =====================================================
// 🚚 TRUCK DEALER GAME
// PLAYER + FOLLOW CAMERA + MAP
// =====================================================

const canvas = document.getElementById("gameCanvas");


// =====================================================
// SCENE
// =====================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87ceeb);


// =====================================================
// CAMERA
// =====================================================

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);


// =====================================================
// RENDERER
// =====================================================

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: false
});

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);


// =====================================================
// LIGHT
// =====================================================

const ambientLight = new THREE.AmbientLight(
  0xffffff,
  2
);

scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(
  0xffffff,
  2
);

sunLight.position.set(
  200,
  500,
  200
);

scene.add(sunLight);


// =====================================================
// MAP
// =====================================================

const WORLD_W = 1536;
const WORLD_H = 1024;

const mapLoader = new THREE.TextureLoader();

const mapTexture = mapLoader.load(
  "map.png"
);

mapTexture.colorSpace =
  THREE.SRGBColorSpace;

const mapMaterial =
  new THREE.MeshBasicMaterial({
    map: mapTexture
  });

const mapGeometry =
  new THREE.PlaneGeometry(
    WORLD_W,
    WORLD_H
  );

const mapMesh =
  new THREE.Mesh(
    mapGeometry,
    mapMaterial
  );


// Map lies on the ground
mapMesh.rotation.x =
  -Math.PI / 2;

mapMesh.position.set(
  0,
  0,
  0
);

scene.add(mapMesh);


// =====================================================
// PLAYER
// =====================================================

// 🏪 Showroom starting position
// Approximate position based on your map.

const player = {

  x: -510,

  z: 65,

  speed: 2.2,

  direction: 0

};


// =====================================================
// PLAYER CHARACTER IMAGE
// =====================================================

const playerLoader =
  new THREE.TextureLoader();

const playerTexture =
  playerLoader.load(
    "player.png"
  );

playerTexture.colorSpace =
  THREE.SRGBColorSpace;


// Transparent material
const playerMaterial =
  new THREE.MeshBasicMaterial({

    map: playerTexture,

    transparent: true,

    alphaTest: 0.05,

    side: THREE.DoubleSide

  });


// Character size
const playerGeometry =
  new THREE.PlaneGeometry(
    55,
    85
  );


// Character mesh
const playerMesh =
  new THREE.Mesh(
    playerGeometry,
    playerMaterial
  );


// Starting position
playerMesh.position.set(
  player.x,
  42,
  player.z
);


// Character always faces camera
playerMesh.rotation.y = 0;

scene.add(playerMesh);


// =====================================================
// PLAYER SHADOW
// =====================================================

const shadowGeometry =
  new THREE.CircleGeometry(
    18,
    32
  );

const shadowMaterial =
  new THREE.MeshBasicMaterial({

    color: 0x000000,

    transparent: true,

    opacity: 0.25

  });

const playerShadow =
  new THREE.Mesh(
    shadowGeometry,
    shadowMaterial
  );

playerShadow.rotation.x =
  -Math.PI / 2;

playerShadow.position.set(
  player.x,
  0.5,
  player.z
);

scene.add(playerShadow);


// =====================================================
// CONTROLS
// =====================================================

const keys = {

  up: false,

  down: false,

  left: false,

  right: false

};


// =====================================================
// KEYBOARD
// =====================================================

window.addEventListener(
  "keydown",
  function(e) {

    const key =
      e.key.toLowerCase();

    if (
      key === "arrowup" ||
      key === "w"
    ) {
      keys.up = true;
    }

    if (
      key === "arrowdown" ||
      key === "s"
    ) {
      keys.down = true;
    }

    if (
      key === "arrowleft" ||
      key === "a"
    ) {
      keys.left = true;
    }

    if (
      key === "arrowright" ||
      key === "d"
    ) {
      keys.right = true;
    }

  }
);


window.addEventListener(
  "keyup",
  function(e) {

    const key =
      e.key.toLowerCase();

    if (
      key === "arrowup" ||
      key === "w"
    ) {
      keys.up = false;
    }

    if (
      key === "arrowdown" ||
      key === "s"
    ) {
      keys.down = false;
    }

    if (
      key === "arrowleft" ||
      key === "a"
    ) {
      keys.left = false;
    }

    if (
      key === "arrowright" ||
      key === "d"
    ) {
      keys.right = false;
    }

  }
);


// =====================================================
// MOBILE BUTTON
// =====================================================

function setupButton(
  id,
  keyName
) {

  const button =
    document.getElementById(id);

  if (!button) return;


  function press(e) {

    e.preventDefault();

    keys[keyName] = true;

  }


  function release(e) {

    e.preventDefault();

    keys[keyName] = false;

  }


  button.addEventListener(
    "touchstart",
    press,
    { passive: false }
  );

  button.addEventListener(
    "touchend",
    release,
    { passive: false }
  );

  button.addEventListener(
    "touchcancel",
    release,
    { passive: false }
  );


  button.addEventListener(
    "mousedown",
    press
  );

  button.addEventListener(
    "mouseup",
    release
  );

  button.addEventListener(
    "mouseleave",
    release
  );

}


// Mobile controls
setupButton(
  "upBtn",
  "up"
);

setupButton(
  "downBtn",
  "down"
);

setupButton(
  "leftBtn",
  "left"
);

setupButton(
  "rightBtn",
  "right"
);


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


  // Diagonal movement
  if (
    dx !== 0 &&
    dz !== 0
  ) {

    dx *= 0.707;

    dz *= 0.707;

  }


  player.x += dx;

  player.z += dz;


  // Map boundaries

  const maxX =
    WORLD_W / 2 - 35;

  const maxZ =
    WORLD_H / 2 - 35;


  player.x =
    Math.max(
      -maxX,
      Math.min(
        maxX,
        player.x
      )
    );


  player.z =
    Math.max(
      -maxZ,
      Math.min(
        maxZ,
        player.z
      )
    );


  // Update character

  playerMesh.position.x =
    player.x;

  playerMesh.position.z =
    player.z;


  // Update shadow

  playerShadow.position.x =
    player.x;

  playerShadow.position.z =
    player.z;


  // Walking animation
  if (
    dx !== 0 ||
    dz !== 0
  ) {

    playerMesh.position.y =
      42 +
      Math.sin(
        performance.now() * 0.012
      ) * 1.5;

  } else {

    playerMesh.position.y =
      42;

  }

}


// =====================================================
// FOLLOW CAMERA
// =====================================================

function updateCamera() {

  // Camera stays behind player

  const cameraDistance = 95;

  const cameraHeight = 55;


  const targetCameraX =
    player.x;

  const targetCameraY =
    cameraHeight;

  const targetCameraZ =
    player.z +
    cameraDistance;


  // Smooth movement

  camera.position.x +=
    (
      targetCameraX -
      camera.position.x
    ) * 0.10;


  camera.position.y +=
    (
      targetCameraY -
      camera.position.y
    ) * 0.10;


  camera.position.z +=
    (
      targetCameraZ -
      camera.position.z
    ) * 0.10;


  // Look at player

  camera.lookAt(
    player.x,
    28,
    player.z - 25
  );

}


// =====================================================
// CAMERA START POSITION
// =====================================================

camera.position.set(
  player.x,
  55,
  player.z + 95
);

camera.lookAt(
  player.x,
  28,
  player.z - 25
);


// =====================================================
// RESIZE
// =====================================================

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


// =====================================================
// GAME LOOP
// =====================================================

function gameLoop() {

  requestAnimationFrame(
    gameLoop
  );


  updatePlayer();

  updateCamera();


  renderer.render(
    scene,
    camera
  );

}


// START GAME
gameLoop();
