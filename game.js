const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const moneyEl = document.getElementById("money");
const fuelEl = document.getElementById("fuel");
const placeEl = document.getElementById("place");
const messageEl = document.getElementById("message");
const actionBtn = document.getElementById("actionBtn");
const modeEl = document.getElementById("mode");

let W = innerWidth;
let H = innerHeight;

function resize() {
  W = innerWidth;
  H = innerHeight;

  canvas.width = W;
  canvas.height = H;
}

addEventListener("resize", resize);
resize();

/* =========================
   SAVE
========================= */

let save = JSON.parse(
  localStorage.getItem("truckDealerGame")
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

/* =========================
   WORLD
========================= */

const WORLD_WIDTH = 3200;
const WORLD_HEIGHT = 2200;

/* =========================
   MAIN LOCATIONS
========================= */

/*
   SHOWROOM
   সামনে রাস্তার দিকে বড় Gate
*/

const showroom = {
  x: 350,
  y: 180,
  w: 620,
  h: 470
};

/*
   MARKET
*/

const market = {
  x: 2250,
  y: 180,
  w: 600,
  h: 330
};

/*
   GARAGE
   নিচের দিকে বড় Garage
*/

const garage = {
  x: 2200,
  y: 1250,
  w: 650,
  h: 380
};

/*
   WORKER OFFICE
*/

const office = {
  x: 350,
  y: 1350,
  w: 600,
  h: 330
};

/* =========================
   ROAD SYSTEM
========================= */

/*
   Main road:
   Y 720 - 900

   Vertical road:
   X 1200 - 1420

   Lower road:
   Y 1080 - 1190
*/

/* =========================
   PLAYER
========================= */

const player = {
  x: 660,
  y: 390,
  width: 28,
  height: 30,
  speed: 4
};

/* =========================
   TRUCK
========================= */

const truck = {
  x: 660,
  y: 555,
  width: 58,
  height: 105,
  speed: 6,
  angle: 0
};

let driving = false;

/* =========================
   CAMERA
========================= */

const camera = {
  x: 0,
  y: 0
};

/* =========================
   CONTROLS
========================= */

const keys = {
  up: false,
  down: false,
  left: false,
  right: false
};

document.querySelectorAll(".control").forEach(btn => {

  const key = btn.dataset.key;

  function down(e) {
    e.preventDefault();
    keys[key] = true;
  }

  function up(e) {
    e.preventDefault();
    keys[key] = false;
  }

  btn.addEventListener(
    "touchstart",
    down,
    { passive: false }
  );

  btn.addEventListener(
    "touchend",
    up,
    { passive: false }
  );

  btn.addEventListener(
    "touchcancel",
    up,
    { passive: false }
  );

  btn.addEventListener(
    "mousedown",
    down
  );

  btn.addEventListener(
    "mouseup",
    up
  );

  btn.addEventListener(
    "mouseleave",
    up
  );
});

/* Keyboard */

addEventListener("keydown", e => {

  if (
    e.key === "ArrowUp" ||
    e.key.toLowerCase() === "w"
  )
    keys.up = true;

  if (
    e.key === "ArrowDown" ||
    e.key.toLowerCase() === "s"
  )
    keys.down = true;

  if (
    e.key === "ArrowLeft" ||
    e.key.toLowerCase() === "a"
  )
    keys.left = true;

  if (
    e.key === "ArrowRight" ||
    e.key.toLowerCase() === "d"
  )
    keys.right = true;
});

addEventListener("keyup", e => {

  if (
    e.key === "ArrowUp" ||
    e.key.toLowerCase() === "w"
  )
    keys.up = false;

  if (
    e.key === "ArrowDown" ||
    e.key.toLowerCase() === "s"
  )
    keys.down = false;

  if (
    e.key === "ArrowLeft" ||
    e.key.toLowerCase() === "a"
  )
    keys.left = false;

  if (
    e.key === "ArrowRight" ||
    e.key.toLowerCase() === "d"
  )
    keys.right = false;
});

/* =========================
   HOUSES
========================= */

const houses = [];

const houseColors = [
  "#dba46e",
  "#82a8c9",
  "#c78da9",
  "#88b879",
  "#d0bd82",
  "#a890c7"
];

function addHouse(x, y, w, h, color) {
  houses.push({
    x,
    y,
    w,
    h,
    color
  });
}

/*
   IMPORTANT:
   Showroom-এর জায়গা ফাঁকা রাখা হয়েছে।
*/

/* উপরের বাম এলাকা */

addHouse(40, 220, 190, 140, houseColors[0]);
addHouse(40, 420, 190, 140, houseColors[1]);

addHouse(1050, 180, 190, 140, houseColors[2]);
addHouse(1050, 390, 190, 140, houseColors[3]);

/* রাস্তার নিচে */

addHouse(40, 960, 190, 140, houseColors[4]);
addHouse(300, 960, 190, 140, houseColors[5]);

addHouse(580, 960, 190, 140, houseColors[0]);
addHouse(850, 960, 190, 140, houseColors[1]);

/* ডান পাশে */

addHouse(1540, 200, 190, 140, houseColors[2]);
addHouse(1770, 400, 190, 140, houseColors[3]);

addHouse(1540, 960, 190, 140, houseColors[4]);
addHouse(1770, 960, 190, 140, houseColors[5]);

/* নিচের শহর */

addHouse(40, 1760, 190, 140, houseColors[0]);
addHouse(300, 1760, 190, 140, houseColors[1]);

addHouse(1050, 1760, 190, 140, houseColors[2]);
addHouse(1450, 1760, 190, 140, houseColors[3]);

/* =========================
   SHOPS
========================= */

const shops = [
  {
    x: 40,
    y: 650,
    w: 150,
    h: 100,
    name: "SHOP",
    color: "#c62828"
  },

  {
    x: 200,
    y: 650,
    w: 150,
    h: 100,
    name: "CAFE",
    color: "#6d4c41"
  },

  {
    x: 1600,
    y: 650,
    w: 170,
    h: 100,
    name: "PARTS",
    color: "#546e7a"
  },

  {
    x: 1810,
    y: 650,
    w: 170,
    h: 100,
    name: "FOOD",
    color: "#ad1457"
  }
];

/* =========================
   TREES
========================= */

const trees = [];

function addTree(x, y, size = 28) {
  trees.push({
    x,
    y,
    size
  });
}

for (let x = 20; x < WORLD_WIDTH; x += 150) {

  if (
    x < 300 ||
    x > 1000
  ) {
    addTree(x, 620);
  }

  addTree(x + 50, 1030);
}

for (
  let y = 50;
  y < WORLD_HEIGHT;
  y += 150
) {

  if (
    y < 600 ||
    y > 1200
  ) {
    addTree(1150, y);
    addTree(1480, y + 50);
  }
}

/* =========================
   COLLISION RECTANGLES
========================= */

function buildingCollisionRects() {

  const result = [];

  /*
     SHOWROOM WALLS

     Gate:
     X 580 - 740
     Y 610 - 680

     এই অংশ খোলা থাকবে।
  */

  result.push({

    x: showroom.x,
    y: showroom.y,
    w: showroom.w,
    h: 25
  });

  result.push({

    x: showroom.x,
    y: showroom.y,
    w: 25,
    h: showroom.h
  });

  result.push({

    x: showroom.x + showroom.w - 25,
    y: showroom.y,
    w: 25,
    h: showroom.h
  });

  /* showroom bottom wall - gate বাদ */

  result.push({

    x: showroom.x,
    y: showroom.y + showroom.h - 25,
    w: 230,
    h: 25
  });

  result.push({

    x: showroom.x + 390,
    y: showroom.y + showroom.h - 25,
    w: 230,
    h: 25
  });

  /*
     MARKET
  */

  result.push({
    x: market.x,
    y: market.y,
    w: market.w,
    h: 25
  });

  result.push({
    x: market.x,
    y: market.y,
    w: 25,
    h: market.h
  });

  result.push({
    x: market.x + market.w - 25,
    y: market.y,
    w: 25,
    h: market.h
  });

  result.push({
    x: market.x,
    y: market.y + market.h - 25,
    w: market.w,
    h: 25
  });

  /*
     GARAGE
     সামনে বড় Garage Gate
  */

  result.push({
    x: garage.x,
    y: garage.y,
    w: 230,
    h: 25
  });

  result.push({
    x: garage.x + 420,
    y: garage.y,
    w: 230,
    h: 25
  });

  result.push({
    x: garage.x,
    y: garage.y,
    w: 25,
    h: garage.h
  });

  result.push({
    x: garage.x + garage.w - 25,
    y: garage.y,
    w: 25,
    h: garage.h
  });

  result.push({
    x: garage.x,
    y: garage.y + garage.h - 25,
    w: garage.w,
    h: 25
  });

  /*
     OFFICE
  */

  result.push({
    x: office.x,
    y: office.y,
    w: office.w,
    h: 25
  });

  result.push({
    x: office.x,
    y: office.y,
    w: 25,
    h: office.h
  });

  result.push({
    x: office.x + office.w - 25,
    y: office.y,
    w: 25,
    h: office.h
  });

  result.push({
    x: office.x,
    y: office.y + office.h - 25,
    w: office.w,
    h: 25
  });

  return result;
}

/* =========================
   RECTANGLE COLLISION
========================= */

function collision(a, b) {

  return (
    a.x - a.width / 2 < b.x + b.w &&
    a.x + a.width / 2 > b.x &&
    a.y - a.height / 2 < b.y + b.h &&
    a.y + a.height / 2 > b.y
  );
}

function canMove(object, x, y) {

  const test = {
    x,
    y,
    width: object.width,
    height: object.height
  };

  /*
     Buildings
  */

  for (
    const b
    of buildingCollisionRects()
  ) {

    if (
      collision(test, b)
    ) {

      return false;
    }
  }

  /*
     Houses
  */

  for (
    const h
    of houses
  ) {

    if (
      collision(test, h)
    ) {

      return false;
    }
  }

  /*
     Shops
  */

  for (
    const s
    of shops
  ) {

    if (
      collision(test, s)
    ) {

      return false;
    }
  }

  return true;
}

/* =========================
   WORLD LIMIT
========================= */

function limitWorld(o) {

  o.x = Math.max(
    o.width / 2,
    Math.min(
      WORLD_WIDTH - o.width / 2,
      o.x
    )
  );

  o.y = Math.max(
    o.height / 2,
    Math.min(
      WORLD_HEIGHT - o.height / 2,
      o.y
    )
  );
}

/* =========================
   PLAYER MOVEMENT
========================= */

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

/* =========================
   TRUCK MOVEMENT
========================= */

function moveTruck() {

  if (!driving)
    return;

  if (
    save.fuel <= 0
  ) {

    messageEl.textContent =
      "⛽ Fuel শেষ! Garage-এ যান।";

    return;
  }

  if (keys.left) {

    truck.angle -= 0.055;
  }

  if (keys.right) {

    truck.angle += 0.055;
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
      Math.sin(truck.angle) *
      speed;

    const ny =
      truck.y -
      Math.cos(truck.angle) *
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

      save.fuel -= 0.02;

      if (
        save.fuel < 0
      ) {

        save.fuel = 0;
      }

      saveGame();
    }
  }

  limitWorld(truck);
}

/* =========================
   TRUCK ENTER / EXIT
========================= */

function truckDistance() {

  return Math.hypot(
    player.x - truck.x,
    player.y - truck.y
  );
}

function updateActionButton() {

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

    if (driving) {

      driving = false;

      player.x =
        truck.x + 70;

      player.y =
        truck.y;

      modeEl.textContent =
        "🚶 WALK";

      messageEl.textContent =
        "🚶 আপনি ট্রাক থেকে নেমেছেন।";

      return;
    }

    if (
      truckDistance() < 150
    ) {

      driving = true;

      modeEl.textContent =
        "🚚 DRIVING";

      messageEl.textContent =
        "🚚 এখন ট্রাক চালান।";
    }
  }
);

/* =========================
   LOCATION
========================= */

function inside(o, b) {

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
    inside(o, showroom)
  )
    return "🏪 Showroom";

  if (
    inside(o, market)
  )
    return "🚛 Market";

  if (
    inside(o, garage)
  )
    return "🔧 Garage";

  if (
    inside(o, office)
  )
    return "👷 Worker Office";

  return "🛣️ Road";
}

/* =========================
   ROAD DRAW
========================= */

function drawRoads() {

  /* Grass */

  ctx.fillStyle =
    "#5d9f4c";

  ctx.fillRect(
    0,
    0,
    WORLD_WIDTH,
    WORLD_HEIGHT
  );

  /* Main road */

  ctx.fillStyle =
    "#4e4e4e";

  ctx.fillRect(
    0,
    720,
    WORLD_WIDTH,
    180
  );

  /* Vertical road */

  ctx.fillRect(
    1200,
    0,
    220,
    WORLD_HEIGHT
  );

  /* Lower road */

  ctx.fillRect(
    0,
    1080,
    WORLD_WIDTH,
    110
  );

  /* Sidewalk */

  ctx.fillStyle =
    "#bdbdbd";

  ctx.fillRect(
    0,
    695,
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
    1175,
    0,
    25,
    WORLD_HEIGHT
  );

  ctx.fillRect(
    1420,
    0,
    25,
    WORLD_HEIGHT
  );

  /* Road lines */

  ctx.strokeStyle =
    "#f5d85a";

  ctx.lineWidth = 7;

  ctx.setLineDash([
    60,
    40
  ]);

  ctx.beginPath();

  ctx.moveTo(
    0,
    810
  );

  ctx.lineTo(
    WORLD_WIDTH,
    810
  );

  ctx.stroke();

  ctx.beginPath();

  ctx.moveTo(
    1310,
    0
  );

  ctx.lineTo(
    1310,
    WORLD_HEIGHT
  );

  ctx.stroke();

  ctx.setLineDash([]);

  /*
     Showroom driveway
  */

  ctx.fillStyle =
    "#555";

  ctx.fillRect(
    580,
    625,
    160,
    100
  );

  /*
     Garage driveway
  */

  ctx.fillRect(
    2430,
    925,
    160,
    325
  );
}

/* =========================
   HOUSE DRAW
========================= */

function drawHouse(h) {

  /* shadow */

  ctx.fillStyle =
    "rgba(0,0,0,.25)";

  ctx.fillRect(
    h.x + 8,
    h.y + 10,
    h.w,
    h.h
  );

  /* building */

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
    "#65443a";

  ctx.beginPath();

  ctx.moveTo(
    h.x - 12,
    h.y
  );

  ctx.lineTo(
    h.x + h.w / 2,
    h.y - 55
  );

  ctx.lineTo(
    h.x + h.w + 12,
    h.y
  );

  ctx.closePath();

  ctx.fill();

  /* windows */

  ctx.fillStyle =
    "#a5ddff";

  ctx.fillRect(
    h.x + 22,
    h.y + 35,
    42,
    38
  );

  ctx.fillRect(
    h.x + h.w - 64,
    h.y + 35,
    42,
    38
  );

  /* door */

  ctx.fillStyle =
    "#5c3c2d";

  ctx.fillRect(
    h.x + h.w / 2 - 20,
    h.y + h.h - 60,
    40,
    60
  );
}

/* =========================
   SHOP DRAW
========================= */

function drawShop(s) {

  ctx.fillStyle =
    "rgba(0,0,0,.25)";

  ctx.fillRect(
    s.x + 7,
    s.y + 8,
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
    s.x + s.w / 2,
    s.y + 30
  );

  ctx.fillStyle =
    "#9bdcff";

  ctx.fillRect(
    s.x + 20,
    s.y + 50,
    s.w - 40,
    35
  );
}

/* =========================
   TREE DRAW
========================= */

function drawTree(t) {

  ctx.fillStyle =
    "#65452e";

  ctx.fillRect(
    t.x - 5,
    t.y,
    10,
    t.size
  );

  ctx.fillStyle =
    "#287b37";

  ctx.beginPath();

  ctx.arc(
    t.x,
    t.y - 10,
    t.size,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.fillStyle =
    "#3e9948";

  ctx.beginPath();

  ctx.arc(
    t.x - 13,
    t.y,
    t.size * .65,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.beginPath();

  ctx.arc(
    t.x + 13,
    t.y,
    t.size * .65,
    0,
    Math.PI * 2
  );

  ctx.fill();
}

/* =========================
   SHOWROOM DRAW
========================= */

function drawShowroom() {

  /* shadow */

  ctx.fillStyle =
    "rgba(0,0,0,.3)";

  ctx.fillRect(
    showroom.x + 12,
    showroom.y + 12,
    showroom.w,
    showroom.h
  );

  /* building */

  ctx.fillStyle =
    "#1976d2";

  ctx.fillRect(
    showroom.x,
    showroom.y,
    showroom.w,
    showroom.h
  );

  /* roof */

  ctx.fillStyle =
    "#303030";

  ctx.fillRect(
    showroom.x - 8,
    showroom.y - 22,
    showroom.w + 16,
    22
  );

  /* title */

  ctx.fillStyle =
    "#fff";

  ctx.font =
    "bold 32px Arial";

  ctx.textAlign =
    "center";

  ctx.fillText(
    "🏪 SHOWROOM",
    showroom.x + showroom.w / 2,
    showroom.y + 60
  );

  /* windows */

  ctx.fillStyle =
    "#9bdcff";

  ctx.fillRect(
    showroom.x + 45,
    showroom.y + 110,
    110,
    70
  );

  ctx.fillRect(
    showroom.x + showroom.w - 155,
    showroom.y + 110,
    110,
    70
  );

  /*
     SHOWROOM GATE

     বড় গাড়ির গেট
  */

  ctx.fillStyle =
    "#303030";

  ctx.fillRect(
    showroom.x + 230,
    showroom.y + showroom.h - 25,
    160,
    25
  );

  /* gate sign */

  ctx.fillStyle =
    "#ffcc00";

  ctx.fillRect(
    showroom.x + 245,
    showroom.y + showroom.h - 75,
    130,
    42
  );

  ctx.fillStyle =
    "#111";

  ctx.font =
    "bold 16px Arial";

  ctx.fillText(
    "🚪 EXIT",
    showroom.x + 310,
    showroom.y + showroom.h - 48
  );

  /* door sides */

  ctx.fillStyle =
    "#333";

  ctx.fillRect(
    showroom.x + 60,
    showroom.y + showroom.h - 100,
    90,
    100
  );

  ctx.fillRect(
    showroom.x + showroom.w - 150,
    showroom.y + showroom.h - 100,
    90,
    100
  );
}

/* =========================
   MARKET DRAW
========================= */

function drawMarket() {

  drawBuilding(
    market,
    "#8e24aa",
    "🚛 TRUCK MARKET"
  );
}

/* =========================
   GARAGE DRAW
========================= */

function drawGarage() {

  /* shadow */

  ctx.fillStyle =
    "rgba(0,0,0,.3)";

  ctx.fillRect(
    garage.x + 12,
    garage.y + 12,
    garage.w,
    garage.h
  );

  /* building */

  ctx.fillStyle =
    "#ef6c00";

  ctx.fillRect(
    garage.x,
    garage.y,
    garage.w,
    garage.h
  );

  /* roof */

  ctx.fillStyle =
    "#333";

  ctx.fillRect(
    garage.x - 8,
    garage.y - 22,
    garage.w + 16,
    22
  );

  /* title */

  ctx.fillStyle =
    "#fff";

  ctx.font =
    "bold 31px Arial";

  ctx.textAlign =
    "center";

  ctx.fillText(
    "🔧 GARAGE",
    garage.x + garage.w / 2,
    garage.y + 58
  );

  /*
     Garage entrance
  */

  ctx.fillStyle =
    "#252525";

  ctx.fillRect(
    garage.x + 230,
    garage.y,
    190,
    170
  );

  /* inside */

  ctx.fillStyle =
    "#555";

  ctx.fillRect(
    garage.x + 250,
    garage.y + 20,
    150,
    130
  );

  /* sign */

  ctx.fillStyle =
    "#ffd54f";

  ctx.fillRect(
    garage.x + 245,
    garage.y + 195,
    160,
    45
  );

  ctx.fillStyle =
    "#111";

  ctx.font =
    "bold 17px Arial";

  ctx.fillText(
    "🚚 SERVICE",
    garage.x + 325,
    garage.y + 224
  );

  /* windows */

  ctx.fillStyle =
    "#9bdcff";

  ctx.fillRect(
    garage.x + 45,
    garage.y + 75,
    100,
    65
  );

  ctx.fillRect(
    garage.x + garage.w - 145,
    garage.y + 75,
    100,
    65
  );
}

/* =========================
   OFFICE DRAW
========================= */

function drawOffice() {

  drawBuilding(
    office,
    "#00897b",
    "👷 WORKER OFFICE"
  );
}

/* =========================
   NORMAL BUILDING
========================= */

function drawBuilding(
  b,
  color,
  title
) {

  ctx.fillStyle =
    "rgba(0,0,0,.3)";

  ctx.fillRect(
    b.x + 10,
    b.y + 10,
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

  ctx.fillStyle =
    "#303030";

  ctx.fillRect(
    b.x - 8,
    b.y - 20,
    b.w + 16,
    20
  );

  ctx.fillStyle =
    "#fff";

  ctx.font =
    "bold 28px Arial";

  ctx.textAlign =
    "center";

  ctx.fillText(
    title,
    b.x + b.w / 2,
    b.y + 55
  );

  ctx.fillStyle =
    "#9bdcff";

  ctx.fillRect(
    b.x + 45,
    b.y + 100,
    100,
    65
  );

  ctx.fillRect(
    b.x + b.w - 145,
    b.y + 100,
    100,
    65
  );
}

/* =========================
   PLAYER DRAW
========================= */

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
    14,
    18,
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
    -12,
    -7,
    24,
    27
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

/* =========================
   TRUCK DRAW
========================= */

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
    -29,
    -52,
    58,
    108
  );

  /* cargo */

  ctx.fillStyle =
    "#f5b82e";

  ctx.fillRect(
    -23,
    -3,
    46,
    51
  );

  /* cabin */

  ctx.fillStyle =
    "#e53935";

  ctx.fillRect(
    -24,
    -52,
    48,
    50
  );

  /* windshield */

  ctx.fillStyle =
    "#8fd5ff";

  ctx.fillRect(
    -17,
    -44,
    34,
    21
  );

  /* wheels */

  ctx.fillStyle =
    "#111";

  ctx.fillRect(
    -32,
    -35,
    9,
    23
  );

  ctx.fillRect(
    23,
    -35,
    9,
    23
  );

  ctx.fillRect(
    -32,
    22,
    9,
    23
  );

  ctx.fillRect(
    23,
    22,
    9,
    23
  );

  ctx.restore();
}

/* =========================
   WORLD DRAW
========================= */

function drawWorld() {

  drawRoads();

  /*
     Houses
  */

  for (
    const house
    of houses
  ) {

    drawHouse(house);
  }

  /*
     Shops
  */

  for (
    const shop
    of shops
  ) {

    drawShop(shop);
  }

  /*
     Trees
  */

  for (
    const tree
    of trees
  ) {

    drawTree(tree);
  }

  /*
     Locations
  */

  drawShowroom();

  drawMarket();

  drawGarage();

  drawOffice();

  /*
     Truck
  */

  drawTruck();

  /*
     Player
  */

  if (!driving) {

    drawPlayer();
  }
}

/* =========================
   CAMERA
========================= */

function updateCamera() {

  const target =
    driving
      ? truck
      : player;

  camera.x =
    target.x - W / 2;

  camera.y =
    target.y - H / 2;

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

/* =========================
   RENDER
========================= */

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

/* =========================
   HUD
========================= */

function updateHUD() {

  moneyEl.textContent =
    Math.floor(save.money);

  fuelEl.textContent =
    Math.floor(save.fuel);

  placeEl.textContent =
    getLocationName();
}

/* =========================
   GAME LOOP
========================= */

function gameLoop() {

  movePlayer();

  moveTruck();

  updateActionButton();

  updateHUD();

  render();

  requestAnimationFrame(
    gameLoop
  );
}

/* =========================
   START
========================= */

modeEl.textContent =
  "🚶 WALK";

messageEl.textContent =
  "🏪 Showroom-এর ভিতরে আছেন — 🚚 ট্রাকের কাছে যান।";

updateHUD();

gameLoop();
