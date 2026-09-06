const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const mapImage = new Image();
mapImage.src = "map.png";

let W = window.innerWidth;
let H = window.innerHeight;

canvas.width = W;
canvas.height = H;

/*
  আপনার দেওয়া Map-এর মূল অনুপাত।
  Map বড় থাকলেও স্ক্রিন অনুযায়ী নিজে scale হবে।
*/
const WORLD_W = 1536;
const WORLD_H = 1024;


/* =========================
   GAME STATE
========================= */

let money = Number(localStorage.getItem("td_money")) || 380000;
let fuel = Number(localStorage.getItem("td_fuel")) || 100;
let truckName =
  localStorage.getItem("td_truck") || "Mini Truck";

let mode = "drive";

let truck = {
  x: 520,
  y: 570,
  width: 42,
  height: 70,
  speed: 2.8,
  angle: 0
};

let player = {
  x: 520,
  y: 570,
  speed: 3.2
};

let keys = {
  up:false,
  down:false,
  left:false,
  right:false
};

let camera = {
  x:0,
  y:0
};


/* =========================
   MAP LOCATIONS
========================= */

const locations = {

  showroom:{
    name:"🏪 Showroom",
    x:520,
    y:520,
    radius:100
  },

  gate:{
    name:"🚪 Showroom Gate",
    x:520,
    y:600,
    radius:70
  },

  usedMarket:{
    name:"🚛 Used Truck Market",
    x:850,
    y:630,
    radius:105
  },

  garage:{
    name:"🔧 Truck Garage",
    x:1320,
    y:520,
    radius:100
  },

  service:{
    name:"🛠️ Service Center",
    x:970,
    y:470,
    radius:90
  },

  fuel:{
    name:"⛽ Fuel Station",
    x:1060,
    y:190,
    radius:90
  },

  warehouse:{
    name:"📦 Warehouse",
    x:1330,
    y:310,
    radius:100
  },

  parking:{
    name:"🅿️ Parking Area",
    x:1000,
    y:600,
    radius:90
  },

  food:{
    name:"🍔 Food & Rest",
    x:760,
    y:820,
    radius:90
  },

  highway:{
    name:"🛣️ Main Highway",
    x:1190,
    y:800,
    radius:110
  }
};


/* =========================
   UI
========================= */

const moneyEl = document.getElementById("money");
const fuelEl = document.getElementById("fuel");
const truckEl = document.getElementById("truckName");

const locationEl = document.getElementById("location");
const messageEl = document.getElementById("message");

const actionBtn = document.getElementById("actionBtn");
const modeBtn = document.getElementById("modeBtn");

const marketPanel = document.getElementById("marketPanel");
const garagePanel = document.getElementById("garagePanel");

const garageTruck = document.getElementById("garageTruck");
const garageFuel = document.getElementById("garageFuel");


function updateUI(){

  moneyEl.textContent = Math.floor(money).toLocaleString();

  fuelEl.textContent = Math.max(0,Math.floor(fuel));

  truckEl.textContent = truckName;

  garageTruck.textContent = truckName;

  garageFuel.textContent = Math.floor(fuel) + "%";

  localStorage.setItem("td_money",money);
  localStorage.setItem("td_fuel",fuel);
  localStorage.setItem("td_truck",truckName);
}


/* =========================
   RESIZE
========================= */

function resize(){

  W = window.innerWidth;
  H = window.innerHeight;

  canvas.width = W;
  canvas.height = H;
}

window.addEventListener("resize",resize);


/* =========================
   KEYBOARD
========================= */

window.addEventListener("keydown",e=>{

  if(e.key==="ArrowUp" || e.key.toLowerCase()==="w")
    keys.up=true;

  if(e.key==="ArrowDown" || e.key.toLowerCase()==="s")
    keys.down=true;

  if(e.key==="ArrowLeft" || e.key.toLowerCase()==="a")
    keys.left=true;

  if(e.key==="ArrowRight" || e.key.toLowerCase()==="d")
    keys.right=true;
});


window.addEventListener("keyup",e=>{

  if(e.key==="ArrowUp" || e.key.toLowerCase()==="w")
    keys.up=false;

  if(e.key==="ArrowDown" || e.key.toLowerCase()==="s")
    keys.down=false;

  if(e.key==="ArrowLeft" || e.key.toLowerCase()==="a")
    keys.left=false;

  if(e.key==="ArrowRight" || e.key.toLowerCase()==="d")
    keys.right=false;
});


/* =========================
   MOBILE CONTROLS
========================= */

document.querySelectorAll(".control").forEach(button=>{

  const dir = button.dataset.dir;

  function start(e){
    e.preventDefault();
    keys[dir]=true;
  }

  function stop(e){
    e.preventDefault();
    keys[dir]=false;
  }

  button.addEventListener("touchstart",start,{passive:false});
  button.addEventListener("touchend",stop,{passive:false});
  button.addEventListener("touchcancel",stop,{passive:false});

  button.addEventListener("mousedown",start);
  button.addEventListener("mouseup",stop);
  button.addEventListener("mouseleave",stop);
});


/* =========================
   DRIVE / WALK
========================= */

modeBtn.addEventListener("click",()=>{

  if(mode==="drive"){

    mode="walk";

    player.x=truck.x;
    player.y=truck.y+55;

    modeBtn.textContent="🚶 WALK";

    messageEl.textContent="🚶 আপনি ট্রাক থেকে নেমেছেন।";

  }else{

    const distance =
      Math.hypot(
        player.x-truck.x,
        player.y-truck.y
      );

    if(distance < 100){

      mode="drive";

      truck.x=player.x;
      truck.y=player.y;

      modeBtn.textContent="🚛 DRIVE";

      messageEl.textContent="🚛 আপনি ট্রাকে উঠেছেন।";

    }else{

      messageEl.textContent=
        "🚛 ট্রাকের কাছে যান তারপর DRIVE চাপুন।";
    }
  }
});


/* =========================
   DISTANCE
========================= */

function distance(a,b){

  return Math.hypot(
    a.x-b.x,
    a.y-b.y
  );
}


/* =========================
   COLLISION
========================= */

const buildings = [

  // Showroom
  {x:170,y:390,w:390,h:170},

  // Dealership
  {x:420,y:350,w:390,h:180},

  // Service Center
  {x:820,y:380,w:280,h:170},

  // Fuel Station
  {x:950,y:100,w:230,h:180},

  // Warehouse
  {x:1160,y:210,w:330,h:220},

  // Garage
  {x:1240,y:450,w:250,h:210},

  // Food
  {x:610,y:760,w:300,h:150},

  // Residential blocks
  {x:0,y:120,w:390,h:250}
];


function insideBuilding(x,y){

  for(const b of buildings){

    if(
      x>b.x-15 &&
      x<b.x+b.w+15 &&
      y>b.y-15 &&
      y<b.y+b.h+15
    ){

      return true;
    }
  }

  return false;
}


/* =========================
   MOVE
========================= */

function moveObject(obj,speed){

  let dx=0;
  let dy=0;

  if(keys.up) dy-=1;
  if(keys.down) dy+=1;
  if(keys.left) dx-=1;
  if(keys.right) dx+=1;

  if(dx===0 && dy===0)
    return;

  const len=Math.hypot(dx,dy);

  dx/=len;
  dy/=len;

  const nx=obj.x+dx*speed;
  const ny=obj.y+dy*speed;

  if(
    nx>25 &&
    nx<WORLD_W-25 &&
    ny>25 &&
    ny<WORLD_H-25 &&
    !insideBuilding(nx,ny)
  ){

    obj.x=nx;
    obj.y=ny;

    if(dx!==0 || dy!==0){

      obj.angle=Math.atan2(dy,dx);
    }
  }
}


/* =========================
   GAME UPDATE
========================= */

function update(){

  if(mode==="drive"){

    if(fuel>0){

      moveObject(truck,truck.speed);

      if(
        keys.up ||
        keys.down ||
        keys.left ||
        keys.right
      ){

        fuel-=0.015;

        if(fuel<0)
          fuel=0;
      }

    }else{

      messageEl.textContent=
        "⛽ Fuel শেষ! Fuel Station-এ যান।";
    }

  }else{

    moveObject(player,player.speed);
  }

  updateCamera();

  updateLocation();

  updateUI();
}


/* =========================
   CAMERA
========================= */

function updateCamera(){

  let target =
    mode==="drive"
      ? truck
      : player;

  camera.x =
    target.x -
    W/2;

  camera.y =
    target.y -
    H/2;

  const scale =
    Math.min(
      W/WORLD_W*1.7,
      H/WORLD_H*1.7
    );

  camera.scale=scale;
}


/* =========================
   LOCATION CHECK
========================= */

let currentLocation=null;

function updateLocation(){

  let obj =
    mode==="drive"
      ? truck
      : player;

  currentLocation=null;

  for(const key in locations){

    const loc=locations[key];

    const d=distance(obj,loc);

    if(d<loc.radius){

      currentLocation=key;

      locationEl.textContent=loc.name;

      break;
    }
  }

  if(!currentLocation){

    locationEl.textContent="🛣️ Road";

    actionBtn.classList.add("hidden");

    return;
  }


  if(currentLocation==="usedMarket"){

    actionBtn.textContent=
      "🚛 USED TRUCK MARKET";

    actionBtn.classList.remove("hidden");

  }else if(currentLocation==="garage"){

    actionBtn.textContent=
      "🔧 GARAGE";

    actionBtn.classList.remove("hidden");

  }else if(currentLocation==="fuel"){

    actionBtn.textContent=
      "⛽ FUEL STATION";

    actionBtn.classList.remove("hidden");

  }else if(currentLocation==="service"){

    actionBtn.textContent=
      "🛠️ SERVICE CENTER";

    actionBtn.classList.remove("hidden");

  }else{

    actionBtn.classList.add("hidden");
  }
}


/* =========================
   ACTION
========================= */

actionBtn.addEventListener("click",()=>{

  if(currentLocation==="usedMarket"){

    marketPanel.classList.remove("hidden");

  }

  if(currentLocation==="garage"){

    garagePanel.classList.remove("hidden");

  }

  if(currentLocation==="fuel"){

    if(money>=5000){

      money-=5000;
      fuel=100;

      messageEl.textContent=
        "⛽ Fuel সম্পূর্ণ ভরে গেছে!";

    }else{

      messageEl.textContent=
        "💰 Fuel ভরার জন্য টাকা কম।";
    }
  }

  if(currentLocation==="service"){

    if(money>=10000){

      money-=10000;

      messageEl.textContent=
        "🔧 Truck Service সম্পন্ন হয়েছে!";

    }else{

      messageEl.textContent=
        "💰 Service করার জন্য টাকা কম।";
    }
  }

  updateUI();
});


/* =========================
   MARKET
========================= */

window.buyTruck=function(name,price){

  if(money<price){

    alert("💰 আপনার কাছে পর্যাপ্ত টাকা নেই!");

    return;
  }

  money-=price;

  truckName=name;

  fuel=100;

  alert(
    "✅ অভিনন্দন!\n\n"+
    name+
    " সফলভাবে কেনা হয়েছে।"
  );

  updateUI();
};


window.sellTruck=function(){

  let price=0;

  if(truckName==="Mini Truck")
    price=90000;

  if(truckName==="Medium Truck")
    price=180000;

  if(truckName==="Heavy Truck")
    price=320000;

  money+=price;

  alert(
    "💰 আপনার "+truckName+
    " বিক্রি হয়েছে!\n\n"+
    "আপনি পেয়েছেন ৳"+
    price.toLocaleString()
  );

  truckName="Mini Truck";

  updateUI();
};


/* =========================
   GARAGE
========================= */

window.repairTruck=function(){

  if(money>=10000){

    money-=10000;

    alert("🔧 Truck Repair সম্পন্ন!");

    updateUI();

  }else{

    alert("💰 Repair করার জন্য টাকা কম!");
  }
};


window.fillFuel=function(){

  if(money>=5000){

    money-=5000;

    fuel=100;

    alert("⛽ Fuel 100% হয়েছে!");

    updateUI();

  }else{

    alert("💰 Fuel নেওয়ার জন্য টাকা কম!");
  }
};


document
  .getElementById("closeMarket")
  .addEventListener("click",()=>{

    marketPanel.classList.add("hidden");
  });


document
  .getElementById("closeGarage")
  .addEventListener("click",()=>{

    garagePanel.classList.add("hidden");
  });


/* =========================
   DRAW MAP
========================= */

function draw(){

  ctx.clearRect(
    0,
    0,
    W,
    H
  );

  /*
    Map-টি স্ক্রিনে fit করানো হচ্ছে।
  */

  const scale=
    Math.min(
      W/WORLD_W,
      H/WORLD_H
    );

  const mapW=
    WORLD_W*scale;

  const mapH=
    WORLD_H*scale;

  /*
    Camera follow effect
  */

  let obj=
    mode==="drive"
      ? truck
      : player;

  let offsetX=
    W/2-obj.x*scale;

  let offsetY=
    H/2-obj.y*scale;

  /*
    Map boundaries
  */

  offsetX=
    Math.min(
      0,
      Math.max(
        W-mapW,
        offsetX
      )
    );

  offsetY=
    Math.min(
      0,
      Math.max(
        H-mapH,
        offsetY
      )
    );


  if(mapImage.complete && mapImage.naturalWidth){

    ctx.drawImage(
      mapImage,
      offsetX,
      offsetY,
      mapW,
      mapH
    );

  }else{

    ctx.fillStyle="#4f8f43";

    ctx.fillRect(
      0,0,W,H
    );

    ctx.fillStyle="white";

    ctx.font="22px Arial";

    ctx.textAlign="center";

    ctx.fillText(
      "map.png লোড হচ্ছে...",
      W/2,
      H/2
    );
  }


  /*
    World → Screen
  */

  function screenPosition(x,y){

    return {
      x:x*scale+offsetX,
      y:y*scale+offsetY
    };
  }


  /*
    TRUCK
  */

  if(mode==="drive"){

    const p=
      screenPosition(
        truck.x,
        truck.y
      );

    drawTruck(
      p.x,
      p.y,
      scale,
      truck.angle
    );

  }else{

    /*
      Truck parked
    */

    const p=
      screenPosition(
        truck.x,
        truck.y
      );

    drawTruck(
      p.x,
      p.y,
      scale,
      truck.angle
    );


    /*
      Player
    */

    const pp=
      screenPosition(
        player.x,
        player.y
      );

    drawPlayer(
      pp.x,
      pp.y,
      scale
    );
  }


  /*
    Location markers
  */

  drawMarker(
    locations.usedMarket,
    "🚛"
  );

  drawMarker(
    locations.garage,
    "🔧"
  );

  drawMarker(
    locations.fuel,
    "⛽"
  );
}


/* =========================
   TRUCK DRAW
========================= */

function drawTruck(x,y,scale,angle){

  ctx.save();

  ctx.translate(x,y);

  ctx.rotate(angle);

  const w=38*scale;
  const h=62*scale;

  /*
    shadow
  */

  ctx.fillStyle="rgba(0,0,0,.35)";

  ctx.fillRect(
    -w/2+3,
    -h/2+5,
    w,
    h
  );

  /*
    body
  */

  ctx.fillStyle="#e53935";

  ctx.fillRect(
    -w/2,
    -h/2,
    w,
    h*0.42
  );

  /*
    cargo
  */

  ctx.fillStyle="#ffbd2e";

  ctx.fillRect(
    -w/2,
    -h/2+h*0.42,
    w,
    h*0.58
  );

  /*
    window
  */

  ctx.fillStyle="#9edcf5";

  ctx.fillRect(
    -w*.30,
    -h*.36,
    w*.60,
    h*.18
  );

  /*
    wheels
  */

  ctx.fillStyle="#151515";

  ctx.fillRect(
    -w*.65,
    -h*.32,
    w*.22,
    h*.25
  );

  ctx.fillRect(
    w*.43,
    -h*.32,
    w*.22,
    h*.25
  );

  ctx.fillRect(
    -w*.65,
    h*.08,
    w*.22,
    h*.25
  );

  ctx.fillRect(
    w*.43,
    h*.08,
    w*.22,
    h*.25
  );

  ctx.restore();
}


/* =========================
   PLAYER DRAW
========================= */

function drawPlayer(x,y,scale){

  ctx.save();

  ctx.translate(x,y);

  ctx.fillStyle="#ffd0a0";

  ctx.beginPath();

  ctx.arc(
    0,
    -12*scale,
    10*scale,
    0,
    Math.PI*2
  );

  ctx.fill();

  ctx.fillStyle="#1565c0";

  ctx.fillRect(
    -9*scale,
    0,
    18*scale,
    25*scale
  );

  ctx.fillStyle="#222";

  ctx.fillRect(
    -10*scale,
    25*scale,
    7*scale,
    15*scale
  );

  ctx.fillRect(
    3*scale,
    25*scale,
    7*scale,
    15*scale
  );

  ctx.restore();
}


/* =========================
   MARKERS
========================= */

function drawMarker(loc,emoji){

  const scale=
    Math.min(
      W/WORLD_W,
      H/WORLD_H
    );

  let obj=
    mode==="drive"
      ? truck
      : player;

  let offsetX=
    W/2-obj.x*scale;

  let offsetY=
    H/2-obj.y*scale;

  const mapW=
    WORLD_W*scale;

  const mapH=
    WORLD_H*scale;

  offsetX=
    Math.min(
      0,
      Math.max(
        W-mapW,
        offsetX
      )
    );

  offsetY=
    Math.min(
      0,
      Math.max(
        H-mapH,
        offsetY
      )
    );

  const x=
    loc.x*scale+offsetX;

  const y=
    loc.y*scale+offsetY;

  if(
    x<-50 ||
    x>W+50 ||
    y<-50 ||
    y>H+50
  )
    return;

  ctx.save();

  ctx.fillStyle="rgba(0,0,0,.8)";

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    22,
    0,
    Math.PI*2
  );

  ctx.fill();

  ctx.font="20px Arial";

  ctx.textAlign="center";

  ctx.textBaseline="middle";

  ctx.fillText(
    emoji,
    x,
    y
  );

  ctx.restore();
}


/* =========================
   LOOP
========================= */

function gameLoop(){

  update();

  draw();

  requestAnimationFrame(gameLoop);
}


/* =========================
   MAP LOAD
========================= */

mapImage.onload=()=>{

  messageEl.textContent=
    "🏪 Showroom থেকে শুরু করুন। 🚛 ট্রাক চালাতে নিচের বোতাম চাপুন।";

  gameLoop();
};


mapImage.onerror=()=>{

  messageEl.textContent=
    "⚠️ map.png পাওয়া যাচ্ছে না। GitHub-এ map.png ঠিক আছে কিনা দেখুন।";

  gameLoop();
};


updateUI();
