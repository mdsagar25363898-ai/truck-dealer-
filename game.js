import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

import { GLTFLoader } from
"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";


// =====================================================
// TRUCK DEALER 3D
// =====================================================

const canvas = document.getElementById("gameCanvas");


// -----------------------------------------------------
// SCENE
// -----------------------------------------------------

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87ceeb);


// -----------------------------------------------------
// CAMERA
// -----------------------------------------------------

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);

camera.position.set(0, 4, 7);


// -----------------------------------------------------
// RENDERER
// -----------------------------------------------------

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


// -----------------------------------------------------
// LIGHT
// -----------------------------------------------------

const ambientLight = new THREE.HemisphereLight(
  0xffffff,
  0x666666,
  2.0
);

scene.add(ambientLight);


const sun = new THREE.DirectionalLight(
  0xffffff,
  2.0
);

sun.position.set(100, 200, 100);

sun.castShadow = true;

scene.add(sun);


// -----------------------------------------------------
// MAP
// -----------------------------------------------------

const textureLoader = new THREE.TextureLoader();

const mapTexture = textureLoader.load(
  "map.png",
  () => {
    console.log("Map loaded");
  },
  undefined,
  () => {
    console.log("Map could not load");
  }
);

mapTexture.colorSpace = THREE.SRGBColorSpace;

const mapMaterial = new THREE.MeshStandardMaterial({
  map: mapTexture
});

const mapGeometry = new THREE.PlaneGeometry(
  1536,
  1024
);

const map = new THREE.Mesh(
  mapGeometry,
  mapMaterial
);

map.rotation.x = -Math.PI / 2;

map.position.y = -0.05;

map.receiveShadow = true;

scene.add(map);


// -----------------------------------------------------
// PLAYER
// -----------------------------------------------------

let playerModel = null;

let mixer = null;

let animations = {};

let currentAnimation = null;

const player = {

  position: new THREE.Vector3(
    0,
    0,
    0
  ),

  speed: 3.2,

  runSpeed: 6.0,

  rotation: 0,

  moving: false,

  running: false,

  inTruck: false

};


// -----------------------------------------------------
// PLAYER GLB
// -----------------------------------------------------

const gltfLoader = new GLTFLoader();

gltfLoader.load(

  "player.glb",

  function(gltf) {

    playerModel = gltf.scene;

    // Scale character
    playerModel.scale.set(
      1,
      1,
      1
    );

    playerModel.position.copy(
      player.position
    );

    playerModel.traverse(
      function(object) {

        if (object.isMesh) {

          object.castShadow = true;

          object.receiveShadow = true;

        }

      }
    );

    scene.add(playerModel);


    // -------------------------------------------------
    // ANIMATION SYSTEM
    // -------------------------------------------------

    if (gltf.animations &&
        gltf.animations.length > 0) {

      mixer = new THREE.AnimationMixer(
        playerModel
      );

      gltf.animations.forEach(
        function(clip) {

          const name =
            clip.name.toLowerCase();

          animations[name] =
            mixer.clipAction(clip);

        }
      );

      console.log(
        "Animations:",
        Object.keys(animations)
      );

      playAnimation("idle");

    }

    showMessage(
      "Character ready — Showroom থেকে বের হন"
    );

  },

  function(progress) {

    if (progress.total > 0) {

      const percent =
        Math.round(
          progress.loaded /
          progress.total *
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
      "player.glb error:",
      error
    );

    showMessage(
      "player.glb পাওয়া যায়নি"
    );

  }

);


// -----------------------------------------------------
// ANIMATION
// -----------------------------------------------------

function findAnimation(keyword) {

  const keys =
    Object.keys(animations);

  for (const key of keys) {

    if (key.includes(keyword)) {

      return animations[key];

    }

  }

  return null;

}


function playAnimation(type) {

  if (!mixer) return;

  let action = null;

  if (type === "idle") {

    action =
      findAnimation("idle") ||
      findAnimation("stand");

  }

  if (type === "walk") {

    action =
      findAnimation("walk") ||
      findAnimation("walking");

  }

  if (type === "run") {

    action =
      findAnimation("run") ||
      findAnimation("running");

  }

  if (!action) {

    return;

  }

  if (currentAnimation === action) {

    return;

  }

  if (currentAnimation) {

    currentAnimation.fadeOut(0.15);

  }

  action
    .reset()
    .fadeIn(0.15)
    .play();

  currentAnimation = action;

}


// -----------------------------------------------------
// INPUT
// -----------------------------------------------------

const keys = {

  up: false,
  down: false,
  left: false,
  right: false,

  run: false

};


// -----------------------------------------------------
// MOBILE BUTTON
// -----------------------------------------------------

function holdButton(
  element,
  property
) {

  const button =
    document.getElementById(element);

  if (!button) return;


  function start(e) {

    e.preventDefault();

    keys[property] = true;

  }


  function end(e) {

    e.preventDefault();

    keys[property] = false;

  }


  button.addEventListener(
    "touchstart",
    start,
    { passive: false }
  );

  button.addEventListener(
    "touchend",
    end,
    { passive: false }
  );

  button.addEventListener(
    "touchcancel",
    end,
    { passive: false }
  );


  button.addEventListener(
    "mousedown",
    start
  );

  button.addEventListener(
    "mouseup",
    end
  );

  button.addEventListener(
    "mouseleave",
    end
  );

}


holdButton("up", "up");

holdButton("down", "down");

holdButton("left", "left");

holdButton("right", "right");

holdButton("runButton", "run");


// -----------------------------------------------------
// KEYBOARD
// -----------------------------------------------------

window.addEventListener(
  "keydown",
  function(e) {

    if (e.key === "w" ||
        e.key === "ArrowUp") {

      keys.up = true;

    }

    if (e.key === "s" ||
        e.key === "ArrowDown") {

      keys.down = true;

    }

    if (e.key === "a" ||
        e.key === "ArrowLeft") {

      keys.left = true;

    }

    if (e.key === "d" ||
        e.key === "ArrowRight") {

      keys.right = true;

    }

    if (e.key === "Shift") {

      keys.run = true;

    }

  }
);


window.addEventListener(
  "keyup",
  function(e) {

    if (e.key === "w" ||
        e.key === "ArrowUp") {

      keys.up = false;

    }

    if (e.key === "s" ||
        e.key === "ArrowDown") {

      keys.down = false;

    }

    if (e.key === "a" ||
        e.key === "ArrowLeft") {

      keys.left = false;

    }

    if (e.key === "d" ||
        e.key === "ArrowRight") {

      keys.right = false;

    }

    if (e.key === "Shift") {

      keys.run = false;

    }

  }
);


// -----------------------------------------------------
// MOVE PLAYER
// -----------------------------------------------------

const clock = new THREE.Clock();


function updatePlayer(delta) {

  if (!playerModel) return;

  if (player.inTruck) return;


  let forward = 0;

  let side = 0;


  if (keys.up) {

    forward += 1;

  }

  if (keys.down) {

    forward -= 1;

  }

  if (keys.left) {

    side -= 1;

  }

  if (keys.right) {

    side += 1;

  }


  player.moving =
    forward !== 0 ||
    side !== 0;


  player.running =
    player.moving &&
    keys.run;


  if (!player.moving) {

    playAnimation("idle");

    return;

  }


  // Speed

  const speed =
    player.running
      ? player.runSpeed
      : player.speed;


  // Direction

  const direction =
    new THREE.Vector3(
      side,
      0,
      -forward
    );


  if (direction.lengthSq() > 0) {

    direction.normalize();

  }


  // Move

  player.position.x +=
    direction.x *
    speed *
    delta;

  player.position.z +=
    direction.z *
    speed *
    delta;


  // Character rotation

  const targetRotation =
    Math.atan2(
      direction.x,
      direction.z
    );


  player.rotation =
    THREE.MathUtils.lerp(
      player.rotation,
      targetRotation,
      0.18
    );


  playerModel.rotation.y =
    player.rotation;


  playerModel.position.copy(
    player.position
  );


  // Animation

  if (player.running) {

    playAnimation("run");

  } else {

    playAnimation("walk");

  }

}


// -----------------------------------------------------
// FOLLOW CAMERA
// -----------------------------------------------------

const cameraOffset =
  new THREE.Vector3(
    0,
    3.2,
    6.5
  );


function updateCamera() {

  if (!playerModel) return;


  const offset =
    cameraOffset.clone();


  offset.applyAxisAngle(
    new THREE.Vector3(0, 1, 0),
    player.rotation
  );


  const desiredPosition =
    player.position
      .clone()
      .add(offset);


  camera.position.lerp(
    desiredPosition,
    0.10
  );


  const lookPosition =
    player.position
      .clone();


  lookPosition.y += 1.25;


  camera.lookAt(
    lookPosition
  );

}


// -----------------------------------------------------
// TRUCK
// -----------------------------------------------------

let truck = null;


function createTruck() {

  const group =
    new THREE.Group();


  // Body

  const body =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        3.2,
        1.2,
        6
      ),

      new THREE.MeshStandardMaterial({
        color: 0x1d4ed8
      })

    );


  body.position.y = 1;

  body.castShadow = true;

  group.add(body);


  // Cabin

  const cabin =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        2.7,
        1.8,
        2.2
      ),

      new THREE.MeshStandardMaterial({
        color: 0x2563eb
      })

    );


  cabin.position.set(
    0,
    2.1,
    -1.5
  );

  cabin.castShadow = true;

  group.add(cabin);


  // Wheels

  const wheelGeometry =
    new THREE.CylinderGeometry(
      0.65,
      0.65,
      0.45,
      20
    );


  const wheelMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x111111
    });


  const wheelPositions = [

    [-1.65, 0.65, -1.8],
    [ 1.65, 0.65, -1.8],

    [-1.65, 0.65,  1.8],
    [ 1.65, 0.65,  1.8]

  ];


  wheelPositions.forEach(
    function(pos) {

      const wheel =
        new THREE.Mesh(
          wheelGeometry,
          wheelMaterial
        );

      wheel.rotation.z =
        Math.PI / 2;

      wheel.position.set(
        pos[0],
        pos[1],
        pos[2]
      );

      wheel.castShadow = true;

      group.add(wheel);

    }
  );


  group.position.set(
    12,
    0,
    -5
  );


  scene.add(group);

  return group;

}


truck = createTruck();


// -----------------------------------------------------
// TRUCK INTERACTION
// -----------------------------------------------------

function distanceToTruck() {

  if (!truck || !playerModel) {

    return 999;

  }

  return player.position.distanceTo(
    truck.position
  );

}


function enterTruck() {

  if (player.inTruck) {

    exitTruck();

    return;

  }


  if (distanceToTruck() > 5) {

    showMessage(
      "🚛 ট্রাকের কাছে যান"
    );

    return;

  }


  player.inTruck = true;


  playerModel.visible = false;


  showMessage(
    "🚛 আপনি ট্রাকে উঠেছেন"
  );

  document.getElementById(
    "truckName"
  ).textContent =
    "Mini Truck";


  document.getElementById(
    "actionButton"
  ).style.display =
    "block";

}


function exitTruck() {

  player.inTruck = false;


  playerModel.visible = true;


  player.position.x += 3;


  playerModel.position.copy(
    player.position
  );


  showMessage(
    "আপনি ট্রাক থেকে নেমেছেন"
  );

}


document.getElementById(
  "truckButton"
).addEventListener(
  "click",
  enterTruck
);


document.getElementById(
  "actionButton"
).addEventListener(
  "click",
  enterTruck
);


// -----------------------------------------------------
// INTERACT
// -----------------------------------------------------

document.getElementById(
  "handButton"
).addEventListener(
  "click",
  function() {

    if (
      distanceToTruck() < 5 &&
      !player.inTruck
    ) {

      showMessage(
        "🚛 ট্রাক চালাতে INTERACT চাপুন"
      );

      document.getElementById(
        "actionButton"
      ).style.display =
        "block";

    } else {

      showMessage(
        "এখানে এখন কিছু করার নেই"
      );

    }

  }
);


// -----------------------------------------------------
// MESSAGE
// -----------------------------------------------------

let messageTimer = null;


function showMessage(text) {

  const message =
    document.getElementById(
      "message"
    );

  message.textContent = text;


  clearTimeout(messageTimer);


  messageTimer =
    setTimeout(
      function() {

        message.textContent =
          "Showroom থেকে বের হয়ে আসুন";

      },
      3000
    );

}


// -----------------------------------------------------
// LOCATION
// -----------------------------------------------------

function updateLocation() {

  const location =
    document.getElementById(
      "locationBox"
    );


  if (player.inTruck) {

    location.textContent =
      "🚛 Driving";

    return;

  }


  const x =
    player.position.x;

  const z =
    player.position.z;


  if (
    Math.abs(x) < 40 &&
    Math.abs(z) < 40
  ) {

    location.textContent =
      "🏪 Showroom";

  }

  else if (
    x > 40
  ) {

    location.textContent =
      "🚛 Truck Market";

  }

  else {

    location.textContent =
      "🛣️ City Road";

  }

}


// -----------------------------------------------------
// UPDATE TRUCK BUTTON
// -----------------------------------------------------

function updateTruckInteraction() {

  const button =
    document.getElementById(
      "actionButton"
    );


  if (
    !player.inTruck &&
    distanceToTruck() < 5
  ) {

    button.style.display =
      "block";

    button.textContent =
      "🚛 DRIVE";

  }

  else if (
    player.inTruck
  ) {

    button.style.display =
      "block";

    button.textContent =
      "🚪 EXIT";

  }

  else {

    button.style.display =
      "none";

  }

}


// -----------------------------------------------------
// ANIMATION LOOP
// -----------------------------------------------------

function animate() {

  requestAnimationFrame(
    animate
  );


  const delta =
    Math.min(
      clock.getDelta(),
      0.05
    );


  if (mixer) {

    mixer.update(delta);

  }


  updatePlayer(delta);

  updateCamera();

  updateLocation();

  updateTruckInteraction();


  renderer.render(
    scene,
    camera
  );

}


animate();


// -----------------------------------------------------
// RESIZE
// -----------------------------------------------------

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
