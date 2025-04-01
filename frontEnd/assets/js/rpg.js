
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let gameStarted = false;

const player = {
  x: 100, y: 100, width: 32, height: 32, speed: 2,
  sprite: null, class: null,
  maxHp: 100, hp: 100,
  maxMana: 100, mana: 100,
  attack: 10, defense: 5,
  isArmored: false
};

let enemies = [
  { x: 400, y: 300, width: 32, height: 32, hp: 35, sprite: null, aggroRange: 200, speed: 1.2, attack: 10, cooldown: 1000, lastHit: 0 },
  { x: 500, y: 100, width: 32, height: 32, hp: 35, sprite: null, aggroRange: 200, speed: 1.2, attack: 10, cooldown: 1000, lastHit: 0 },
  { x: 300, y: 400, width: 32, height: 32, hp: 35, sprite: null, aggroRange: 200, speed: 1.2, attack: 10, cooldown: 1000, lastHit: 0 }
];

let projectiles = [];
let keys = {}, mouse = { x: 0, y: 0 };
let cooldowns = { fireball: 0, heal: 0, armor: 0, slash: 0, roar: 0, charge: 0 };
let effects = [];
let lastWarriorHit = 0;

document.addEventListener("keydown", e => {
  keys[e.key] = true;
  if (e.code === "Digit1") useSkill(1);
  if (e.code === "Digit2") useSkill(2);
  if (e.code === "Digit3") useSkill(3);
});

document.addEventListener("keyup", e => keys[e.key] = false);
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

function updateHUD() {
  document.getElementById("playerHP").textContent = `${player.hp} / ${player.maxHp}`;
  document.getElementById("playerMana").textContent = `${Math.floor(player.mana)} / ${player.maxMana}`;
  document.getElementById("playerAttack").textContent = player.attack;
  document.getElementById("playerDefense").textContent = player.defense;
}


function selectClass(cls) {
  player.class = cls;
  document.getElementById("classSelection").style.display = "none";

  const img = new Image();
  img.src = `/assets/img/${cls}_idle.png`;
  img.onload = () => console.log("✅ Sprite joueur chargé !");
  player.sprite = img;

  const enemyImg = new Image();
  enemyImg.src = "/assets/img/enemy.png";
  enemyImg.onload = () => {
    console.log("✅ Sprite ennemi chargé !");
    enemies.forEach(e => e.sprite = enemyImg);
  };

  document.getElementById("interface").style.display = "block";
  document.getElementById("hud-top-left").style.display = "block";
  document.getElementById("hud-top-right").style.display = "block";
  document.getElementById("skillBar").style.display = "flex";

  if (cls === "mage") {
    player.maxHp = 80; player.hp = 80;
    player.maxMana = 120; player.mana = 120;
    player.attack = 15; player.defense = 5;

    // Noms des compétences mage
    document.getElementById("skill1").textContent = "1 - 🔥 Boule de feu";
    document.getElementById("skill2").textContent = "2 - 💖 Soin";
    document.getElementById("skill3").textContent = "3 - 🛡️ Armure magique";

  } else if (cls === "warrior") {
    player.maxHp = 120; player.hp = 120;
    player.maxMana = 60; player.mana = 60;
    player.attack = 20; player.defense = 10;

    // Noms des compétences guerrier
    document.getElementById("skill1").textContent = "1 - 🌪️ Coup puissant";
    document.getElementById("skill2").textContent = "2 - 💢 Crie de GUERRE";
    document.getElementById("skill3").textContent = "3 - 🧱 CHARGE !!!";
  }

  updateHUD();
  gameStarted = true;
  requestAnimationFrame(gameLoop);

  setInterval(() => {
    if (player.class === "mage") {
      player.mana = Math.min(player.maxMana, player.mana + 5);
    } else if (player.class === "warrior") {
      player.mana = Math.min(player.maxMana, player.mana + 2);
    }
    updateHUD();
  }, 1000);
}


function useSkill(id) {
  const now = Date.now();

  if (player.class === "mage") {
    if (id === 1 && now > cooldowns.fireball && player.mana >= 20) {
      const angle = Math.atan2(mouse.y - (player.y + 16), mouse.x - (player.x + 16));
      projectiles.push({
        x: player.x + 16, y: player.y + 16,
        dx: Math.cos(angle) * 5,
        dy: Math.sin(angle) * 5,
        damage: player.attack,
        duration: 1000, start: now
      });
      player.mana -= 20;
      cooldowns.fireball = now + 1000;
    } else if (id === 2 && now > cooldowns.heal && player.mana >= 15) {
      player.hp = Math.min(player.maxHp, player.hp + 30);
      effects.push({ type: "heal", x: player.x, y: player.y, start: now, duration: 1000 });
      player.mana -= 15;
      cooldowns.heal = now + 3000;
    } else if (id === 3 && now > cooldowns.armor && player.mana >= 25) {
      player.isArmored = true;
      effects.push({ type: "shield", x: player.x, y: player.y, start: now, duration: 5000 });
      setTimeout(() => player.isArmored = false, 5000);
      player.mana -= 25;
      cooldowns.armor = now + 5000;
    }
  } else if (player.class === "warrior") {
    if (id === 1 && now > cooldowns.slash && player.mana >= 15) {
      for (const enemy of enemies) {
        const dx = enemy.x - player.x, dy = enemy.y - player.y;
        if (Math.sqrt(dx * dx + dy * dy) < 40) {
          enemy.hp -= player.attack;
        }
      }
      effects.push({ type: "slash", x: player.x, y: player.y, start: now, duration: 300 });
      player.mana -= 15;
      cooldowns.slash = now + 1500;
    } else if (id === 2 && now > cooldowns.roar && player.mana >= 20) {
      enemies.forEach(e => e.attack = Math.max(0, e.attack - 5));
      effects.push({ type: "roar", x: player.x, y: player.y, start: now, duration: 1000 });
      player.mana -= 20;
      cooldowns.roar = now + 5000;
    } else if (id === 3 && now > cooldowns.charge && player.mana >= 25) {
      player.x += 50;
      effects.push({ type: "charge", x: player.x, y: player.y, start: now, duration: 400 });
      player.mana -= 25;
      cooldowns.charge = now + 3000;
    }
  }

  updateHUD();
}

function update() {
  if (keys["ArrowUp"] || keys["z"]) player.y -= player.speed;
  if (keys["ArrowDown"] || keys["s"]) player.y += player.speed;
  if (keys["ArrowLeft"] || keys["q"]) player.x -= player.speed;
  if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;

  const now = Date.now();
  enemies = enemies.filter(enemy => enemy.hp > 0);

  for (const enemy of enemies) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < enemy.aggroRange) {
      enemy.x += enemy.speed * dx / dist;
      enemy.y += enemy.speed * dy / dist;
    }

    if (dist < 30 && now - enemy.lastHit > enemy.cooldown) {
      let damage = enemy.attack;
      if (player.isArmored) damage = Math.max(0, damage - player.defense);
      player.hp -= damage;
      enemy.lastHit = now;
      updateHUD();
      if (player.hp <= 0) alert("💀 Vous êtes mort !");
    }

    if (player.class === "warrior" && now - lastWarriorHit > 1500 && dist < 30) {
      enemy.hp -= player.attack;
      lastWarriorHit = now;
    }
  }

  projectiles = projectiles.filter(p => now - p.start < p.duration);
  for (const p of projectiles) {
    p.x += p.dx;
    p.y += p.dy;
    for (const enemy of enemies) {
      const edx = p.x - enemy.x, edy = p.y - enemy.y;
      if (Math.sqrt(edx * edx + edy * edy) < 20) {
        enemy.hp -= p.damage;
        p.duration = 0;
      }
    }
  }

  effects = effects.filter(fx => now - fx.start < fx.duration);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#3a3";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const enemy of enemies) {
    if (enemy.sprite) ctx.drawImage(enemy.sprite, enemy.x, enemy.y, enemy.width, enemy.height);
    ctx.fillStyle = "red";
    ctx.fillRect(enemy.x, enemy.y - 10, enemy.width, 5);
    ctx.fillStyle = "lime";
    ctx.fillRect(enemy.x, enemy.y - 10, enemy.width * (enemy.hp / 35), 5);
  }

  if (player.sprite) ctx.drawImage(player.sprite, player.x, player.y, player.width, player.height);

  for (const p of projectiles) {
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
    ctx.fill();
  }

  for (const fx of effects) {
    ctx.strokeStyle = fx.type === "heal" ? "lightblue"
                  : fx.type === "shield" ? "cyan"
                  : fx.type === "slash" ? "red"
                  : fx.type === "roar" ? "orange"
                  : "yellow";
    ctx.beginPath();
    ctx.arc(player.x + 16, player.y + 16, 30, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

function gameLoop() {
  if (gameStarted && enemies.length === 0) {
    document.getElementById("victoryScreen").style.display = "flex";
    return;
  }

  update();
  draw();
  updateHUD();
  requestAnimationFrame(gameLoop);
}
