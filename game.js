const canvas =
  document.getElementById("canvas");

const ctx =
  canvas.getContext("2d");


/* =================================
   SCREEN
================================= */

let W = 0;
let H = 0;

function resize() {

  W = window.innerWidth;
  H = window.innerHeight;

  canvas.width = W;
  canvas.height = H;
}

window.addEventListener(
  "resize",
  resize
);

resize();


/* =================================
   HUD
================================= */

const moneyEl =
  document.getElementById("money");

const fuelEl =
  document.getElementById("fuel");

const placeEl =
  document.getElementById("place");

const messageEl =
  document.getElementById("message");

const actionBtn =
  document.getElementById("actionBtn");

const modeEl =
  document.getElementById("mode");


/* =================================
   SAVE DATA
================================= */

let save =
  JSON.parse(
    localStorage.getItem(
      "truckDealerGame"
    )
  );


if (!save) {

  save = {

    money: 380000,

    fuel: 100
  };
}


function saveGame() {

  localStorage.setItem(

    "truckDealerGame",

    JSON.stringify(save)
  );
}


function updateHUD() {

  moneyEl.textContent =
    Math.floor(save.money);

  fuelEl.textContent =
    Math.floor(save.fuel);

  placeEl.textContent =
    getLocationName();
}


/* =================================
   WORLD
================================= */

const WORLD_WIDTH = 3200;
const WORLD_HEIGHT = 2200;


/* =================================
   BUILDINGS
================================= */

const showroom = {

  x: 280,
  y: 180,

  w: 600,
  h: 370
};


const market = {

  x: 2350,
  y: 180,

  w: 560,
  h: 320
};


const garage = {

  x: 2350,
  y: 1660,

  w: 560,
  h: 300
};


const office = {

  x: 280,
  y: 1660,

  w: 560,
  h: 300
};


/* =================================
   PLAYER
================================= */

const player = {

  x: 580,
  y: 330,

  width: 28,
  height: 28,

  speed: 4
};


/* =================================
   TRUCK
================================= */

const truck = {

  x: 580,
  y: 450,

  width: 58,
  height: 100,

  speed: 6,

  angle: 0
};


let driving = false;


/* =================================
   CAMERA
================================= */

const camera = {

  x: 0,
  y: 0
};


/* =================================
   INPUT
================================= */

const keys = {

  up: false,
  down: false,
  left: false,
  right: false
};


/* =================================
   TOUCH BUTTONS
================================= */

document
.querySelectorAll(".control")
.forEach(button => {

  const key =
    button.dataset.key;


  function start(e) {

    e.preventDefault();

    keys[key] = true;
  }


  function stop(e) {

    e.preventDefault();

    keys[key] = false;
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

});


/* =================================
   KEYBOARD
================================= */

document.addEventListener(
  "keydown",
  e => {

    const k =
      e.key.toLowerCase();


    if (
      e.key === "ArrowUp" ||
      k === "w"
    )
      keys.up = true;


    if (
      e.key === "ArrowDown" ||
      k === "s"
    )
      keys.down = true;


    if (
      e.key === "ArrowLeft" ||
      k === "a"
    )
      keys.left = true;


    if (
      e.key === "ArrowRight" ||
      k === "d"
    )
      keys.right = true;

  }
);


document.addEventListener(
  "keyup",
  e => {

    const k =
      e.key.toLowerCase();


    if (
      e.key === "ArrowUp" ||
      k === "w"
    )
      keys.up = false;


    if (
      e.key === "ArrowDown" ||
      k === "s"
    )
      keys.down = false;


    if (
      e.key === "ArrowLeft" ||
      k === "a"
    )
      keys.left = false;


    if (
      e.key === "ArrowRight" ||
      k === "d"
    )
      keys.right = false;

  }
);


/* =================================
   HOUSES
================================= */

const houses = [];


const houseColors = [

  "#d99a72",
  "#d9b46c",
  "#82a9c9",
  "#b889a7",
  "#86b57c",
  "#c7b98c"
];


function createHouse(
  x,
  y,
  w,
  h,
  color
) {

  houses.push({

    x,
    y,
    w,
    h,

    color
  });
}


/* =================================
   ROADS
================================= */

/*
   Main horizontal road:
   y = 700 → 900

   Secondary horizontal:
   y = 1100 → 1210

   Main vertical:
   x = 1250 → 1450
*/


/* houses above main road */

for (
  let x = 30;
  x < WORLD_WIDTH;
  x += 250
) {

  if (
    x < 1050 ||
    x > 1600
  ) {

    createHouse(

      x,
      500,

      170,
      130,

      houseColors[
        Math.floor(
          x / 250
        ) %
        houseColors.length
      ]
    );
  }
}


/* houses below main road */

for (
  let x = 30;
  x < WORLD_WIDTH;
  x += 270
) {

  if (
    x < 1050 ||
    x > 1600
  ) {

    createHouse(

      x + 50,
      930,

      180,
      130,

      houseColors[
        (
          Math.floor(
            x / 270
          ) + 2
        ) %
        houseColors.length
      ]
    );
  }
}


/* houses around vertical road */

for (
  let y = 40;
  y < WORLD_HEIGHT;
  y += 250
) {

  if (
    y < 620 ||
    y > 1280
  ) {

    createHouse(

      950,
      y,

      180,
      130,

      houseColors[
        Math.floor(
          y / 250
        ) %
        houseColors.length
      ]
    );


    createHouse(

      1490,
      y + 60,

      180,
      130,

      houseColors[
        (
          Math.floor(
            y / 250
          ) + 3
        ) %
        houseColors.length
      ]
    );

  }
}


/* =================================
   SHOPS
================================= */

const shops = [

  {
    x: 40,
    y: 735,

    w: 150,
    h: 105,

    name: "GROCERY",

    color: "#c62828"
  },

  {
    x: 260,
    y: 735,

    w: 150,
    h: 105,

    name: "CAFE",

    color: "#6d4c41"
  },

  {
    x: 1700,
    y: 735,

    w: 170,
    h: 105,

    name: "PARTS",

    color: "#546e7a"
  },

  {
    x: 1950,
    y: 735,

    w: 170,
    h: 105,

    name: "FOOD",

    color: "#ad1457"
  }
];


/* =================================
   TREES
================================= */

const trees = [];


for (
  let x = 30;
  x < WORLD_WIDTH;
  x += 130
) {

  trees.push({

    x: x,

    y: 650,

    size: 25
  });


  trees.push({

    x: x + 45,

    y: 1080,

    size: 25
  });
}


for (
  let y = 40;
  y < WORLD_HEIGHT;
  y += 130
) {

  trees.push({

    x: 1170,

    y,

    size: 26
  });


  trees.push({

    x: 1530,

    y: y + 50,

    size: 26
  });
}


/* =================================
   COLLISION
================================= */

function rectangleCollision(
  object,
  b
) {

  return (

    object.x -
      object.width / 2
      <
      b.x + b.w

    &&

    object.x +
      object.width / 2
      >
      b.x

    &&

    object.y -
      object.height / 2
      <
      b.y + b.h

    &&

    object.y +
      object.height / 2
      >
      b.y

  );
}


function collisionObjects() {

  return [

    ...houses,

    ...shops

  ];
}


function canMove(
  object,
  newX,
  newY
) {

  const test = {

    x: newX,

    y: newY,

    width:
      object.width,

    height:
      object.height
  };


  for (
    const building
    of collisionObjects()
  ) {

    if (
      rectangleCollision(
        test,
        building
      )
    ) {

      return false;
    }
  }


  return true;
}


/* =================================
   WORLD LIMIT
================================= */

function limitWorld(o) {

  const halfW =
    o.width / 2;

  const halfH =
    o.height / 2;


  o.x = Math.max(

    halfW,

    Math.min(
      WORLD_WIDTH - halfW,
      o.x
    )
  );


  o.y = Math.max(

    halfH,

    Math.min(
      WORLD_HEIGHT - halfH,
      o.y
    )
  );
}


/* =================================
   PLAYER MOVEMENT
================================= */

function movePlayer() {

  if (driving)
    return;


  let dx = 0;
  let dy = 0;


  if (keys.up)
    dy -= 1;

  if (keys.down)
    dy += 1;

  if (keys.left)
    dx -= 1;

  if (keys.right)
    dx += 1;


  if (
    dx === 0 &&
    dy === 0
  )
    return;


  const length =
    Math.sqrt(
      dx * dx +
      dy * dy
    );


  dx /= length;
  dy /= length;


  const nx =
    player.x +
    dx * player.speed;


  const ny =
    player.y +
    dy * player.speed;


  /*
     X এবং Y আলাদা করে পরীক্ষা করছি।
     এতে দেয়ালের পাশে আটকে যাবে না।
  */

  if (
    canMove(
      player,
      nx,
      player.y
    )
  ) {

    player.x = nx;
  }


  if (
    canMove(
      player,
      player.x,
      ny
    )
  ) {

    player.y = ny;
  }


  limitWorld(player);
}


/* =================================
   TRUCK MOVEMENT
================================= */

function moveTruck() {

  if (!driving)
    return;


  if (
    save.fuel <= 0
  ) {

    messageEl.textContent =
      "⛽ Fuel শেষ!";

    return;
  }


  /* steering */

  if (keys.left) {

    truck.angle -=
      0.055;
  }


  if (keys.right) {

    truck.angle +=
      0.055;
  }


  let speed = 0;


  if (keys.up)
    speed = truck.speed;


  if (keys.down)
    speed =
      -truck.speed * 0.55;


  if (speed !== 0) {

    const nx =
      truck.x +
      Math.sin(
        truck.angle
      ) *
      speed;


    const ny =
      truck.y -
      Math.cos(
        truck.angle
      ) *
      speed;


    if (
      canMove(
        truck,
        nx,
        ny
      )
    ) {

      truck.x = nx;

      truck.y = ny;

      save.fuel -=
        0.025;

      if (
        save.fuel < 0
      )
        save.fuel = 0;

      saveGame();
    }
  }


  limitWorld(truck);
}


/* =================================
   ENTER TRUCK
================================= */

function truckDistance() {

  return Math.hypot(

    player.x -
      truck.x,

    player.y -
      truck.y
  );
}


function checkTruckButton() {

  if (driving) {

    actionBtn.style.display =
      "block";

    actionBtn.textContent =
      "🚶 ট্রাক থেকে নামুন";

    return;
  }


  if (
    truckDistance() < 150
  ) {

    actionBtn.style.display =
      "block";

    actionBtn.textContent =
      "🚚 ট্রাকে উঠুন";

  } else {

    actionBtn.style.display =
      "none";
  }
}


actionBtn.addEventListener(
  "click",
  () => {

    /* নামা */

    if (driving) {

      driving = false;


      player.x =
        truck.x + 65;

      player.y =
        truck.y;


      modeEl.textContent =
        "🚶 WALK";


      messageEl.textContent =
        "🚶 আপনি ট্রাক থেকে নেমেছেন।";

      return;
    }


    /* ওঠা */

    if (
      truckDistance() < 150
    ) {

      driving = true;


      modeEl.textContent =
        "🚚 DRIVING";


      messageEl.textContent =
        "🚚 ট্রাক চালান!";

    }

  }
);


/* =================================
   LOCATION
================================= */

function inside(
  o,
  b
) {

  return (

    o.x > b.x &&
    o.x < b.x + b.w &&

    o.y > b.y &&
    o.y < b.y + b.h

  );
}


function getLocationName() {

  const o =
    driving
      ? truck
      : player;


  if (
    inside(
      o,
      showroom
    )
  )
    return "🏪 Showroom";


  if (
    inside(
      o,
      market
    )
  )
    return "🚛 Truck Market";


  if (
    inside(
      o,
      garage
    )
  )
    return "🔧 Garage";


  if (
    inside(
      o,
      office
    )
  )
    return "👷 Worker Office";


  return "🛣️ Road";
}


/* =================================
   DRAW ROAD
================================= */

function drawRoads() {

  /* grass */

  ctx.fillStyle =
    "#5b9d49";

  ctx.fillRect(
    0,
    0,
    WORLD_WIDTH,
    WORLD_HEIGHT
  );


  /* main road */

  ctx.fillStyle =
    "#505050";

  ctx.fillRect(

    0,
    700,

    WORLD_WIDTH,
    200
  );


  /* vertical road */

  ctx.fillRect(

    1250,
    0,

    200,
    WORLD_HEIGHT
  );


  /* lower road */

  ctx.fillRect(

    0,
    1100,

    WORLD_WIDTH,
    110
  );


  /* sidewalks */

  ctx.fillStyle =
    "#bcbcbc";


  ctx.fillRect(

    0,
    675,

    WORLD_WIDTH,
    25
  );


  ctx.fillRect(

    0,
    900,

    WORLD_WIDTH,
    25
  );


  ctx.fillRect(

    1225,
    0,

    25,
    WORLD_HEIGHT
  );


  ctx.fillRect(

    1450,
    0,

    25,
    WORLD_HEIGHT
  );


  /* road markings */

  ctx.strokeStyle =
    "#f4d35e";

  ctx.lineWidth = 7;

  ctx.setLineDash([
    55,
    35
  ]);


  ctx.beginPath();

  ctx.moveTo(
    0,
    800
  );

  ctx.lineTo(
    WORLD_WIDTH,
    800
  );

  ctx.stroke();


  ctx.beginPath();

  ctx.moveTo(
    1350,
    0
  );

  ctx.lineTo(
    1350,
    WORLD_HEIGHT
  );

  ctx.stroke();


  ctx.setLineDash([]);
}


/* =================================
   DRAW HOUSE
================================= */

function drawHouse(h) {

  /* shadow */

  ctx.fillStyle =
    "rgba(0,0,0,.25)";

  ctx.fillRect(

    h.x + 9,

    h.y + 12,

    h.w,

    h.h
  );


  /* house */

  ctx.fillStyle =
    h.color;

  ctx.fillRect(

    h.x,
    h.y,

    h.w,
    h.h
  );


  /* roof */

  ctx.fillStyle =
    "#624238";


  ctx.beginPath();

  ctx.moveTo(
    h.x - 12,
    h.y
  );

  ctx.lineTo(

    h.x +
    h.w / 2,

    h.y - 55
  );

  ctx.lineTo(

    h.x +
    h.w + 12,

    h.y
  );

  ctx.closePath();

  ctx.fill();


  /* windows */

  ctx.fillStyle =
    "#9bdcff";


  ctx.fillRect(

    h.x + 22,

    h.y + 35,

    42,

    38
  );


  ctx.fillRect(

    h.x +
    h.w - 64,

    h.y + 35,

    42,

    38
  );


  /* door */

  ctx.fillStyle =
    "#5b3b2d";


  ctx.fillRect(

    h.x +
    h.w / 2 - 20,

    h.y +
    h.h - 60,

    40,

    60
  );
}


/* =================================
   DRAW SHOP
================================= */

function drawShop(s) {

  ctx.fillStyle =
    "rgba(0,0,0,.3)";

  ctx.fillRect(

    s.x + 8,
    s.y + 10,

    s.w,
    s.h
  );


  ctx.fillStyle =
    s.color;

  ctx.fillRect(

    s.x,
    s.y,

    s.w,
    s.h
  );


  ctx.fillStyle =
    "#fff";

  ctx.font =
    "bold 18px Arial";

  ctx.textAlign =
    "center";


  ctx.fillText(

    s.name,

    s.x +
    s.w / 2,

    s.y + 30
  );


  ctx.fillStyle =
    "#a5dcff";


  ctx.fillRect(

    s.x + 20,

    s.y + 50,

    s.w - 40,

    35
  );
}


/* =================================
   DRAW TREE
================================= */

function drawTree(t) {

  ctx.fillStyle =
    "#67452e";

  ctx.fillRect(

    t.x - 5,

    t.y,

    10,

    t.size
  );


  ctx.fillStyle =
    "#287936";


  ctx.beginPath();

  ctx.arc(

    t.x,

    t.y - 8,

    t.size,

    0,

    Math.PI * 2
  );

  ctx.fill();


  ctx.fillStyle =
    "#3d9846";


  ctx.beginPath();

  ctx.arc(

    t.x - 12,

    t.y,

    t.size * .65,

    0,

    Math.PI * 2
  );

  ctx.fill();


  ctx.beginPath();

  ctx.arc(

    t.x + 12,

    t.y,

    t.size * .65,

    0,

    Math.PI * 2
  );

  ctx.fill();
}


/* =================================
   DRAW BIG BUILDING
================================= */

function drawBuilding(
  b,
  color,
  title
) {

  ctx.fillStyle =
    "rgba(0,0,0,.3)";


  ctx.fillRect(

    b.x + 12,
    b.y + 12,

    b.w,
    b.h
  );


  ctx.fillStyle =
    color;


  ctx.fillRect(

    b.x,
    b.y,

    b.w,
    b.h
  );


  /* roof */

  ctx.fillStyle =
    "#303030";


  ctx.fillRect(

    b.x - 8,
    b.y - 20,

    b.w + 16,
    20
  );


  /* title */

  ctx.fillStyle =
    "#fff";

  ctx.font =
    "bold 27px Arial";

  ctx.textAlign =
    "center";


  ctx.fillText(

    title,

    b.x +
    b.w / 2,

    b.y + 55
  );


  /* windows */

  ctx.fillStyle =
    "#9bdcff";


  ctx.fillRect(

    b.x + 40,

    b.y + 95,

    90,

    60
  );


  ctx.fillRect(

    b.x +
    b.w - 130,

    b.y + 95,

    90,

    60
  );


  /* door */

  ctx.fillStyle =
    "#303030";


  ctx.fillRect(

    b.x +
    b.w / 2 - 45,

    b.y +
    b.h - 100,

    90,

    100
  );
}


/* =================================
   DRAW PLAYER
================================= */

function drawPlayer() {

  ctx.save();


  ctx.translate(

    player.x,
    player.y
  );


  /* shadow */

  ctx.fillStyle =
    "rgba(0,0,0,.3)";


  ctx.beginPath();

  ctx.ellipse(

    0,
    13,

    17,
    8,

    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /* body */

  ctx.fillStyle =
    "#1976d2";


  ctx.fillRect(

    -11,
    -8,

    22,
    25
  );


  /* head */

  ctx.fillStyle =
    "#ffd1a3";


  ctx.beginPath();

  ctx.arc(

    0,
    -18,

    10,

    0,
    Math.PI * 2
  );

  ctx.fill();


  ctx.restore();
}


/* =================================
   DRAW TRUCK
================================= */

function drawTruck() {

  ctx.save();


  ctx.translate(

    truck.x,
    truck.y
  );


  ctx.rotate(
    truck.angle
  );


  /* shadow */

  ctx.fillStyle =
    "rgba(0,0,0,.35)";


  ctx.fillRect(

    -28,
    -48,

    56,
    100
  );


  /* cargo */

  ctx.fillStyle =
    "#f5b82e";


  ctx.fillRect(

    -23,
    -2,

    46,
    48
  );


  /* cabin */

  ctx.fillStyle =
    "#e53935";


  ctx.fillRect(

    -24,
    -48,

    48,
    47
  );


  /* windshield */

  ctx.fillStyle =
    "#8fd5ff";


  ctx.fillRect(

    -17,
    -40,

    34,
    20
  );


  /* wheels */

  ctx.fillStyle =
    "#111";


  ctx.fillRect(
    -31,
    -32,
    9,
    22
  );

  ctx.fillRect(
    22,
    -32,
    9,
    22
  );

  ctx.fillRect(
    -31,
    20,
    9,
    22
  );

  ctx.fillRect(
    22,
    20,
    9,
    22
  );


  ctx.restore();
}


/* =================================
   DRAW WORLD
================================= */

function drawWorld() {

  drawRoads();


  /* houses */

  for (
    const house
    of houses
  ) {

    drawHouse(house);
  }


  /* shops */

  for (
    const shop
    of shops
  ) {

    drawShop(shop);
  }


  /* trees */

  for (
    const tree
    of trees
  ) {

    drawTree(tree);
  }


  /* main locations */

  drawBuilding(

    showroom,

    "#1976d2",

    "🏪 SHOWROOM"
  );


  drawBuilding(

    market,

    "#8e24aa",

    "🚛 TRUCK MARKET"
  );


  drawBuilding(

    garage,

    "#ef6c00",

    "🔧 GARAGE"
  );


  drawBuilding(

    office,

    "#00897b",

    "👷 WORKER OFFICE"
  );


  /* truck */

  drawTruck();


  /* player */

  if (!driving) {

    drawPlayer();
  }
}


/* =================================
   CAMERA
================================= */

function updateCamera() {

  const target =
    driving
      ? truck
      : player;


  camera.x =
    target.x -
    W / 2;


  camera.y =
    target.y -
    H / 2;


  camera.x =
    Math.max(

      0,

      Math.min(

        WORLD_WIDTH - W,

        camera.x
      )
    );


  camera.y =
    Math.max(

      0,

      Math.min(

        WORLD_HEIGHT - H,

        camera.y
      )
    );
}


/* =================================
   RENDER
================================= */

function render() {

  ctx.clearRect(

    0,
    0,
    W,
    H
  );


  updateCamera();


  ctx.save();


  ctx.translate(

    -camera.x,
    -camera.y
  );


  drawWorld();


  ctx.restore();
}


/* =================================
   GAME LOOP
================================= */

function gameLoop() {

  movePlayer();

  moveTruck();

  checkTruckButton();

  updateHUD();

  render();


  requestAnimationFrame(
    gameLoop
  );
}


/* =================================
   START
================================= */

updateHUD();

messageEl.textContent =
  "🏪 Showroom-এ আছেন — 🚚 ট্রাকের কাছে যান।";


gameLoop();
