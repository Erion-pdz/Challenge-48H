
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("towerDefense");
  const ctx = canvas.getContext("2d");

  const TILE_SIZE = 60;
  const GRID_ROWS = 5;
  const GRID_COLS = 10;
  const UNIT_COST = { shooter: 10, generator: 15, multi: 20 };
  const PROJECTILE_SPEED = 4;
  const ENEMY_SPEED = 0.5;
  const GENERATOR_DURATION = 15000;
  const GENERATOR_INCOME = 3;
  const SHOOT_INTERVAL = 1000;

  let resources = 45;
  let lives = 3;
  let wave = 1;

  const towers = [];
  const enemies = [];
  const projectiles = [];
  const generators = [];
  let selectedType = "shooter";
  let grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(null));

  const imagePaths = {
    shooter: "../assets/img/tourelle.png",
    shooterFire: "../assets/img/tourelle_qui_tir.png",
    multi: "../assets/img/multi_tourelle.png",
    multiFire: "../assets/img/multi_tourelle_qui_tire.png",
    generator: "../assets/img/générateur.png"
  };

  const images = {};
  let loaded = 0;

  for (let key in imagePaths) {
    const img = new Image();
    img.src = imagePaths[key];
    img.onload = () => {
      loaded++;
      if (loaded === Object.keys(imagePaths).length) startGame();
    };
    images[key] = img;
  }

  function startGame() {
    document.querySelectorAll(".card").forEach(card => {
      card.addEventListener("click", () => {
        document.querySelectorAll(".card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        selectedType = card.dataset.type;
      });
    });

    canvas.addEventListener("click", e => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
      const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
      if (x >= GRID_COLS || y >= GRID_ROWS) return;
      if (grid[y][x] !== null) return;
      if (resources < UNIT_COST[selectedType]) return;

      const tower = {
        type: selectedType,
        x, y,
        lastShot: Date.now(),
        createdAt: Date.now()
      };

      grid[y][x] = tower;
      towers.push(tower);
      if (selectedType === "generator") {
        generators.push(tower);
        setTimeout(() => {
          grid[y][x] = null;
          const i = towers.indexOf(tower);
          if (i !== -1) towers.splice(i, 1);
        }, GENERATOR_DURATION);
      }
      resources -= UNIT_COST[selectedType];
      updateUI();
    });

    setInterval(gameLoop, 1000 / 60);
    setInterval(() => spawnEnemies(wave), 5000);
  }

  function spawnEnemies(wave) {
    for (let i = 0; i < wave + 2; i++) {
      enemies.push({
        x: canvas.width,
        y: TILE_SIZE * Math.floor(Math.random() * GRID_ROWS),
        hp: 3 + Math.floor(wave / 2),
        speed: ENEMY_SPEED,
        damage: 1
      });
    }
    wave++;
    updateUI();
  }

  function updateUI() {
    document.getElementById("resources").textContent = Math.floor(resources);
    document.getElementById("lives").textContent = lives;
    document.getElementById("wave").textContent = wave <= 5 ? wave : 5;
  }

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const now = Date.now();
    generators.forEach(g => {
      if (now - g.createdAt <= GENERATOR_DURATION) {
        resources += GENERATOR_INCOME / 60;
      }
    });

    towers.forEach(t => {
      const img = (t.type === "shooter" || t.type === "multi")
        ? (now - t.lastShot < 300 ? images[t.type + "Fire"] : images[t.type])
        : images[t.type];
      ctx.drawImage(img, t.x * TILE_SIZE, t.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

      if ((t.type === "shooter" || t.type === "multi") && now - t.lastShot >= SHOOT_INTERVAL) {
        t.lastShot = now;
        if (t.type === "shooter") {
          projectiles.push({ x: t.x * TILE_SIZE + TILE_SIZE, y: t.y * TILE_SIZE + TILE_SIZE / 2, damage: 1, row: t.y });
        } else if (t.type === "multi") {
          [-1, 0, 1].forEach(offset => {
            const row = t.y + offset;
            if (row >= 0 && row < GRID_ROWS) {
              projectiles.push({ x: t.x * TILE_SIZE + TILE_SIZE, y: row * TILE_SIZE + TILE_SIZE / 2, damage: 1, row });
            }
          });
        }
      }
    });

    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.x += PROJECTILE_SPEED;
      ctx.fillStyle = "#0ff";
      ctx.fillRect(p.x, p.y - 2, 6, 4);

      enemies.forEach(enemy => {
        if (Math.abs(p.y - enemy.y - TILE_SIZE / 2) < 20 && p.x > enemy.x && p.x < enemy.x + TILE_SIZE) {
          enemy.hp -= p.damage;
          projectiles.splice(i, 1);
        }
      });
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      e.x -= e.speed;
      ctx.fillStyle = "red";
      ctx.fillRect(e.x, e.y, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = "#fff";
      ctx.fillText(`${e.hp}HP`, e.x + 5, e.y + 15);

      if (e.hp <= 0) {
        enemies.splice(i, 1);
        resources += 5;
        updateUI();
      } else if (e.x <= 0) {
        lives -= e.damage;
        enemies.splice(i, 1);
        updateUI();
        if (lives <= 0) {
          alert("💀 Défaite !");
          location.reload();
        }
      }
    }
  }
});
