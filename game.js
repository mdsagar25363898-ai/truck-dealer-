import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

import { GLTFLoader } from
"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";


// ======================================================
// TRUCK DEALER GAME
// TRUCK + CHARACTER SYSTEM
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
    canvas,
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

scene.add(
  new THREE.HemisphereLight(
    0xffffff,
    0x555555,
    2.2
  )
);

const sun =
  new THREE.DirectionalLight(
    0xffffff,
    2.5
  );

sun.position.set(
  100,
  200,
  100
);

sun.castShadow =
  true;

sun.shadow.mapSize.width =
  2048;

sun.shadow.mapSize.height =
  2048;

scene.add(
  sun
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

mapTexture.anisotropy =
  renderer.capabilities.getMaxAnisotropy();

const map =
  new THREE.Mesh(

    new THREE.PlaneGeometry(
      1536,
      1024
    ),

    new THREE.MeshStandardMaterial({
      map: mapTexture
    })

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
// GAME PLAYER
// ======================================================

const player = {

  position:
    new THREE.Vector3(
      10,
      0,
      -5
    ),

  rotation: 0,

  speed: 12,

  reverseSpeed: 6,

  turnSpeed: 1.8,

  walkSpeed: 4,

  runSpeed: 7,

  inTruck: true,

  moving: false,

  running: false,

  fuel: 98,

  money: 380000

};


// ======================================================
// TRUCK
// ======================================================

let truck = null;


// ======================================================
// CHARACTER
// ======================================================

let character = null;

let characterMixer = null;

let characterActions = {};

let currentCharacterAction = null;

let characterReady = false;


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
// MOBILE CONTROLS
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

    input[key] = true;

  }


  function stop(e) {

    e.preventDefault();

    input[key] = false;

  }


  button.addEventListener(
    "touchstart",
    start,
    { passive: false }
  );

  button.addEventListener(
    "touchend",
    stop,
    { passive: false }
  );

  button.addEventListener(
    "touchcancel",
    stop,
    { passive: false }
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


buttonHold("up", "up");
buttonHold("down", "down");
buttonHold("left", "left");
buttonHold("right", "right");
buttonHold("runButton", "run");


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
    )
      input.up = true;


    if (
      e.key === "s" ||
      e.key === "S" ||
      e.key === "ArrowDown"
    )
      input.down = true;


    if (
      e.key === "a" ||
      e.key === "A" ||
      e.key === "ArrowLeft"
    )
      input.left = true;


    if (
      e.key === "d" ||
      e.key === "D" ||
      e.key === "ArrowRight"
    )
      input.right = true;


    if (
      e.key === "Shift"
    )
      input.run = true;

  }
);


window.addEventListener(
  "keyup",
  function(e) {

    if (
      e.key === "w" ||
      e.key === "W" ||
      e.key === "ArrowUp"
    )
      input.up = false;


    if (
      e.key === "s" ||
      e.key === "S" ||
      e.key === "ArrowDown"
    )
      input.down = false;


    if (
      e.key === "a" ||
      e.key === "A" ||
      e.key === "ArrowLeft"
    )
      input.left = false;


    if (
      e.key === "d" ||
      e.key === "D" ||
      e.key === "ArrowRight"
    )
      input.right = false;


    if (
      e.key === "Shift"
    )
      input.run = false;

  }
);


// ======================================================
// CREATE TRUCK
// ======================================================

function createTruck() {

  const group =
    new THREE.Group();


  // BODY

  const body =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        3.2,
        1.15,
        5.8
      ),

      new THREE.MeshStandardMaterial({
        color: 0x1565c0,
        roughness: 0.6,
        metalness: 0.15
      })

    );

  body.position.y =
    0.95;

  body.castShadow =
    true;

  group.add(body);


  // CABIN

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

  group.add(cabin);


  // FRONT WINDOW

  const frontWindow =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        2.25,
        0.75,
        0.06
      ),

      new THREE.MeshStandardMaterial({
        color: 0x183a55,
        roughness: 0.2
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


  // SIDE WINDOWS

  const sideGeo =
    new THREE.BoxGeometry(
      0.06,
      0.75,
      1.45
    );

  const windowMat =
    new THREE.MeshStandardMaterial({
      color: 0x183a55,
      roughness: 0.2
    });


  const leftWindow =
    new THREE.Mesh(
      sideGeo,
      windowMat
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
      sideGeo,
      windowMat
    );

  rightWindow.position.set(
    1.36,
    2.35,
    -1.45
  );

  group.add(
    rightWindow
  );


  // WHEELS

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


  const wheelPositions = [

    [-1.7, 0.62, -1.8],

    [1.7, 0.62, -1.8],

    [-1.7, 0.62, 1.75],

    [1.7, 0.62, 1.75]

  ];


  wheelPositions.forEach(
    function(p) {

      const wheel =
        new THREE.Mesh(
          wheelGeo,
          wheelMat
        );

      wheel.rotation.z =
        Math.PI / 2;

      wheel.position.set(
        p[0],
        p[1],
        p[2]
      );

      wheel.castShadow =
        true;

      group.add(
        wheel
      );

    }
  );


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
// LOAD CHARACTER
// ======================================================

const gltfLoader =
  new GLTFLoader();

gltfLoader.load(

  "https://threejs.org/examples/models/gltf/Soldier.glb",

  function(gltf) {

    character =
      gltf.scene;


    character.traverse(
      function(object) {

        if (
          object.isMesh
        ) {

          object.castShadow =
            true;

          object.receiveShadow =
            true;

        }

      }
    );


    // AUTO SCALE

    const box =
      new THREE.Box3()
        .setFromObject(
          character
        );

    const size =
      new THREE.Vector3();

    box.getSize(
      size
    );


    if (size.y > 0) {

      const scale =
        1.8 / size.y;

      character.scale.setScalar(
        scale
      );

    }


    // Put feet on ground

    const groundBox =
      new THREE.Box3()
        .setFromObject(
          character
        );

    character.position.y -=
      groundBox.min.y;


    // Start beside truck

    character.position.set(
      player.position.x + 3,
      0,
      player.position.z
    );


    character.visible =
      false;


    scene.add(
      character
    );


    // ANIMATIONS

    characterMixer =
      new THREE.AnimationMixer(
        character
      );


    gltf.animations.forEach(
      function(clip) {

        characterActions[
          clip.name.toLowerCase()
        ] =
          characterMixer.clipAction(
            clip
          );

      }
    );


    console.log(
      "Character animations:",
      Object.keys(
        characterActions
      )
    );


    characterReady =
      true;


    showMessage(
      "🧍 Character ready"
    );

  },

  function(xhr) {

    if (xhr.total) {

      const percent =
        Math.round(
          xhr.loaded /
          xhr.total *
          100
        );

      showMessage(
        "🧍 Character loading " +
        percent +
        "%"
      );

    }

  },

  function(error) {

    console.error(
      "Character error:",
      error
    );

    showMessage(
      "❌ Character load হয়নি"
    );

  }

);


// ======================================================
// CHARACTER ANIMATION
// ======================================================

function findAnimation(
  type
) {

  const names =
    Object.keys(
      characterActions
    );


  if (type === "idle") {

    return (
      characterActions["idle"] ||
      characterActions["idle.001"] ||
      characterActions["stand"] ||
      characterActions["standing"] ||
      characterActions[names[0]]
    );

  }


  if (type === "walk") {

    return (
      characterActions["walk"] ||
      characterActions["walk.001"] ||
      characterActions["walking"] ||
      characterActions[names[3]]
    );

  }


  if (type === "run") {

    return (
      characterActions["run"] ||
      characterActions["running"] ||
      characterActions["run.001"] ||
      characterActions[names[1]]
    );

  }


  return null;

}


function playCharacterAnimation(
  type
) {

  if (!characterMixer)
    return;


  const action =
    findAnimation(
      type
    );


  if (!action)
    return;


  if (
    currentCharacterAction ===
    action
  )
    return;


  if (
    currentCharacterAction
  ) {

    currentCharacterAction
      .fadeOut(0.15);

  }


  action
    .reset()
    .fadeIn(0.15)
    .play();


  currentCharacterAction =
    action;

}


// ======================================================
// TRUCK MOVEMENT
// ======================================================

function updateTruck(
  delta
) {

  if (!truck)
    return;


  let forward = 0;

  let steering = 0;


  if (input.up)
    forward = 1;

  if (input.down)
    forward = -1;

  if (input.left)
    steering = 1;

  if (input.right)
    steering = -1;


  if (
    forward !== 0
  ) {

    const speed =
      forward > 0
        ? player.speed
        : player.reverseSpeed;


    if (
      steering !== 0
    ) {

      player.rotation +=
        steering *
        player.turnSpeed *
        delta *
        (
          forward > 0
            ? 1
            : -1
        );

    }


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


    player.fuel -=
      delta * 0.04;


    if (
      player.fuel < 0
    )
      player.fuel = 0;

  }


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


  truck.position.copy(
    player.position
  );

  truck.rotation.y =
    player.rotation;

}


// ======================================================
// CHARACTER MOVEMENT
// ======================================================

function updateCharacter(
  delta
) {

  if (
    !character ||
    player.inTruck
  )
    return;


  let x = 0;

  let z = 0;


  if (input.left)
    x -= 1;

  if (input.right)
    x += 1;

  if (input.up)
    z -= 1;

  if (input.down)
    z += 1;


  const moving =
    x !== 0 ||
    z !== 0;


  if (!moving) {

    playCharacterAnimation(
      "idle"
    );

    return;

  }


  const direction =
    new THREE.Vector3(
      x,
      0,
      z
    ).normalize();


  const running =
    input.run;


  const speed =
    running
      ? player.runSpeed
      : player.walkSpeed;


  character.position.addScaledVector(
    direction,
    speed *
    delta
  );


  const targetRotation =
    Math.atan2(
      direction.x,
      direction.z
    );


  character.rotation.y =
    THREE.MathUtils.lerp(
      character.rotation.y,
      targetRotation,
      0.15
    );


  player.position.copy(
    character.position
  );


  player.rotation =
    character.rotation.y;


  if (running) {

    playCharacterAnimation(
      "run"
    );

  } else {

    playCharacterAnimation(
      "walk"
    );

  }

}


// ======================================================
// TRUCK DISTANCE
// ======================================================

function truckDistance() {

  if (
    !truck ||
    !character
  )
    return 999;


  return character.position.distanceTo(
    truck.position
  );

}


// ======================================================
// ENTER / EXIT TRUCK
// ======================================================

function enterExitTruck() {

  if (
    !characterReady
  ) {

    showMessage(
      "🧍 Character এখনও loading হচ্ছে"
    );

    return;

  }


  // EXIT

  if (
    player.inTruck
  ) {

    player.inTruck =
      false;


    character.visible =
      true;


    character.position.copy(
      truck.position
    );


    const exitSide =
      new THREE.Vector3(
        3,
        0,
        0
      );


    exitSide.applyAxisAngle(
      new THREE.Vector3(
        0,
        1,
        0
      ),
      truck.rotation.y
    );


    character.position.add(
      exitSide
    );


    character.position.y =
      0;


    player.position.copy(
      character.position
    );


    playCharacterAnimation(
      "idle"
    );


    showMessage(
      "🧍 Truck থেকে নেমেছেন"
    );


    return;

  }


  // ENTER

  if (
    truckDistance() > 5
  ) {

    showMessage(
      "🚛 Truck-এর কাছে যান"
    );

    return;

  }


  player.inTruck =
    true;


  character.visible =
    false;


  player.position.copy(
    truck.position
  );


  showMessage(
    "🚛 Truck-এ উঠেছেন"
  );

}


// ======================================================
// ACTION BUTTON
// ======================================================

const actionButton =
  document.getElementById(
    "actionButton"
  );


function updateActionButton() {

  if (!actionButton)
    return;


  if (
    player.inTruck
  ) {

    actionButton.style.display =
      "block";

    actionButton.textContent =
      "🚪 EXIT";

  }

  else if (
    truckDistance() < 5
  ) {

    actionButton.style.display =
      "block";

    actionButton.textContent =
      "🚛 DRIVE";

  }

  else {

    actionButton.style.display =
      "none";

  }

}


if (actionButton) {

  actionButton.addEventListener(
    "click",
    enterExitTruck
  );

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
    enterExitTruck
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

      if (
        player.inTruck
      ) {

        showMessage(
          "🚪 EXIT চাপুন"
        );

      }

      else if (
        truckDistance() < 5
      ) {

        showMessage(
          "🚛 DRIVE চাপুন"
        );

      }

      else {

        showMessage(
          "🚶 Truck-এর কাছে যান"
        );

      }

    }
  );

}


// ======================================================
// CAMERA
// ======================================================

function updateCamera() {

  let targetPosition;

  let rotation;


  if (
    player.inTruck
  ) {

    targetPosition =
      player.position.clone();

    rotation =
      player.rotation;

  }

  else {

    if (!character)
      return;

    targetPosition =
      character.position.clone();

    rotation =
      character.rotation.y;

  }


  const distance =
    player.inTruck
      ? 11
      : 6;


  const height =
    player.inTruck
      ? 5.5
      : 3;


  const offset =
    new THREE.Vector3(
      0,
      height,
      distance
    );


  offset.applyAxisAngle(
    new THREE.Vector3(
      0,
      1,
      0
    ),
    rotation
  );


  const cameraTarget =
    targetPosition
      .clone()
      .add(offset);


  camera.position.lerp(
    cameraTarget,
    0.10
  );


  const lookAt =
    targetPosition.clone();


  lookAt.y +=
    player.inTruck
      ? 1.2
      : 1.0;


  camera.lookAt(
    lookAt
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


  if (
    player.inTruck
  ) {

    if (
      Math.abs(x) < 35
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

  else {

    box.textContent =
      "🚶 On Foot";

  }

}


// ======================================================
// HUD
// ======================================================

function updateHUD() {

  const fuel =
    document.querySelectorAll(
      "#fuel, #fuelValue, [data-fuel]"
    );


  fuel.forEach(
    function(el) {

      el.textContent =
        Math.round(
          player.fuel
        );

    }
  );


  const money =
    document.querySelectorAll(
      "#money, #moneyValue, [data-money]"
    );


  money.forEach(
    function(el) {

      el.textContent =
        player.money
          .toLocaleString();

    }
  );

}


// ======================================================
// MESSAGE
// ======================================================

let messageTimer;


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
          player.inTruck
            ? "🚛 Truck চালান"
            : "🚶 Character চালান";

      },
      3000
    );

}


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


  if (
    characterMixer
  ) {

    characterMixer.update(
      delta
    );

  }


  if (
    player.inTruck
  ) {

    updateTruck(
      delta
    );

  }

  else {

    updateCharacter(
      delta
    );

  }


  updateCamera();

  updateLocation();

  updateActionButton();

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
