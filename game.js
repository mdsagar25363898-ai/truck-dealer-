/* =========================================================
   TRUCK DEALER GAME
   SHOWROOM START + PLAYER + FOLLOW CAMERA + TRUCK DRIVING
   ========================================================= */

const canvas = document.getElementById("gameCanvas");

/* =========================
   THREE.JS
========================= */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x78c9e5);

const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.shadowMap.enabled = true;

/* =========================
   LIGHT
========================= */

const ambient = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(300, 500, 200);
sun.castShadow = true;
scene.add(sun);

/* =========================
   GAME DATA
========================= */

let money = Number(localStorage.getItem("td_money")) || 380000;
let fuel = Number(localStorage.getItem("td_fuel")) || 98;

let truckName =
    localStorage.getItem("td_truck") || "Mini Truck";

document.getElementById("money").textContent =
    money.toLocaleString();

document.getElementById("fuel").textContent =
    Math.round(fuel);

document.getElementById("truckName").textContent =
    truckName;

/* =========================
   MAP
========================= */

const WORLD_W = 1536;
const WORLD_H = 1024;

const loader = new THREE.TextureLoader();

const mapTexture = loader.load(
    "map.png",
    () => {
        console.log("MAP LOADED");
    }
);

mapTexture.colorSpace = THREE.SRGBColorSpace;

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

map.rotation.x = -Math.PI / 2;
map.position.y = 0;

scene.add(map);

/* =========================
   PLAYER
========================= */

const playerGroup = new THREE.Group();
scene.add(playerGroup);

const playerTexture = loader.load(
    "player.png",
    () => {
        console.log("PLAYER LOADED");
    }
);

playerTexture.colorSpace = THREE.SRGBColorSpace;

playerTexture.minFilter = THREE.LinearFilter;
playerTexture.magFilter = THREE.LinearFilter;

const playerMaterial = new THREE.MeshBasicMaterial({
    map: playerTexture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false
});

const playerGeometry = new THREE.PlaneGeometry(
    48,
    90
);

const playerMesh = new THREE.Mesh(
    playerGeometry,
    playerMaterial
);

playerMesh.position.y = 45;

playerGroup.add(playerMesh);

/*
   START POSITION

   Game শুরু হবে Showroom এলাকায়।
*/

playerGroup.position.set(
    -120,
    0,
    180
);

/* =========================
   TRUCK
========================= */

const truckGroup = new THREE.Group();
scene.add(truckGroup);

truckGroup.position.set(
    -120,
    0,
    115
);

/* Truck body */

const truckBodyGeometry =
    new THREE.BoxGeometry(52, 25, 85);

const truckBodyMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x1769aa,
        roughness: 0.7
    });

const truckBody =
    new THREE.Mesh(
        truckBodyGeometry,
        truckBodyMaterial
    );

truckBody.position.y = 17;

truckGroup.add(truckBody);

/* Truck cabin */

const cabinGeometry =
    new THREE.BoxGeometry(50, 38, 38);

const cabinMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x1976d2,
        roughness: 0.6
    });

const cabin =
    new THREE.Mesh(
        cabinGeometry,
        cabinMaterial
    );

cabin.position.set(
    0,
    40,
    -18
);

truckGroup.add(cabin);

/* Windows */

const windowMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x152535,
        roughness: 0.2
    });

const frontWindow =
    new THREE.Mesh(
        new THREE.BoxGeometry(42, 18, 2),
        windowMaterial
    );

frontWindow.position.set(
    0,
    43,
    -38
);

truckGroup.add(frontWindow);

/* Wheels */

function createWheel(x, z) {

    const wheel =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                10,
                10,
                8,
                24
            ),
            new THREE.MeshStandardMaterial({
                color: 0x151515
            })
        );

    wheel.rotation.z = Math.PI / 2;

    wheel.position.set(
        x,
        10,
        z
    );

    truckGroup.add(wheel);
}

createWheel(-29, -27);
createWheel(29, -27);
createWheel(-29, 27);
createWheel(29, 27);

/* =========================
   PLAYER STATE
========================= */

let playerMode = "walking";

let playerSpeed = 1.6;
let truckSpeed = 2.8;

let nearTruck = false;

let keys = {
    up: false,
    down: false,
    left: false,
    right: false
};

/* =========================
   CAMERA
========================= */

const cameraOffset = new THREE.Vector3(
    0,
    58,
    95
);

function updateCamera() {

    let target;

    if (playerMode === "walking") {
        target = playerGroup.position;
    } else {
        target = truckGroup.position;
    }

    /*
       Camera follows player/truck.
       Camera কখনো আকাশে স্থির থাকবে না।
    */

    const desired = new THREE.Vector3(
        target.x + cameraOffset.x,
        target.y + cameraOffset.y,
        target.z + cameraOffset.z
    );

    camera.position.lerp(
        desired,
        0.12
    );

    const lookTarget =
        new THREE.Vector3(
            target.x,
            target.y + 28,
            target.z
        );

    camera.lookAt(lookTarget);
}

/* =========================
   PLAYER MOVEMENT
========================= */

function movePlayer() {

    if (playerMode !== "walking")
        return;

    let dx = 0;
    let dz = 0;

    if (keys.up)
        dz -= playerSpeed;

    if (keys.down)
        dz += playerSpeed;

    if (keys.left)
        dx -= playerSpeed;

    if (keys.right)
        dx += playerSpeed;

    if (dx !== 0 || dz !== 0) {

        const length =
            Math.sqrt(dx * dx + dz * dz);

        dx /= length;
        dz /= length;

        playerGroup.position.x +=
            dx * playerSpeed;

        playerGroup.position.z +=
            dz * playerSpeed;

        playerGroup.position.x =
            Math.max(
                -WORLD_W / 2 + 25,
                Math.min(
                    WORLD_W / 2 - 25,
                    playerGroup.position.x
                )
            );

        playerGroup.position.z =
            Math.max(
                -WORLD_H / 2 + 25,
                Math.min(
                    WORLD_H / 2 - 25,
                    playerGroup.position.z
                )
            );

        /*
           Character always faces camera.
        */

        playerMesh.rotation.y =
            Math.atan2(
                camera.position.x -
                playerGroup.position.x,

                camera.position.z -
                playerGroup.position.z
            );
    }
}

/* =========================
   TRUCK MOVEMENT
========================= */

function moveTruck() {

    if (playerMode !== "driving")
        return;

    let dx = 0;
    let dz = 0;

    if (keys.up)
        dz -= truckSpeed;

    if (keys.down)
        dz += truckSpeed;

    if (keys.left)
        dx -= truckSpeed;

    if (keys.right)
        dx += truckSpeed;

    if (dx !== 0 || dz !== 0) {

        const length =
            Math.sqrt(dx * dx + dz * dz);

        dx /= length;
        dz /= length;

        truckGroup.position.x +=
            dx * truckSpeed;

        truckGroup.position.z +=
            dz * truckSpeed;

        /*
           Truck turns toward movement direction.
        */

        truckGroup.rotation.y =
            Math.atan2(dx, dz);

        /*
           Fuel consumption
        */

        fuel -= 0.003;

        if (fuel < 0)
            fuel = 0;

        document.getElementById("fuel")
            .textContent = Math.round(fuel);

        localStorage.setItem(
            "td_fuel",
            fuel
        );
    }
}

/* =========================
   DISTANCE
========================= */

function distanceBetween(a, b) {

    const dx =
        a.x - b.x;

    const dz =
        a.z - b.z;

    return Math.sqrt(
        dx * dx + dz * dz
    );
}

/* =========================
   LOCATION SYSTEM
========================= */

const locations = {

    showroom: {
        name: "🏪 Showroom",
        x: -120,
        z: 180,
        radius: 130
    },

    market: {
        name: "🚚 Truck Market",
        x: 260,
        z: 40,
        radius: 130
    },

    garage: {
        name: "🔧 Garage",
        x: 390,
        z: -260,
        radius: 130
    },

    workers: {
        name: "👷 Worker Office",
        x: -330,
        z: -250,
        radius: 130
    }
};

function checkLocation() {

    let current = null;

    const position =
        playerMode === "driving"
            ? truckGroup.position
            : playerGroup.position;

    for (const key in locations) {

        const loc =
            locations[key];

        const d =
            distanceBetween(
                position,
                loc
            );

        if (d < loc.radius) {
            current = key;
            break;
        }
    }

    if (current) {

        document.getElementById(
            "locationBox"
        ).textContent =
            locations[current].name;

        showLocationMessage(
            current
        );

    } else {

        document.getElementById(
            "locationBox"
        ).textContent =
            playerMode === "driving"
                ? "🛣️ Road"
                : "🚶 Road";

        document.getElementById(
            "actionButton"
        ).style.display =
            "none";
    }
}

/* =========================
   LOCATION MESSAGE
========================= */

function showLocationMessage(location) {

    const message =
        document.getElementById(
            "message"
        );

    const button =
        document.getElementById(
            "actionButton"
        );

    if (location === "showroom") {

        message.textContent =
            "🏪 Showroom — এখান থেকেই গেম শুরু হয়েছে";

        if (playerMode === "walking") {

            button.style.display =
                "block";

            button.textContent =
                "🚛 ট্রাকে উঠুন";

            button.onclick =
                enterTruck;
        }
    }

    if (location === "market") {

        message.textContent =
            "🚚 Truck Market — নতুন ট্রাক কিনতে পারবেন";

        if (playerMode === "walking") {

            button.style.display =
                "block";

            button.textContent =
                "🛒 Market";

            button.onclick =
                buyTruck;
        }
    }

    if (location === "garage") {

        message.textContent =
            "🔧 Garage — ট্রাক সার্ভিস ও মেরামত";

        if (playerMode === "walking") {

            button.style.display =
                "block";

            button.textContent =
                "🔧 Garage";

            button.onclick =
                repairTruck;
        }
    }

    if (location === "workers") {

        message.textContent =
            "👷 Worker Office — কর্মী নিয়োগ করুন";

        if (playerMode === "walking") {

            button.style.display =
                "block";

            button.textContent =
                "👷 Hire Worker";

            button.onclick =
                hireWorker;
        }
    }
}

/* =========================
   ENTER TRUCK
========================= */

function enterTruck() {

    const d =
        distanceBetween(
            playerGroup.position,
            truckGroup.position
        );

    if (d > 90) {

        document.getElementById(
            "message"
        ).textContent =
            "🚛 ট্রাকের কাছে যান";

        return;
    }

    playerMode = "driving";

    playerGroup.visible = false;

    document.getElementById(
        "message"
    ).textContent =
        "🚛 আপনি ট্রাকে উঠেছেন — গাড়ি চালাতে ▲ চাপুন";

    document.getElementById(
        "actionButton"
    ).style.display =
        "block";

    document.getElementById(
        "actionButton"
    ).textContent =
        "🚶 ট্রাক থেকে নামুন";

    document.getElementById(
        "actionButton"
    ).onclick =
        exitTruck;
}

/* =========================
   EXIT TRUCK
========================= */

function exitTruck() {

    playerMode = "walking";

    playerGroup.visible = true;

    /*
       Player appears beside truck.
    */

    playerGroup.position.set(
        truckGroup.position.x + 65,
        0,
        truckGroup.position.z
    );

    document.getElementById(
        "message"
    ).textContent =
        "🚶 আপনি ট্রাক থেকে নেমেছেন";

    document.getElementById(
        "actionButton"
    ).style.display =
        "none";
}

/* =========================
   BUY TRUCK
========================= */

function buyTruck() {

    const price = 180000;

    if (money < price) {

        document.getElementById(
            "message"
        ).textContent =
            "❌ এই ট্রাক কেনার জন্য টাকা কম";

        return;
    }

    money -= price;

    truckName = "Heavy Truck";

    document.getElementById(
        "money"
    ).textContent =
        money.toLocaleString();

    document.getElementById(
        "truckName"
    ).textContent =
        truckName;

    localStorage.setItem(
        "td_money",
        money
    );

    localStorage.setItem(
        "td_truck",
        truckName
    );

    document.getElementById(
        "message"
    ).textContent =
        "✅ নতুন Heavy Truck কেনা হয়েছে!";

    /*
       Change truck colour.
    */

    truckBodyMaterial.color.set(
        0xc62828
    );

    cabinMaterial.color.set(
        0xd32f2f
    );
}

/* =========================
   GARAGE
========================= */

function repairTruck() {

    const repairCost = 25000;

    if (fuel >= 99) {

        document.getElementById(
            "message"
        ).textContent =
            "🔧 ট্রাক ইতিমধ্যে ভালো অবস্থায় আছে";

        return;
    }

    if (money < repairCost) {

        document.getElementById(
            "message"
        ).textContent =
            "❌ Garage service-এর জন্য টাকা কম";

        return;
    }

    money -= repairCost;
    fuel = 100;

    document.getElementById(
        "money"
    ).textContent =
        money.toLocaleString();

    document.getElementById(
        "fuel"
    ).textContent =
        fuel;

    localStorage.setItem(
        "td_money",
        money
    );

    localStorage.setItem(
        "td_fuel",
        fuel
    );

    document.getElementById(
        "message"
    ).textContent =
        "✅ ট্রাক সম্পূর্ণ সার্ভিস করা হয়েছে";
}

/* =========================
   WORKER
========================= */

let workers =
    Number(
        localStorage.getItem(
            "td_workers"
        )
    ) || 0;

function hireWorker() {

    const price = 50000;

    if (money < price) {

        document.getElementById(
            "message"
        ).textContent =
            "❌ Worker hire করার জন্য টাকা কম";

        return;
    }

    money -= price;
    workers++;

    document.getElementById(
        "money"
    ).textContent =
        money.toLocaleString();

    localStorage.setItem(
        "td_money",
        money
    );

    localStorage.setItem(
        "td_workers",
        workers
    );

    document.getElementById(
        "message"
    ).textContent =
        "✅ Worker hired! মোট Worker: " +
        workers;
}

/* =========================
   BUTTON CONTROL
========================= */

function holdButton(id, key) {

    const button =
        document.getElementById(id);

    const start = (e) => {

        e.preventDefault();

        keys[key] = true;
    };

    const end = (e) => {

        e.preventDefault();

        keys[key] = false;
    };

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

/* =========================
   RUN BUTTON
========================= */

const runButton =
    document.getElementById(
        "runButton"
    );

let running = false;

runButton.addEventListener(
    "touchstart",
    (e) => {

        e.preventDefault();

        running = true;
        playerSpeed = 3.2;
    },
    { passive: false }
);

runButton.addEventListener(
    "touchend",
    () => {

        running = false;
        playerSpeed = 1.6;
    }
);

/* =========================
   TRUCK BUTTON
========================= */

document.getElementById(
    "truckButton"
).addEventListener(
    "click",
    () => {

        if (playerMode === "walking") {

            enterTruck();

        } else {

            exitTruck();

        }
    }
);

/* =========================
   HAND BUTTON
========================= */

document.getElementById(
    "handButton"
).addEventListener(
    "click",
    () => {

        document.getElementById(
            "message"
        ).textContent =
            "✋ Interaction";

        checkLocation();
    }
);

/* =========================
   KEYBOARD
========================= */

window.addEventListener(
    "keydown",
    (e) => {

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

        if (e.key === "e")
            enterTruck();
    }
);

window.addEventListener(
    "keyup",
    (e) => {

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
    }
);

/* =========================
   RESIZE
========================= */

window.addEventListener(
    "resize",
    () => {

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

/* =========================
   GAME LOOP
========================= */

function gameLoop() {

    requestAnimationFrame(
        gameLoop
    );

    movePlayer();
    moveTruck();

    checkLocation();
    updateCamera();

    renderer.render(
        scene,
        camera
    );
}

/* =========================
   INITIAL CAMERA
========================= */

camera.position.set(
    playerGroup.position.x,
    58,
    playerGroup.position.z + 95
);

camera.lookAt(
    playerGroup.position.x,
    28,
    playerGroup.position.z
);

/* =========================
   START
========================= */

document.getElementById(
    "message"
).textContent =
    "🏪 Showroom থেকে গেম শুরু হয়েছে — Character-কে হাঁটান";

gameLoop();
