const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = {
  x: 100, y: 100,
  width: 32, height: 32,
  speed: 2,
  sprite: null,
  class: null,
  hp: 100, mana: 100,
  maxHp: 100, maxMana: 100,
  attack: 10, defense: 10,
  armorActive: false,
};

const enemy = {
  x: 400, y: 300,
  width: 32, height: 32,
  speed: 1.2,
  sprite: null,
  aggroRange: 100,
  hp: 100
};

let keys = {};
let projectiles = [];

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === "1") useSkill(1);
  if (e.key === "2") useSkill(2);
  if (e.key === "3") useSkill(3);
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function selectClass(cls) {
  player.class = cls;
  document.getElementById("classSelection").style.display = "none";

  const img = new Image();
  img.src = `/assets/img/${cls}_idle.png`;
  player.sprite = img;

  const enemyImg = new Image();
  enemyImg.src = `/assets/img/enemy.png`;
  enemy.sprite = enemyImg;

  // Statistiques selon la classe
  if (cls === "mage") {
    player.maxHp = 80;
    player.hp = 80;
    player.maxMana = 120;
    player.mana = 120;
    player.attack = 15;
    player.defense = 5;
  } else if (cls === "warrior") {
    player.maxHp = 120;
    player.hp = 120;
    player.maxMana = 60;
    player.mana = 60;
    player.attack = 10;
    player.defense = 10;
  }

  document.getElementById("interface").style.display = "block";
  document.getElementById("hud-top-left").style.display = "block";
  document.getElementById("hud-top-right").style.display = "block";
  document.getElementById("skillBar").style.display = "block";
  updateHUD();
  requestAnimationFrame(gameLoop);
}

function updateHUD() {
  document.getElementById("playerHP").textContent = `${player.hp} / ${player.maxHp}`;
  document.getElementById("playerMana").textContent = `${player.mana} / ${player.maxMana}`;
  document.getElementById("playerAttack").textContent = player.attack;
  document.getElementById("playerDefense").textContent = player.defense;
}

function useSkill(num) {
  console.log("🧪 Tentative d'utilisation de la compétence", num);

  if (player.class !== "mage") {
    console.log("⛔ Ce n’est pas un mage !");
    return;
  }

  switch (num) {
    case 1: // Boule de feu
      if (player.mana >= 20) {
        player.mana -= 20;
        console.log("🔥 Boule de feu lancée !");
        projectiles.push({
          x: player.x + 16,
          y: player.y + 16,
          radius: 6,
          speed: 5,
          damage: 20
        });
      } else {
        console.log("❌ Pas assez de mana !");
      }
      break;

    case 2: // Soin
      if (player.mana >= 15) {
        player.mana -= 15;
        player.hp += 30;
        if (player.hp > player.maxHp) player.hp = player.maxHp;
        console.log("💖 Soin lancé !");
      } else {
        console.log("❌ Pas assez de mana !");
      }
      break;

    case 3: // Armure magique
      if (player.mana >= 25 && !player.armorActive) {
        player.mana -= 25;
        player.defense += 10;
        player.armorActive = true;
        console.log("🛡️ Armure magique activée !");
        setTimeout(() => {
          player.defense -= 10;
          player.armorActive = false;
          console.log("⏳ Armure magique terminée.");
        }, 10000);
      } else if (player.armorActive) {
        console.log("⏳ Armure déjà active !");
      } else {
        console.log("❌ Pas assez de mana !");
      }
      break;
  }

  updateHUD(); // Toujours mettre à jour l'affichage
}

function update() {
  if (keys["ArrowUp"] || keys["z"]) player.y -= player.speed;
  if (keys["ArrowDown"] || keys["s"]) player.y += player.speed;
  if (keys["ArrowLeft"] || keys["q"]) player.x -= player.speed;
  if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;

  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < enemy.aggroRange) {
    enemy.x += enemy.speed * (dx / distance);
    enemy.y += enemy.speed * (dy / distance);
  }

  // Projectile vs ennemi
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.x += p.speed;

    if (p.x > enemy.x && p.x < enemy.x + enemy.width &&
        p.y > enemy.y && p.y < enemy.y + enemy.height) {
      enemy.hp -= p.damage;
      console.log(`💥 Ennemi touché ! PV restants : ${enemy.hp}`);
      projectiles.splice(i, 1);
    } else if (p.x > canvas.width) {
      projectiles.splice(i, 1);
    }
  }
}

function draw() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#3a3";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (enemy.sprite) ctx.drawImage(enemy.sprite, enemy.x, enemy.y, enemy.width, enemy.height);
  if (player.sprite) ctx.drawImage(player.sprite, player.x, player.y, player.width, player.height);

  // Boules de feu
  ctx.fillStyle = "orange";
  for (let p of projectiles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Si armure magique active, dessiner halo
  if (player.armorActive) {
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(player.x + 16, player.y + 16, 20, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Dessiner la boule de feu
ctx.fillStyle = "orange";
projectiles.forEach((p) => {
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
  ctx.fill();
});

// Effet visuel d’armure
if (player.armorActive) {
  ctx.strokeStyle = "cyan";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(player.x + 16, player.y + 16, 20, 0, Math.PI * 2);
  ctx.stroke();
}

}

function gameLoop() {
  update();
  draw();
  updateHUD();
  requestAnimationFrame(gameLoop);
}
