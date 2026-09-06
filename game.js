import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

import { GLTFLoader } from
"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";


// ======================================================
// TRUCK DEALER 3D GAME
// ======================================================

const canvas = document.getElementById("gameCanvas");

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87ceeb);


// ======================================================
// CAMERA
// ======================================================

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  3000
);


// ======================================================
// RENDERER
// ======================================================

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.shadowMap.enabled = true;


// ======================================================
// LIGHT
// ======================================================

const hemiLight = new THREE.HemisphereLight(
  0xffffff,
  0x555555,
  2.2
);

scene.add(hemiLight);


const sunLight = new THREE.DirectionalLight(
  0xffffff,
  2.5
);

sunLight.position.set(
  100,
  200,
  100
);

sunLight.castShadow = true;

scene.add(sunLight);


// ======================================================
// MAP
// ======================================================

const textureLoader = new THREE.TextureLoader();

const mapTexture = textureLoader.load(
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

map.position.y = -0.05;

map.receiveShadow = true;

scene.add(map);


// ======================================================
// PLAYER
// ======================================================

let playerModel = null;

let mixer = null;

let actions = {};

let currentAction = null;

const player = {

  position: new THREE.Vector3(
    0,
    0,
    0
  ),

  rotation: 0,

  walkSpeed: 3.0,

  runSpeed: 5.5,

  moving: false,

  running: false,

  inTruck: false

};


// ======================================================
// LOAD PLAYER GLB
// ======================================================

const loader =
  new GLTFLoader();

loader.load(

  "player.glb",

  function(gltf) {

    playerModel =
      gltf.scene;


    // --------------------------------------------------
    // SHADOW
    // --------------------------------------------------

    playerModel.traverse(
      function(object) {

        if (object.isMesh) {

          object.castShadow = true;

          object.receiveShadow = true;

        }

      }
    );


    // --------------------------------------------------
    // AUTO SCALE
    // --------------------------------------------------

    const box =
      new THREE.Box3()
        .setFromObject(
          playerModel
        );

    const size =
      new THREE.Vector3();

    box.getSize(size);


    const height =
      size.y;


    if (height > 0) {

      // Character target height
      const targetHeight = 1.8;

      const scale =
        targetHeight / height;

      playerModel.scale.setScalar(
        scale
      );

    }


    // --------------------------------------------------
    // PUT FEET ON GROUND
    // --------------------------------------------------

    const fixedBox =
      new THREE.Box3()
        .setFromObject(
          playerModel
        );


    playerModel.position.y -=
      fixedBox.min.y;


    // Starting position
    playerModel.position.x =
      player.position.x;

    playerModel.position.z =
      player.position.z;


    scene.add(
      playerModel
    );


    // --------------------------------------------------
    // ANIMATIONS
    // --------------------------------------------------

    if (
      gltf.animations &&
      gltf.animations.length > 0
    ) {

      mixer =
        new THREE.AnimationMixer(
          playerModel
        );


      gltf.animations.forEach(
        function(clip) {

          const name =
            clip.name.toLowerCase();

          actions[name] =
            mixer.clipAction(
              clip
            );

        }
      );


      console.log(
        "Player animations:",
        Object.keys(actions)
      );


      playAnimation(
        "idle"
      );

    }


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
        "Character loading " +
        percent +
        "%"
      );

    }

  },

  function(error) {

    console.error(
      error
    );

    showMessage(
      "❌ player.glb লোড হয়নি"
    );

  }

);


// ======================================================
// ANIMATION
// ======================================================

function getAction(type) {

  const names =
    Object.keys(actions);


  if (type === "idle") {

    return (
      actions["idle"] ||
      actions["idle.001"] ||
      actions["stand"] ||
      actions["standing"] ||
      null
    );

  }


  if (type === "walk") {

    return (
      actions["walk"] ||
      actions["walking"] ||
      actions["walk.001"] ||
      null
    );

  }


  if (type === "run") {

    return (
      actions["run"] ||
      actions["running"] ||
      actions["run.001"] ||
      null
    );

  }


  return null;

}


function playAnimation(type) {

  if (!mixer) return;


  const action =
    getAction(type);


  if (!action) {

    return;

  }


  if (
    currentAction === action
  ) {

    return;

  }


  if (currentAction) {

    currentAction.fadeOut(
      0.15
    );

  }


  action
    .reset()
    .fadeIn(0.15)
    .play();


  currentAction =
    action;

}


// ======================================================
// MOBILE CONTROLS
// ======================================================

const input = {

  up: false,

  down: false,

  left: false,

  right: false,

  run: false

};


function buttonHold(
  id,
  key
) {

  const button =
    document.getElementById(id);

  if (!button) return;


  const start =
    function(e) {

      e.preventDefault();

      input[key] = true;

    };


  const stop =
    function(e) {

      e.preventDefault();

      input[key] = false;

    };


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
      e.key === "ArrowUp"
    )
      input.up = true;


    if (
      e.key === "s" ||
      e.key === "ArrowDown"
    )
      input.down = true;


    if (
      e.key === "a" ||
      e.key === "ArrowLeft"
    )
      input.left = true;


    if (
      e.key === "d" ||
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
      e.key === "ArrowUp"
    )
      input.up = false;


    if (
      e.key === "s" ||
      e.key === "ArrowDown"
    )
      input.down = false;


    if (
      e.key === "a" ||
      e.key === "ArrowLeft"
    )
      input.left = false;


    if (
      e.key === "d" ||
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
// PLAYER MOVEMENT
// ======================================================

function updatePlayer(delta) {

  if (!playerModel)
    return;


  if (player.inTruck)
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


  player.moving =
    x !== 0 ||
    z !== 0;


  player.running =
    player.moving &&
    input.run;


  if (!player.moving) {

    playAnimation(
      "idle"
    );

    return;

  }


  const direction =
    new THREE.Vector3(
      x,
      0,
      z
    );


  direction.normalize();


  const speed =
    player.running
      ? player.runSpeed
      : player.walkSpeed;


  player.position.addScaledVector(
    direction,
    speed * delta
  );


  // Character faces movement direction
  const targetRotation =
    Math.atan2(
      direction.x,
      direction.z
    );


  player.rotation =
    THREE.MathUtils.lerp(
      player.rotation,
      targetRotation,
      0.15
    );


  playerModel.rotation.y =
    player.rotation;


  playerModel.position.x =
    player.position.x;


  playerModel.position.z =
    player.position.z;


  if (player.running) {

    playAnimation(
      "run"
    );

  } else {

    playAnimation(
      "walk"
    );

  }

}


// ======================================================
// THIRD PERSON CAMERA
// ======================================================

const cameraDistance = 6;

const cameraHeight = 3;


function updateCamera() {

  if (!playerModel)
    return;


  const behind =
    new THREE.Vector3(
      0,
      cameraHeight,
      cameraDistance
    );


  behind.applyAxisAngle(
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
      .add(behind);


  camera.position.lerp(
    target,
    0.12
  );


  const lookAt =
    player.position
      .clone();


  lookAt.y += 1.0;


  camera.lookAt(
    lookAt
  );

}


// ======================================================
// SIMPLE TRUCK
// ======================================================

let truck = null;


function createTruck() {

  const group =
    new THREE.Group();


  const body =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        3,
        1.1,
        5.5
      ),

      new THREE.MeshStandardMaterial({
        color: 0x1565c0
      })

    );


  body.position.y = 0.9;

  body.castShadow = true;

  group.add(body);


  const cabin =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        2.6,
        1.8,
        2.1
      ),

      new THREE.MeshStandardMaterial({
        color: 0x1976d2
      })

    );


  cabin.position.set(
    0,
    2.0,
    -1.4
  );

  cabin.castShadow = true;

  group.add(cabin);


  const wheelGeo =
    new THREE.CylinderGeometry(
      0.58,
      0.58,
      0.45,
      20
    );


  const wheelMat =
    new THREE.MeshStandardMaterial({
      color: 0x111111
    });


  const wheels = [

    [-1.6, 0.55, -1.7],

    [1.6, 0.55, -1.7],

    [-1.6, 0.55, 1.7],

    [1.6, 0.55, 1.7]

  ];


  wheels.forEach(
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

      wheel.castShadow = true;

      group.add(wheel);

    }
  );


  group.position.set(
    10,
    0,
    -5
  );


  scene.add(
    group
  );


  return group;

}


truck =
  createTruck();


// ======================================================
// TRUCK BUTTON
// ======================================================

function truckDistance() {

  if (
    !truck ||
    !playerModel
  )
    return 999;


  return player.position.distanceTo(
    truck.position
  );

}


function enterTruck() {

  if (!playerModel)
    return;


  if (player.inTruck) {

    player.inTruck =
      false;

    playerModel.visible =
      true;

    player.position.x += 3;

    playerModel.position.copy(
      player.position
    );

    showMessage(
      "🚪 ট্রাক থেকে নামলেন"
    );

    return;

  }


  if (
    truckDistance() > 5
  ) {

    showMessage(
      "🚛 ট্রাকের কাছে যান"
    );

    return;

  }


  player.inTruck =
    true;

  playerModel.visible =
    false;

  showMessage(
    "🚛 আপনি ট্রাকে উঠেছেন"
  );

}


document
  .getElementById(
    "truckButton"
  )
  .addEventListener(
    "click",
    enterTruck
  );


document
  .getElementById(
    "actionButton"
  )
  .addEventListener(
    "click",
    enterTruck
  );


document
  .getElementById(
    "handButton"
  )
  .addEventListener(
    "click",
    function() {

      if (
        truckDistance() < 5
      ) {

        document
          .getElementById(
            "actionButton"
          )
          .style.display =
          "block";

        showMessage(
          "🚛 DRIVE চাপুন"
        );

      } else {

        showMessage(
          "এখানে কোনো interaction নেই"
        );

      }

    }
  );


// ======================================================
// MESSAGE
// ======================================================

let messageTimer;


function showMessage(text) {

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
          "Showroom থেকে বের হয়ে আসুন";

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


  if (player.inTruck) {

    box.textContent =
      "🚛 Driving";

    return;

  }


  if (
    Math.abs(
      player.position.x
    ) < 35 &&
    Math.abs(
      player.position.z
    ) < 35
  ) {

    box.textContent =
      "🏪 Showroom";

  }

  else if (
    player.position.x > 40
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
// INTERACTION BUTTON
// ======================================================

function updateInteraction() {

  const button =
    document.getElementById(
      "actionButton"
    );


  if (!button)
    return;


  if (player.inTruck) {

    button.style.display =
      "block";

    button.textContent =
      "🚪 EXIT";

  }

  else if (
    truckDistance() < 5
  ) {

    button.style.display =
      "block";

    button.textContent =
      "🚛 DRIVE";

  }

  else {

    button.style.display =
      "none";

  }

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


  if (mixer) {

    mixer.update(
      delta
    );

  }


  updatePlayer(
    delta
  );

  updateCamera();

  updateLocation();

  updateInteraction();


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
