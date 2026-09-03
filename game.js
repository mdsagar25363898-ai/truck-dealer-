const TRUCKS = [
  {
    id: 1,
    name: "Mini Truck",
    price: 120000,
    sell: 90000,
    speed: 50,
    cargo: 2,
    level: 1,
    icon: "🚚"
  },
  {
    id: 2,
    name: "City Truck",
    price: 220000,
    sell: 165000,
    speed: 65,
    cargo: 4,
    level: 1,
    icon: "🚛"
  },
  {
    id: 3,
    name: "Cargo Master",
    price: 300000,
    sell: 225000,
    speed: 70,
    cargo: 6,
    level: 1,
    icon: "🚛"
  },
  {
    id: 4,
    name: "Heavy Truck",
    price: 380000,
    sell: 285000,
    speed: 75,
    cargo: 8,
    level: 2,
    icon: "🚛"
  },
  {
    id: 5,
    name: "Long Hauler",
    price: 500000,
    sell: 375000,
    speed: 82,
    cargo: 11,
    level: 2,
    icon: "🚛"
  },
  {
    id: 6,
    name: "Super Hauler",
    price: 650000,
    sell: 487500,
    speed: 90,
    cargo: 14,
    level: 3,
    icon: "🚛"
  },
  {
    id: 7,
    name: "Mega Truck",
    price: 1000000,
    sell: 750000,
    speed: 100,
    cargo: 20,
    level: 4,
    icon: "🚛"
  },
  {
    id: 8,
    name: "King Hauler",
    price: 1500000,
    sell: 1125000,
    speed: 110,
    cargo: 25,
    level: 5,
    icon: "🚛"
  }
];

const MISSIONS = [
  ["ঢাকা → চট্টগ্রাম", 2, 35000],
  ["ঢাকা → সিলেট", 4, 55000],
  ["চট্টগ্রাম → কুমিল্লা", 6, 80000],
  ["ঢাকা → রাজশাহী", 8, 110000],
  ["চট্টগ্রাম → খুলনা", 12, 160000],
  ["ঢাকা → কক্সবাজার", 16, 230000]
];

let state = JSON.parse(
  localStorage.getItem("truckDealerV2")
) || {
  money: 500000,
  level: 1,
  deliveries: 0,
  xp: 0,
  owned: []
};

const moneyEl = document.getElementById("money");
const money2El = document.getElementById("money2");
const levelEl = document.getElementById("level");
const level2El = document.getElementById("level2");
const truckCountEl = document.getElementById("truckCount");
const deliveriesEl = document.getElementById("deliveries");

const truckListEl = document.getElementById("truckList");
const garageListEl = document.getElementById("garageList");
const missionListEl = document.getElementById("missionList");

const resetBtn = document.getElementById("reset");

function formatMoney(number) {
  return number.toLocaleString("en-US");
}

function saveGame() {
  localStorage.setItem(
    "truckDealerV2",
    JSON.stringify(state)
  );
}

function getBestCargo() {
  if (state.owned.length === 0) {
    return 0;
  }

  return Math.max(
    ...state.owned.map(
      truck => truck.cargo + truck.upgrade
    )
  );
}

function render() {

  moneyEl.textContent = formatMoney(state.money);
  money2El.textContent = formatMoney(state.money);

  levelEl.textContent = state.level;
  level2El.textContent = state.level;

  truckCountEl.textContent = state.owned.length;
  deliveriesEl.textContent = state.deliveries;

  renderShowroom();
  renderGarage();
  renderMissions();
}

function renderShowroom() {

  truckListEl.innerHTML = "";

  TRUCKS.forEach(truck => {

    const owned = state.owned.some(
      item => item.id === truck.id
    );

    const locked =
      state.level < truck.level;

    const card = document.createElement("div");

    card.className =
      "card " + (locked ? "locked" : "");

    let levelText = "";

    if (locked) {
      levelText =
        `<span class="tag">🔒 Lv.${truck.level}</span>`;
    }

    let buttonText = "🚛 Buy Truck";

    if (locked) {
      buttonText = "🔒 Locked";
    }

    if (owned) {
      buttonText = "✅ Owned";
    }

    const canBuy =
      !locked &&
      !owned &&
      state.money >= truck.price;

    card.innerHTML = `
      <div class="truck-art">
        ${truck.icon}
      </div>

      <h3>
        ${truck.name}
        ${levelText}
      </h3>

      <div class="price">
        ৳${formatMoney(truck.price)}
      </div>

      <div class="spec">
        ⚡ Speed: ${truck.speed}
        <br>
        📦 Cargo: ${truck.cargo} ton
      </div>

      <button
        class="btn buy"
        ${canBuy ? "" : "disabled"}
      >
        ${buttonText}
      </button>
    `;

    const buyButton =
      card.querySelector(".buy");

    buyButton.addEventListener(
      "click",
      () => buyTruck(truck.id)
    );

    truckListEl.appendChild(card);
  });
}

function renderGarage() {

  if (state.owned.length === 0) {

    garageListEl.innerHTML = `
      <div class="empty">
        🚛 Garage খালি।
        <br><br>
        Showroom থেকে ট্রাক কিনুন।
      </div>
    `;

    return;
  }

  garageListEl.innerHTML = "";

  state.owned.forEach((truck, index) => {

    const upgradeCost =
      30000 * (truck.upgrade + 1);

    const div =
      document.createElement("div");

    div.className = "owned";

    const progress =
      25 + truck.upgrade * 25;

    div.innerHTML = `
      <div class="truck-art">
        ${truck.icon}
      </div>

      <div class="owned-info">

        <h3>
          ${truck.name}
          — Upgrade ${truck.upgrade}/3
        </h3>

        <div class="spec">
          ⚡ Speed: ${truck.speed}
          |
          📦 Cargo: ${truck.cargo} ton
        </div>

        <div class="bar">
          <span style="width:${progress}%"></span>
        </div>

        <button class="btn upgrade">
          🔧 Upgrade
          ৳${formatMoney(upgradeCost)}
        </button>

        <button class="btn sell">
          💵 Sell
          ৳${formatMoney(truck.sell)}
        </button>

      </div>
    `;

    const upgradeButton =
      div.querySelector(".upgrade");

    const sellButton =
      div.querySelector(".sell");

    if (
      truck.upgrade >= 3 ||
      state.money < upgradeCost
    ) {
      upgradeButton.disabled = true;
    }

    upgradeButton.addEventListener(
      "click",
      () => upgradeTruck(index)
    );

    sellButton.addEventListener(
      "click",
      () => sellTruck(index)
    );

    garageListEl.appendChild(div);
  });
}

function renderMissions() {

  missionListEl.innerHTML = "";

  const bestCargo = getBestCargo();

  MISSIONS.forEach(
    (mission, index) => {

      const name = mission[0];
      const requiredCargo = mission[1];
      const reward = mission[2];

      const locked =
        bestCargo < requiredCargo;

      const div =
        document.createElement("div");

      div.className = "mission";

      div.innerHTML = `
        <div class="mission-top">

          <h3>
            📍 ${name}
          </h3>

          <span class="reward">
            ৳${formatMoney(reward)}
          </span>

        </div>

        <p>
          প্রয়োজন Cargo:
          ${requiredCargo} ton
          <br>
          আপনার Cargo:
          ${bestCargo} ton
        </p>

        <button class="btn buy">
          ${
            locked
              ? "🔒 আরও ভালো ট্রাক দরকার"
              : "📦 Delivery Start"
          }
        </button>
      `;

      const button =
        div.querySelector(".buy");

      button.disabled = locked;

      button.addEventListener(
        "click",
        () => startDelivery(index)
      );

      missionListEl.appendChild(div);
    }
  );
}

function buyTruck(id) {

  const truck =
    TRUCKS.find(item => item.id === id);

  if (!truck) {
    return;
  }

  if (state.level < truck.level) {
    alert("🔒 এই ট্রাক কিনতে আরও Level দরকার।");
    return;
  }

  if (state.money < truck.price) {
    alert("💰 আপনার কাছে পর্যাপ্ত টাকা নেই।");
    return;
  }

  if (
    state.owned.some(
      item => item.id === truck.id
    )
  ) {
    return;
  }

  state.money -= truck.price;

  state.owned.push({
    ...truck,
    upgrade: 0
  });

  saveGame();
  render();

  alert(
    "🎉 " +
    truck.name +
    " কেনা হয়েছে!"
  );
}

function sellTruck(index) {

  const truck =
    state.owned[index];

  if (!truck) {
    return;
  }

  const answer =
    confirm(
      truck.name +
      " ৳" +
      formatMoney(truck.sell) +
      " দামে বিক্রি করবেন?"
    );

  if (!answer) {
    return;
  }

  state.money += truck.sell;

  state.owned.splice(index, 1);

  saveGame();
  render();

  alert("💵 ট্রাক বিক্রি হয়েছে!");
}

function upgradeTruck(index) {

  const truck =
    state.owned[index];

  if (!truck) {
    return;
  }

  if (truck.upgrade >= 3) {
    alert("⭐ এই ট্রাকের সর্বোচ্চ Upgrade হয়েছে।");
    return;
  }

  const cost =
    30000 * (truck.upgrade + 1);

  if (state.money < cost) {
    alert("💰 Upgrade করার জন্য পর্যাপ্ত টাকা নেই।");
    return;
  }

  state.money -= cost;

  truck.upgrade += 1;

  truck.speed += 5;

  truck.cargo += 1;

  saveGame();
  render();

  alert(
    "🔧 " +
    truck.name +
    " Upgrade হয়েছে!"
  );
}

function startDelivery(index) {

  const mission =
    MISSIONS[index];

  if (!mission) {
    return;
  }

  const requiredCargo =
    mission[1];

  const reward =
    mission[2];

  if (getBestCargo() < requiredCargo) {
    alert(
      "🚛 এই Mission-এর জন্য আরও বড় ট্রাক দরকার।"
    );
    return;
  }

  state.money += reward;

  state.deliveries += 1;

  state.xp += 1;

  let levelUp = false;

  if (
    state.xp >= state.level * 3 &&
    state.level < 5
  ) {
    state.xp = 0;
    state.level += 1;
    levelUp = true;
  }

  saveGame();
  render();

  alert(
    "📦 Delivery সফল!\n\n" +
    "💰 আয়: ৳" +
    formatMoney(reward)
  );

  if (levelUp) {
    alert(
      "⭐ Level Up!\n\n" +
      "আপনার নতুন Level: " +
      state.level
    );
  }
}

document
  .querySelectorAll(".tab")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".tab")
          .forEach(item =>
            item.classList.remove("active")
          );

        document
          .querySelectorAll(".page")
          .forEach(page =>
            page.classList.remove("active")
          );

        button.classList.add("active");

        const page =
          document.getElementById(
            button.dataset.page
          );

        if (page) {
          page.classList.add("active");
        }
      }
    );
  });

resetBtn.addEventListener(
  "click",
  () => {

    const answer =
      confirm(
        "সব Game Data মুছে নতুন করে শুরু করবেন?"
      );

    if (!answer) {
      return;
    }

    localStorage.removeItem(
      "truckDealerV2"
    );

    location.reload();
  }
);

render();
