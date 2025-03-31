let gameStarted = false;

document.addEventListener("DOMContentLoaded", () => {
  // attente que le joueur clique sur "Commencer"
});

function startMiniGame() {
  if (gameStarted) return;
  gameStarted = true;

  document.getElementById("startScreen").style.display = "none";
  initGame();
}

function initGame() {
  const canvas = document.getElementById("towerDefense");
  const ctx = canvas.getContext("2d");

  const TILE_SIZE = 60;
  const GRID_ROWS = 5;
  const GRID_COLS = 10;
  const UNIT_COST = { shooter: 10, generator: 15, multi: 40 };
  const PROJECTILE_SPEED = 4;
  const GENERATOR_DURATION = 15000;
  const GENERATOR_INCOME = 3;
  const SHOOT_INTERVAL = 1000;

  let resources = 45;
  let displayedResources = 45;
  let lives = 3;
  let wave = 0;
  let gameLoopInterval;
  let towerCleanupInterval;

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
    generator: "../assets/img/générateur.png",
    background: "../assets/img/background.png"
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

    gameLoopInterval = setInterval(gameLoop, 1000 / 60);

    towerCleanupInterval = setInterval(() => {
      for (let i = towers.length - 1; i >= 0; i--) {
        const tower = towers[i];
        if (tower.type !== "generator" && Date.now() - tower.createdAt > 10000) {
          ctx.fillStyle = "rgba(255,0,0,0.3)";
          ctx.fillRect(tower.x * TILE_SIZE, tower.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          if (grid[tower.y][tower.x] === tower) grid[tower.y][tower.x] = null;
          towers.splice(i, 1);
        }
      }
    }, 1000);
  }

  function spawnEnemies() {
    if (wave >= 5) return;
    wave++;
    updateUI();
    const types = ["normal", "tank", "fast"];
    for (let i = 0; i < wave + 2; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const row = Math.floor(Math.random() * GRID_ROWS);
      let enemy = {
        x: canvas.width,
        y: TILE_SIZE * row,
        row,
        type,
        color: "red",
        hp: 3,
        speed: 0.5,
        damage: 1
      };
      if (type === "tank") {
        enemy.color = "orange";
        enemy.hp = 6;
        enemy.damage = 2;
        enemy.speed = 0.4;
      } else if (type === "fast") {
        enemy.color = "violet";
        enemy.hp = 2;
        enemy.speed = 1;
      }
      enemies.push(enemy);
    }
  }

  function updateUI() {
    if (Math.abs(displayedResources - resources) > 0.5) {
      displayedResources += (resources - displayedResources) * 0.1;
    } else {
      displayedResources = resources;
    }
    document.getElementById("resources").textContent = Math.floor(displayedResources);
    document.getElementById("lives").textContent = lives;
    document.getElementById("wave").textContent = wave <= 5 ? wave : 5;
  }

  function showVictoryScreen() {
    const screen = document.getElementById("victoryScreen");
    if (screen) {
      screen.style.display = "flex";
      clearInterval(gameLoopInterval);
      clearInterval(towerCleanupInterval);
    }
  }

  function drawGrid() {
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    for (let i = 0; i <= GRID_COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * TILE_SIZE, 0);
      ctx.lineTo(i * TILE_SIZE, GRID_ROWS * TILE_SIZE);
      ctx.stroke();
    }
    for (let i = 0; i <= GRID_ROWS; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * TILE_SIZE);
      ctx.lineTo(GRID_COLS * TILE_SIZE, i * TILE_SIZE);
      ctx.stroke();
    }
  }

  function gameLoop() {
    if (enemies.length === 0) {
      if (wave < 5 && !gameLoop.waveInProgress) {
        gameLoop.waveInProgress = true;
        setTimeout(() => {
          spawnEnemies();
          gameLoop.waveInProgress = false;
        }, 2000);
      } else if (wave >= 5) {
        showVictoryScreen();
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);
    drawGrid();

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
        if (enemy.row === p.row && p.x > enemy.x && p.x < enemy.x + TILE_SIZE) {
          enemy.hp -= p.damage;
          projectiles.splice(i, 1);
        }
      });
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      e.x -= e.speed;
      ctx.fillStyle = e.color;
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

    updateUI();
  }
}
