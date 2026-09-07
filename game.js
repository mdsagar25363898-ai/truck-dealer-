import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";


// ======================================================
// TRUCK DEALER 3D GAME
// CHARACTER SYSTEM REMOVED
// TRUCK = PLAYER
// ======================================================


// ======================================================
// CANVAS
// ======================================================

const canvas =
  document.getElementById("gameCanvas");


// ======================================================
// SCENE
// ======================================================

const scene =
  new THREE.Scene();

scene.background =
  new THREE.Color(0x87ceeb);


// ======================================================
// CAMERA
// ======================================================

const camera =
  new THREE.PerspectiveCamera(
    60,
    window.innerWidth /
      window.innerHeight,
    0.1,
    3000
  );


// ======================================================
// RENDERER
// ======================================================

const renderer =
  new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
  });

renderer.setPixelRatio(
  Math.min(
    window.devicePixelRatio,
    2
  )
);

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.shadowMap.enabled =
  true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;


// ======================================================
// LIGHT
// ======================================================

const hemiLight =
  new THREE.HemisphereLight(
    0xffffff,
    0x555555,
    2.2
  );

scene.add(
  hemiLight
);


const sunLight =
  new THREE.DirectionalLight(
    0xffffff,
    2.5
  );

sunLight.position.set(
  100,
  200,
  100
);

sunLight.castShadow =
  true;

sunLight.shadow.mapSize.width =
  2048;

sunLight.shadow.mapSize.height =
  2048;

scene.add(
  sunLight
);


// ======================================================
// MAP
// ======================================================

const textureLoader =
  new THREE.TextureLoader();

const mapTexture =
  textureLoader.load(
    "map.png"
  );

mapTexture.colorSpace =
  THREE.SRGBColorSpace;

const mapMaterial =
  new THREE.MeshStandardMaterial({
    map: mapTexture
  });

const mapGeometry =
  new THREE.PlaneGeometry(
    1536,
    1024
  );

const map =
  new THREE.Mesh(
    mapGeometry,
    mapMaterial
  );

map.rotation.x =
  -Math.PI / 2;

map.position.y =
  -0.05;

map.receiveShadow =
  true;

scene.add(
  map
);


// ======================================================
// TRUCK PLAYER
// ======================================================

const player = {

  position:
    new THREE.Vector3(
      10,
      0,
      -5
    ),

  rotation: 0,

  speed: 13,

  reverseSpeed: 7,

  turnSpeed: 1.8,

  moving: false,

  fuel: 98,

  money: 380000

};


// ======================================================
// INPUT
// ======================================================

const input = {

  up: false,

  down: false,

  left: false,

  right: false,

  run: false

};


// ======================================================
// MOBILE BUTTON
// ======================================================

function buttonHold(
  id,
  key
) {

  const button =
    document.getElementById(id);

  if (!button)
    return;


  function start(e) {

    e.preventDefault();

    input[key] =
      true;

  }


  function stop(e) {

    e.preventDefault();

    input[key] =
      false;

  }


  button.addEventListener(
    "touchstart",
    start,
    {
      passive: false
    }
  );

  button.addEventListener(
    "touchend",
    stop,
    {
      passive: false
    }
  );

  button.addEventListener(
    "touchcancel",
    stop,
    {
      passive: false
    }
  );


  button.addEventListener(
    "mousedown",
    start
  );

  button.addEventListener(
    "mouseup",
    stop
  );

  button.addEventListener(
    "mouseleave",
    stop
  );

}


buttonHold(
  "up",
  "up"
);

buttonHold(
  "down",
  "down"
);

buttonHold(
  "left",
  "left"
);

buttonHold(
  "right",
  "right"
);

buttonHold(
  "runButton",
  "run"
);


// ======================================================
// KEYBOARD
// ======================================================

window.addEventListener(
  "keydown",
  function(e) {

    if (
      e.key === "w" ||
      e.key === "W" ||
      e.key === "ArrowUp"
    ) {

      input.up =
        true;

    }


    if (
      e.key === "s" ||
      e.key === "S" ||
      e.key === "ArrowDown"
    ) {

      input.down =
        true;

    }


    if (
      e.key === "a" ||
      e.key === "A" ||
      e.key === "ArrowLeft"
    ) {

      input.left =
        true;

    }


    if (
      e.key === "d" ||
      e.key === "D" ||
      e.key === "ArrowRight"
    ) {

      input.right =
        true;

    }


    if (
      e.key === "Shift"
    ) {

      input.run =
        true;

    }

  }
);


window.addEventListener(
  "keyup",
  function(e) {

    if (
      e.key === "w" ||
      e.key === "W" ||
      e.key === "ArrowUp"
    ) {

      input.up =
        false;

    }


    if (
      e.key === "s" ||
      e.key === "S" ||
      e.key === "ArrowDown"
    ) {

      input.down =
        false;

    }


    if (
      e.key === "a" ||
      e.key === "A" ||
      e.key === "ArrowLeft"
    ) {

      input.left =
        false;

    }


    if (
      e.key === "d" ||
      e.key === "D" ||
      e.key === "ArrowRight"
    ) {

      input.right =
        false;

    }


    if (
      e.key === "Shift"
    ) {

      input.run =
        false;

    }

  }
);


// ======================================================
// TRUCK
// ======================================================

let truck = null;


// ======================================================
// CREATE TRUCK
// ======================================================

function createTruck() {

  const group =
    new THREE.Group();


  // --------------------------------------------------
  // MAIN BODY
  // --------------------------------------------------

  const body =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        3.2,
        1.15,
        5.8
      ),

      new THREE.MeshStandardMaterial({
        color: 0x1565c0,
        roughness: 0.65,
        metalness: 0.15
      })

    );

  body.position.y =
    0.95;

  body.castShadow =
    true;

  body.receiveShadow =
    true;

  group.add(
    body
  );


  // --------------------------------------------------
  // CABIN
  // --------------------------------------------------

  const cabin =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        2.7,
        1.9,
        2.25
      ),

      new THREE.MeshStandardMaterial({
        color: 0x1976d2,
        roughness: 0.55,
        metalness: 0.2
      })

    );

  cabin.position.set(
    0,
    2.15,
    -1.45
  );

  cabin.castShadow =
    true;

  cabin.receiveShadow =
    true;

  group.add(
    cabin
  );


  // --------------------------------------------------
  // FRONT WINDOW
  // --------------------------------------------------

  const frontWindow =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        2.25,
        0.75,
        0.05
      ),

      new THREE.MeshStandardMaterial({
        color: 0x183a55,
        roughness: 0.2,
        metalness: 0.1
      })

    );

  frontWindow.position.set(
    0,
    2.35,
    -2.59
  );

  group.add(
    frontWindow
  );


  // --------------------------------------------------
  // SIDE WINDOWS
  // --------------------------------------------------

  const sideWindowGeo =
    new THREE.BoxGeometry(
      0.05,
      0.75,
      1.45
    );

  const windowMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x183a55,
      roughness: 0.2,
      metalness: 0.1
    });


  const leftWindow =
    new THREE.Mesh(
      sideWindowGeo,
      windowMaterial
    );

  leftWindow.position.set(
    -1.36,
    2.35,
    -1.45
  );

  group.add(
    leftWindow
  );


  const rightWindow =
    new THREE.Mesh(
      sideWindowGeo,
      windowMaterial
    );

  rightWindow.position.set(
    1.36,
    2.35,
    -1.45
  );

  group.add(
    rightWindow
  );


  // --------------------------------------------------
  // WHEELS
  // --------------------------------------------------

  const wheelGeo =
    new THREE.CylinderGeometry(
      0.62,
      0.62,
      0.48,
      24
    );

  const wheelMat =
    new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.9
    });


  const wheels = [

    [-1.7, 0.62, -1.8],

    [1.7, 0.62, -1.8],

    [-1.7, 0.62, 1.75],

    [1.7, 0.62, 1.75]

  ];


  wheels.forEach(
    function(pos) {

      const wheel =
        new THREE.Mesh(
          wheelGeo,
          wheelMat
        );

      wheel.rotation.z =
        Math.PI / 2;

      wheel.position.set(
        pos[0],
        pos[1],
        pos[2]
      );

      wheel.castShadow =
        true;

      wheel.receiveShadow =
        true;

      group.add(
        wheel
      );

    }
  );


  // --------------------------------------------------
  // HEADLIGHTS
  // --------------------------------------------------

  const lightGeo =
    new THREE.BoxGeometry(
      0.55,
      0.3,
      0.08
    );

  const lightMat =
    new THREE.MeshStandardMaterial({
      color: 0xffffcc,
      emissive: 0xffffaa,
      emissiveIntensity: 1
    });


  const leftLight =
    new THREE.Mesh(
      lightGeo,
      lightMat
    );

  leftLight.position.set(
    -0.9,
    1.05,
    -2.92
  );

  group.add(
    leftLight
  );


  const rightLight =
    new THREE.Mesh(
      lightGeo,
      lightMat
    );

  rightLight.position.set(
    0.9,
    1.05,
    -2.92
  );

  group.add(
    rightLight
  );


  // --------------------------------------------------
  // BUMPER
  // --------------------------------------------------

  const bumper =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        3.35,
        0.25,
        0.25
      ),

      new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: 0.7,
        roughness: 0.3
      })

    );

  bumper.position.set(
    0,
    0.55,
    -2.95
  );

  bumper.castShadow =
    true;

  group.add(
    bumper
  );


  // --------------------------------------------------
  // START POSITION
  // --------------------------------------------------

  group.position.copy(
    player.position
  );

  group.rotation.y =
    player.rotation;


  scene.add(
    group
  );


  return group;

}


truck =
  createTruck();


// ======================================================
// TRUCK MOVEMENT
// ======================================================

function updatePlayer(delta) {

  if (!truck)
    return;


  let forward =
    0;

  let steering =
    0;


  if (input.up)
    forward = 1;


  if (input.down)
    forward = -1;


  if (input.left)
    steering = 1;


  if (input.right)
    steering = -1;


  player.moving =
    forward !== 0;


  // --------------------------------------------------
  // SPEED
  // --------------------------------------------------

  let speed =
    forward >= 0
      ? player.speed
      : player.reverseSpeed;


  // SHIFT = BOOST
  if (
    input.run &&
    forward > 0
  ) {

    speed *= 1.35;

  }


  // --------------------------------------------------
  // STEERING
  // --------------------------------------------------

  if (
    forward !== 0 &&
    steering !== 0
  ) {

    player.rotation +=
      steering *
      player.turnSpeed *
      delta *
      (forward > 0 ? 1 : -1);

  }


  // --------------------------------------------------
  // MOVE
  // --------------------------------------------------

  if (
    forward !== 0
  ) {

    const direction =
      new THREE.Vector3(
        Math.sin(
          player.rotation
        ),
        0,
        Math.cos(
          player.rotation
        )
      );


    player.position.addScaledVector(
      direction,
      -forward *
      speed *
      delta
    );


    // Fuel consumption
    player.fuel -=
      delta *
      (
        input.run
          ? 0.12
          : 0.05
      );


    if (
      player.fuel < 0
    ) {

      player.fuel = 0;

    }

  }


  // --------------------------------------------------
  // KEEP TRUCK INSIDE MAP
  // --------------------------------------------------

  player.position.x =
    THREE.MathUtils.clamp(
      player.position.x,
      -740,
      740
    );

  player.position.z =
    THREE.MathUtils.clamp(
      player.position.z,
      -490,
      490
    );


  // --------------------------------------------------
  // APPLY TO TRUCK
  // --------------------------------------------------

  truck.position.copy(
    player.position
  );

  truck.rotation.y =
    player.rotation;

}


// ======================================================
// CAMERA
// ======================================================

const cameraDistance =
  11;

const cameraHeight =
  6;


function updateCamera() {

  if (!truck)
    return;


  const offset =
    new THREE.Vector3(
      0,
      cameraHeight,
      cameraDistance
    );


  offset.applyAxisAngle(
    new THREE.Vector3(
      0,
      1,
      0
    ),
    player.rotation
  );


  const target =
    player.position
      .clone()
      .add(offset);


  camera.position.lerp(
    target,
    0.10
  );


  const lookAt =
    player.position
      .clone();


  lookAt.y +=
    1.2;


  camera.lookAt(
    lookAt
  );

}


// ======================================================
// MESSAGE
// ======================================================

let messageTimer = null;


function showMessage(
  text
) {

  const box =
    document.getElementById(
      "message"
    );


  if (!box)
    return;


  box.textContent =
    text;


  clearTimeout(
    messageTimer
  );


  messageTimer =
    setTimeout(
      function() {

        box.textContent =
          "Truck চালানোর জন্য উপরের/নিচের বাটন ব্যবহার করুন";

      },
      3000
    );

}


// ======================================================
// LOCATION
// ======================================================

function updateLocation() {

  const box =
    document.getElementById(
      "locationBox"
    );


  if (!box)
    return;


  const x =
    player.position.x;

  const z =
    player.position.z;


  if (
    Math.abs(x) < 35 &&
    Math.abs(z) < 35
  ) {

    box.textContent =
      "🏪 Showroom";

  }

  else if (
    x > 40
  ) {

    box.textContent =
      "🚛 Truck Market";

  }

  else {

    box.textContent =
      "🛣️ City Road";

  }

}


// ======================================================
// HUD UPDATE
// ======================================================

function updateHUD() {

  // Fuel
  const fuelElements =
    document.querySelectorAll(
      "#fuel, #fuelValue, [data-fuel]"
    );


  fuelElements.forEach(
    function(el) {

      el.textContent =
        Math.max(
          0,
          Math.round(
            player.fuel
          )
        );

    }
  );


  // Money
  const moneyElements =
    document.querySelectorAll(
      "#money, #moneyValue, [data-money]"
    );


  moneyElements.forEach(
    function(el) {

      el.textContent =
        Math.round(
          player.money
        ).toLocaleString();

    }
  );

}


// ======================================================
// TRUCK ACTION BUTTON
// ======================================================

const actionButton =
  document.getElementById(
    "actionButton"
  );


if (actionButton) {

  actionButton.style.display =
    "none";

}


// ======================================================
// TRUCK BUTTON
// ======================================================

const truckButton =
  document.getElementById(
    "truckButton"
  );


if (truckButton) {

  truckButton.addEventListener(
    "click",
    function() {

      showMessage(
        "🚛 Truck ready — Drive করুন!"
      );

    }
  );

}


// ======================================================
// HAND BUTTON
// ======================================================

const handButton =
  document.getElementById(
    "handButton"
  );


if (handButton) {

  handButton.addEventListener(
    "click",
    function() {

      showMessage(
        "🚛 আপনি Truck চালাচ্ছেন"
      );

    }
  );

}


// ======================================================
// ACTION BUTTON
// ======================================================

if (actionButton) {

  actionButton.addEventListener(
    "click",
    function() {

      showMessage(
        "🚛 Truck চালানো হচ্ছে"
      );

    }
  );

}


// ======================================================
// START MESSAGE
// ======================================================

showMessage(
  "🚛 Truck ready — Drive করুন!"
);


// ======================================================
// GAME LOOP
// ======================================================

const clock =
  new THREE.Clock();


function gameLoop() {

  requestAnimationFrame(
    gameLoop
  );


  const delta =
    Math.min(
      clock.getDelta(),
      0.05
    );


  updatePlayer(
    delta
  );


  updateCamera();


  updateLocation();


  updateHUD();


  renderer.render(
    scene,
    camera
  );

}


gameLoop();


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
