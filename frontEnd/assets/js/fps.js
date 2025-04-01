let difficulty = 1;
let gameStarted = false;

const canvas = document.getElementById("fps");
const ctx = canvas.getContext("2d");

const player = {
    HP: 100,
    Max_HP: 100,
    Munitions: 10,
    Max_Munitions: 10,
    Kill_Count: 0,
    Reload_Time: 2
}

let lastShot;
let reloading;
let ennemies = []

document.addEventListener("DOMContentLoaded", () => {
    // attend que le joueur choisisse la difficulté
})

function startMiniGame(choice) {
    if (gameStarted) return;
    gameStarted = true;
    
    document.getElementById("startScreen").style.display = "none";
    difficulty = choice;
    initGame();
}

function initGame() {
    canvas.addEventListener("click", e => {
        const rect = canvas.getBoundingClientRect();
        if (e.clientX - rect.left < 0 || e.clientY - rect.top < 0 || Date.now() - lastShot < 0.2 || reloading) return;

        lastShot = Date.now();

        if (player.Munitions <= 0) {
            Reload();
        } else {
            --player.Munitions;
            for (let i = ennemies.length - 1; i >= 0; i--) {
                ennemy = ennemies[i];
                if (e.clientX > ennemy.x && e.clientX < ennemy.x + 50 * ennemy.scale && e.clientY > ennemy.y && e.clientY > ennemy.y + 100 * ennemy.scale) {
                    console.log(i + " ennemy.x: " + ennemy.x + " client X: " + e.clientX + " ennemy.y: " + ennemy.y + " client Y: " + e.clientY);
                    ennemy.hp -= 5;
                    console.log(ennemy);
                    console.log(ennemies);
                    if (ennemy.hp <= 0) {
                        if(ennemy.damageInterval) {
                            clearInterval(ennemy.damageInterval);
                        }
                        clearInterval(ennemy.scalingInterval);

                        ennemies.pop(i);
                        player.Kill_Count++;
                        if (player.Kill_Count >= 10) {
                            Victory();
                        }
                    }
                    ennemy.scale -= 0.2;
                    if (ennemy.scale < 1) ennemy.scale = 1;
                }
            }
        }
    })

    document.addEventListener("keypress", e => {
        if (e.key === "r" || e.key === "R") Reload();
    })

    spawnInterval = setInterval(spawnEnemies, 2000);

    requestAnimationFrame(gameLoop);
}

function spawnEnemies() {
    let ennemy = {
        hp: 10 * difficulty,
        x: Math.floor(Math.random() * canvas.width/2),
        y: Math.floor(Math.random() * canvas.height/2),
        scale: 1,
        scalingInterval: setInterval(() => {
            ennemy.scale += 0.005;
        }, 15)
    }

    ennemies.push(ennemy);
}

function Reload() {
    reloading = true;
    setTimeout(() => {
        player.Munitions = player.Max_Munitions;
        reloading = false;
    }, 1000)
}

function drawEnnemies() {
    rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = ennemies.length - 1; i >= 0; i--) {
        ctx.fillStyle = "#f00";
        ctx.fillRect(ennemies[i].x, ennemies[i].y, ennemies[i].scale * 50, ennemies[i].scale * 100);
        ctx.fillStyle = "#fff";
        ctx.fillText(`HP: ${ennemies[i].hp}`, ennemies[i].x + 5, ennemies[i].y + 15);
    }
}

function updateHUD() {
    kc = document.getElementById("KC");
    hp = document.getElementById("HP");
    ammo = document.getElementById("Ammo");
    reloadingText = document.getElementById("reload");

    kc.textContent = `KC: ${player.Kill_Count}/10`;
    hp.textContent = `HP: ${player.HP}/${player.Max_HP}`;
    ammo.textContent = `Ammo: ${player.Munitions}/10`;

    if(reloading) {
        reloadingText.style.display = "flex";
    } else {
        reloadingText.style.display = "none";
    }
}

function Defeat() {
    clearInterval(spawnInterval);
    ennemies.forEach(ennemy => {
        clearInterval(ennemy.scalingInterval);
        if (ennemy.damageInterval){
            clearInterval(ennemy.damageInterval);
        }
    });
    defeatScreen = document.getElementById("defeatScreen");

    defeatScreen.style.display = "flex";
}

function Victory() {
    clearInterval(spawnInterval);
    ennemies.forEach(ennemy => {
        clearInterval(ennemy.damageInterval);
    });
    victoryScreen = document.getElementById("victoryScreen");

    victoryScreen.style.display = "flex";
}

function gameLoop() {
    drawEnnemies()
    ennemies.forEach(ennemy => {
        if (ennemy.scale >= 2) {
            clearInterval(ennemy.scalingInterval);
            if (!ennemy.damageInterval) {
                ennemy.damageInterval = setInterval(() => {
                    player.HP -= 10 * difficulty;
                    if (player.HP <= 0) Defeat();
                }, 500);
            }
        }
    })
    updateHUD();
    requestAnimationFrame(gameLoop);
}