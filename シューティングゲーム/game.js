const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let W = 0;
let H = 0;

function resizeCanvas() {
  W = window.innerWidth;
  H = window.innerHeight;

  canvas.width = W;
  canvas.height = H;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const ASSETS = {
  player: "assets/jiki.png",
  zako: "assets/zako.png",
  normal: "assets/normal.png",
  elite: "assets/elite.png",
  mboss: "assets/mboss.png",
  lboss: "assets/lboss.png",
  bg: "assets/haikei.jpg",
  title: "assets/title.png",
};

// 追加：BGM
const bgm = new Audio("assets/bgm.mp3");
bgm.loop = true;
bgm.volume = 0.35;

const images = {};
let assetsLoaded = 0;
const totalAssets = Object.keys(ASSETS).length;

for (const key in ASSETS) {
  const img = new Image();
  img.src = ASSETS[key];

  img.onload = () => {
    assetsLoaded++;
    startLoopIfReady();
  };

  img.onerror = () => {
    console.warn(`画像を読み込めませんでした: ${ASSETS[key]}`);
    img.failed = true;
    assetsLoaded++;
    startLoopIfReady();
  };

  images[key] = img;
}

let loopStarted = false;

function startLoopIfReady() {
  if (loopStarted) return;
  if (assetsLoaded >= totalAssets) {
    loopStarted = true;
    requestAnimationFrame(gameLoop);
  }
}

const keys = {};

window.addEventListener("keydown", e => {
  const key = e.key.toLowerCase();

  keys[key] = true;

  if (
    key === "arrowup" ||
    key === "arrowdown" ||
    key === "arrowleft" ||
    key === "arrowright" ||
    key === " " ||
    key === "enter"
  ) {
    e.preventDefault();
  }

  if (key === "enter" || key === " ") {
    if (gameState === "title" || gameState === "gameover" || gameState === "clear") {
      startGame();
    }
  }

  if (key === "r") {
    startGame();
  }
});

window.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

let pointerActive = false;
let pointerX = 0;
let pointerY = 0;

canvas.addEventListener("pointerdown", e => {
  pointerActive = true;
  pointerX = e.clientX;
  pointerY = e.clientY;

  if (gameState === "title" || gameState === "gameover" || gameState === "clear") {
    startGame();
  }
});

canvas.addEventListener("pointermove", e => {
  pointerX = e.clientX;
  pointerY = e.clientY;
});

canvas.addEventListener("pointerup", () => {
  pointerActive = false;
});

canvas.addEventListener("pointercancel", () => {
  pointerActive = false;
});

let gameState = "title";

let player;
let playerBullets = [];
let enemyBullets = [];
let enemies = [];
let items = [];
let effects = [];

let bgY = 0;
let score = 0;
let gameTime = 0;
let lastTime = 0;

let spawnTimer = 0;
let midBossAppeared = false;
let bossAppeared = false;

function startGame() {
  gameState = "playing";

  playBgm();

  player = {
    x: W / 2,
    y: H - 130,
    w: 112,
    h: 112,
    r: 40,
    speed: 320,
    hp: 5,
    maxHp: 5,
    shield: 0,
    maxShield: 3,
    invincible: 0,

    fireTimer: 0,
    rapidLevel: 0,
    spread: false,
    clones: 0,
  };

  playerBullets = [];
  enemyBullets = [];
  enemies = [];
  items = [];
  effects = [];

  bgY = 0;
  score = 0;
  gameTime = 0;
  spawnTimer = 0;

  midBossAppeared = false;
  bossAppeared = false;
}

function playBgm() {
  bgm.currentTime = 0;
  bgm.play().catch(err => {
    console.warn("BGMを再生できませんでした:", err);
  });
}

function stopBgm() {
  bgm.pause();
  bgm.currentTime = 0;
}


function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.033);
  lastTime = timestamp;

  update(dt);
  draw();

  requestAnimationFrame(gameLoop);
}

function update(dt) {
  if (gameState !== "playing") return;

  gameTime += dt;

  updateBackground(dt);
  updatePlayer(dt);
  updatePlayerBullets(dt);
  updateEnemies(dt);
  updateEnemyBullets(dt);
  updateItems(dt);
  updateEffects(dt);
  updateSpawner(dt);
  handleCollisions();
}

function updateBackground(dt) {
  bgY += 140 * dt;
  if (bgY >= H) {
    bgY -= H;
  }
}

function updatePlayer(dt) {
  if (!player) return;

  if (pointerActive) {
    const dx = pointerX - player.x;
    const dy = pointerY - player.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 2) {
      const move = player.speed * dt * 1.4;
      player.x += dx / dist * Math.min(move, dist);
      player.y += dy / dist * Math.min(move, dist);
    }
  } else {
    let dx = 0;
    let dy = 0;

    if (keys["arrowleft"] || keys["a"]) dx -= 1;
    if (keys["arrowright"] || keys["d"]) dx += 1;
    if (keys["arrowup"] || keys["w"]) dy -= 1;
    if (keys["arrowdown"] || keys["s"]) dy += 1;

    const len = Math.hypot(dx, dy);
    if (len > 0) {
      dx /= len;
      dy /= len;
    }

    player.x += dx * player.speed * dt;
    player.y += dy * player.speed * dt;
  }

  player.x = clamp(player.x, 56, W - 56);
  player.y = clamp(player.y, 70, H - 70);

  if (player.invincible > 0) {
    player.invincible -= dt;
  }

  player.fireTimer -= dt;

  if (player.fireTimer <= 0) {
    firePlayerShot();
    player.fireTimer = getFireInterval();
  }
}

function getFireInterval() {
  const intervals = [0.28, 0.22, 0.17, 0.13, 0.1];
  return intervals[player.rapidLevel] || 0.1;
}

function firePlayerShot() {
  const shooters = getShooterPositions();

  for (const shooter of shooters) {
    // 自機も分身も、spreadがONなら3方向ショット
    if (player.spread) {
      createPlayerBullet(shooter.x, shooter.y, -90);
      createPlayerBullet(shooter.x, shooter.y, -110);
      createPlayerBullet(shooter.x, shooter.y, -70);
    } else {
      createPlayerBullet(shooter.x, shooter.y, -90);
    }
  }
}

function getShooterPositions() {
  const list = [
    {
      x: player.x,
      y: player.y - 56,
      type: "player",
    },
  ];

  const cloneOffsets = [
    { x: -86, y: 34 },
    { x: 86, y: 34 },
    { x: -150, y: 70 },
    { x: 150, y: 70 },
  ];

  for (let i = 0; i < player.clones; i++) {
    const o = cloneOffsets[i];

    list.push({
      x: player.x + o.x,
      y: player.y + o.y,
      type: "clone",
    });
  }

  return list;
}


function createPlayerBullet(x, y, angleDeg) {
  const rad = angleDeg * Math.PI / 180;
  const speed = 620;

  playerBullets.push({
    x,
    y,
    vx: Math.cos(rad) * speed,
    vy: Math.sin(rad) * speed,
    r: 4,
    damage: 1,
  });
}

function updatePlayerBullets(dt) {
  for (const b of playerBullets) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
  }

  playerBullets = playerBullets.filter(b => {
    return b.x > -80 && b.x < W + 80 && b.y > -100 && b.y < H + 100;
  });
}

function updateEnemyBullets(dt) {
  for (const b of enemyBullets) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
  }

  enemyBullets = enemyBullets.filter(b => {
    return b.x > -100 && b.x < W + 100 && b.y > -100 && b.y < H + 100;
  });
}

function updateSpawner(dt) {
  const hasBossLike = enemies.some(e => e.type === "mboss" || e.type === "lboss");

  if (!midBossAppeared && gameTime >= 45) {
    midBossAppeared = true;
    spawnEnemy("mboss", W / 2, -100);
    return;
  }

  if (!bossAppeared && gameTime >= 100) {
    bossAppeared = true;
    spawnEnemy("lboss", W / 2, -140);
    return;
  }

  if (hasBossLike) return;

  spawnTimer -= dt;
  if (spawnTimer > 0) return;

  let interval = 1.0;

  if (gameTime > 25) interval = 0.75;
  if (gameTime > 60) interval = 0.55;
  if (gameTime > 80) interval = 0.45;

  spawnTimer = interval;

  const r = Math.random();

  if (gameTime < 20) {
    spawnEnemy("zako", randomSpawnX(100), -100);
  } else if (gameTime < 50) {
    if (r < 0.8) {
      spawnEnemy("normal", randomSpawnX(120), -120);
    } else {
      spawnEnemy("elite", randomSpawnX(120), -120);
    }
  } else {
    if (r < 0.70) {
      spawnEnemy("zako", randomSpawnX(100), -100);
    } else if (r < 0.90) {
      spawnEnemy("normal", randomSpawnX(120), -120);
    } else {
      spawnEnemy("elite", randomSpawnX(120), -120);
    }
  }
}

function spawnEnemy(type, x, y) {
  const data = getEnemyData(type);

  const enemy = {
    type,
    x,
    y,
    startX: x,
    w: data.w,
    h: data.h,
    r: data.r,
    hp: data.hp,
    maxHp: data.hp,
    speed: data.speed,
    vx: data.vx || 0,
    vy: data.speed,
    score: data.score,
    t: 0,
    shootTimer: data.shootInterval ? Math.random() * data.shootInterval : 0,
    dead: false,
  };

  if (type === "normal") {
    enemy.vx = Math.random() < 0.5 ? -120 : 120;
  }

  enemies.push(enemy);
}

function getEnemyData(type) {
  const baseScale = Math.max(0.85, Math.min(W / 480, 1.25));

  // 敵ごとにサイズ倍率を変える
  const scaleZako = baseScale * 3;
  const scaleNormal = baseScale * 2;
  const scaleElite = baseScale * 2;
  const scaleBoss = baseScale * 3;

  switch (type) {
    case "zako":
      return {
        w: 38 * scaleZako,
        h: 38 * scaleZako,
        r: 17 * scaleZako,
        hp: 2,

        // 前進は速め
        speed: 170,

        score: 100,

        // 雑魚も攻撃
        shootInterval: 1.6,
      };

    case "normal":
      return {
        w: 48 * scaleNormal,
        h: 48 * scaleNormal,
        r: 21 * scaleNormal,
        hp: 5,
        speed: 130,
        score: 300,

        // ノーマルも攻撃
        shootInterval: 1.2,
      };

case "elite":
  return {
    w: 56 * scaleElite,
    h: 56 * scaleElite,
    r: 24 * scaleElite,
    hp: 8,

    // 追尾スピードを少し遅く
    speed: 100,

    score: 600,
    shootInterval: 0.9,
  };

    case "mboss":
      return {
        w: 120 * scaleBoss,
        h: 120 * scaleBoss,
        r: 52 * scaleBoss,
        hp: 120,
        speed: 80,
        score: 3000,
        shootInterval: 0.45,
      };

    case "lboss":
      return {
        w: 170 * scaleBoss,
        h: 170 * scaleBoss,
        r: 72 * scaleBoss,
        hp: 900,
        speed: 70,
        score: 10000,
        shootInterval: 0.28,
      };
  }
}

function updateEnemies(dt) {
  for (const e of enemies) {
    e.t += dt;

if (e.type === "zako") {
  // 前進は速く
  e.y += e.speed * dt;

  // 左右の揺れは遅め
  e.x = e.startX + Math.sin(e.t * 2.0) * 55;

  // 雑魚も下方向に攻撃
  if (e.y > 0 && e.y < H - 80) {
    e.shootTimer -= dt;

    if (e.shootTimer <= 0) {
      fireStraightEnemyBullet(e.x, e.y + e.h * 0.3, 220, 5);
      e.shootTimer = 1.6 + Math.random() * 0.5;
    }
  }
}


if (e.type === "normal") {
  e.x += e.vx * dt;
  e.y += e.speed * dt;

  if (e.x < 50) {
    e.x = 50;
    e.vx *= -1;
  }

  if (e.x > W - 50) {
    e.x = W - 50;
    e.vx *= -1;
  }

  // ノーマルは前方、つまり下方向に直進弾
  if (e.y > 0 && e.y < H - 100) {
    e.shootTimer -= dt;

    if (e.shootTimer <= 0) {
      fireStraightEnemyBullet(e.x, e.y + e.h * 0.3, 230, 5);
      e.shootTimer = 1.2 + Math.random() * 0.4;
    }
  }
}

if (e.type === "elite") {
  const angle = Math.atan2(player.y - e.y, player.x - e.x);

  e.x += Math.cos(angle) * e.speed * dt;
  e.y += Math.sin(angle) * e.speed * dt;

  // エリートは自機狙い弾を少し高頻度で撃つ
  if (e.y > 0 && e.y < H - 100) {
    e.shootTimer -= dt;

    if (e.shootTimer <= 0) {
      fireAimedEnemyBullet(e.x, e.y + e.h * 0.3, 270, 6);
      e.shootTimer = 0.9 + Math.random() * 0.3;
    }
  }
}

    if (e.type === "mboss") {
      const targetY = Math.min(120, H * 0.18);

      if (e.y < targetY) {
        e.y += e.speed * dt;
      } else {
        e.y = targetY;
        e.shootTimer -= dt;

        if (e.shootTimer <= 0) {
          fireAimedEnemyBullet(e.x, e.y + e.h * 0.35, 260, 8);
          e.shootTimer = 0.45;
        }
      }
    }

    if (e.type === "lboss") {
      const targetY = Math.min(150, H * 0.2);

      if (e.y < targetY) {
        e.y += e.speed * dt;
      } else {
        e.y = targetY;

        const moveRange = Math.max(80, W * 0.28);
        e.x = W / 2 + Math.sin(e.t * 1.5) * moveRange;

        e.shootTimer -= dt;

        if (e.shootTimer <= 0) {
          fireBossPattern(e);
          e.shootTimer = e.hp < e.maxHp / 2 ? 0.18 : 0.28;
        }
      }
    }
  }

  enemies = enemies.filter(e => {
    return !e.dead && e.y < H + 180;
  });
}

function fireAimedEnemyBullet(x, y, speed, radius = 6) {
  const angle = Math.atan2(player.y - y, player.x - x);

  enemyBullets.push({
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    r: radius,
    color: "#ff5555",
  });
}

function fireBossPattern(e) {
  fireAimedEnemyBullet(e.x, e.y + e.h * 0.35, 300, 7);

  const isAngry = e.hp < e.maxHp / 2;
  const count = isAngry ? 9 : 7;
  const spread = isAngry ? 90 : 65;
  const baseAngle = 90;

  for (let i = 0; i < count; i++) {
    const a = baseAngle - spread / 2 + spread * (i / (count - 1));
    const rad = a * Math.PI / 180;
    const speed = isAngry ? 260 : 220;

    enemyBullets.push({
      x: e.x,
      y: e.y + e.h * 0.35,
      vx: Math.cos(rad) * speed,
      vy: Math.sin(rad) * speed,
      r: 5,
      color: "#ff99ff",
    });
  }
}

function fireStraightEnemyBullet(x, y, speed = 220, radius = 5) {
  enemyBullets.push({
    x,
    y,
    vx: 0,
    vy: speed,
    r: radius,
    color: "#ffdd55",
  });
}

function fireEnemyBulletAngle(x, y, angleDeg, speed = 220, radius = 5, color = "#ff9955") {
  const rad = angleDeg * Math.PI / 180;

  enemyBullets.push({
    x,
    y,
    vx: Math.cos(rad) * speed,
    vy: Math.sin(rad) * speed,
    r: radius,
    color,
  });
}


function updateItems(dt) {
  for (const item of items) {
    item.y += item.vy * dt;
    item.t += dt;
  }

  items = items.filter(item => item.y < H + 60 && !item.dead);
}

function updateEffects(dt) {
  for (const ef of effects) {
    ef.life -= dt;
    ef.radius += ef.speed * dt;
  }

  effects = effects.filter(ef => ef.life > 0);
}

function handleCollisions() {
  for (const b of playerBullets) {
    for (const e of enemies) {
      if (e.dead) continue;

      if (circleHit(b.x, b.y, b.r, e.x, e.y, e.r)) {
        b.dead = true;
        e.hp -= b.damage;

        effects.push({
          x: b.x,
          y: b.y,
          radius: 4,
          speed: 90,
          life: 0.12,
          color: "rgba(120,220,255,0.8)",
        });

        if (e.hp <= 0) {
          killEnemy(e);
        }

        break;
      }
    }
  }

  playerBullets = playerBullets.filter(b => !b.dead);

  if (player.invincible <= 0) {
    for (const b of enemyBullets) {
      if (circleHit(b.x, b.y, b.r, player.x, player.y, player.r)) {
        b.dead = true;
        damagePlayer(1);
        break;
      }
    }
  }

  enemyBullets = enemyBullets.filter(b => !b.dead);

  if (player.invincible <= 0) {
    for (const e of enemies) {
      if (e.dead) continue;

      if (circleHit(e.x, e.y, e.r, player.x, player.y, player.r)) {
        killEnemy(e);
        damagePlayer(2);
        break;
      }
    }
  }

  for (const item of items) {
    if (circleHit(item.x, item.y, item.r, player.x, player.y, player.r + 10)) {
      item.dead = true;
      applyPowerUp(item.type);
    }
  }

  items = items.filter(item => !item.dead);
}

function killEnemy(e) {
  if (e.dead) return;

  e.dead = true;
  score += e.score;

  effects.push({
    x: e.x,
    y: e.y,
    radius: 12,
    speed: 120,
    life: 0.35,
    color: "rgba(255,180,60,0.85)",
  });

  tryDropItem(e);

  if (e.type === "lboss") {
    gameState = "clear";
    stopBgm();
  }
}

function tryDropItem(e) {
  let rate = 0.15;

  if (e.type === "zako") rate = 0.18;
  if (e.type === "normal") rate = 0.28;
  if (e.type === "elite") rate = 0.38;
  if (e.type === "mboss") rate = 1.0;
  if (e.type === "lboss") rate = 1.0;

  if (Math.random() > rate) return;

  const types = ["rapid", "spread", "clone", "shield"];
  const type = types[Math.floor(Math.random() * types.length)];

  items.push({
    x: e.x,
    y: e.y,
    vy: 95,
    r: 15,
    type,
    t: 0,
  });
}

function applyPowerUp(type) {
  if (type === "rapid") {
    if (player.rapidLevel < 4) {
      player.rapidLevel++;
    } else {
      score += 500;
    }
  }

  if (type === "spread") {
    if (!player.spread) {
      player.spread = true;
    } else {
      score += 500;
    }
  }

  if (type === "clone") {
    if (player.clones < 4) {
      player.clones++;
    } else {
      score += 500;
    }
  }

  // 追加：シールド
  if (type === "shield") {
    if (player.shield < player.maxShield) {
      player.shield++;
    } else {
      score += 500;
    }
  }

  effects.push({
    x: player.x,
    y: player.y,
    radius: 20,
    speed: 130,
    life: 0.4,
    color: "rgba(100,255,120,0.75)",
  });
}

function damagePlayer(amount) {
  // シールドがある場合、HPの代わりにシールドを1つ消費
  if (player.shield > 0) {
    player.shield--;
    player.invincible = 1.2;

    effects.push({
      x: player.x,
      y: player.y,
      radius: 26,
      speed: 170,
      life: 0.35,
      color: "rgba(80,180,255,0.9)",
    });

    return;
  }

  player.hp -= amount;
  player.invincible = 1.2;

  effects.push({
    x: player.x,
    y: player.y,
    radius: 18,
    speed: 130,
    life: 0.3,
    color: "rgba(255,60,60,0.85)",
  });

  if (player.hp <= 0) {
    player.hp = 0;
    gameState = "gameover";
    stopBgm();
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  drawBackground();

  if (gameState === "title") {
    drawTitle();
    return;
  }

  drawItems();
  drawPlayerBullets();
  drawEnemies();
  drawEnemyBullets();

  if (player) {
    drawPlayer();
  }

  drawEffects();
  drawUI();

  if (gameState === "gameover") {
    drawGameOver();
  }

  if (gameState === "clear") {
    drawClear();
  }
}

function drawBackground() {
  const bg = images.bg;

  if (bg && !bg.failed && bg.complete && bg.naturalWidth > 0) {
    ctx.drawImage(bg, 0, bgY, W, H);
    ctx.drawImage(bg, 0, bgY - H, W, H);
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#020212");
    g.addColorStop(1, "#101030");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
}

function drawPlayer() {
  const blink = player.invincible > 0 && Math.floor(player.invincible * 14) % 2 === 0;
  if (blink) return;

  const cloneOffsets = [
    { x: -86, y: 34 },
    { x: 86, y: 34 },
    { x: -150, y: 70 },
    { x: 150, y: 70 },
  ];

  // 分身を描画
  ctx.save();
  ctx.globalAlpha = 0.7;

  for (let i = 0; i < player.clones; i++) {
    const o = cloneOffsets[i];

    drawImageCenter(
      images.player,
      player.x + o.x,
      player.y + o.y,
      72,
      72,
      "#55ff88"
    );
  }

  ctx.restore();

  // 自機を描画
  drawImageCenter(images.player, player.x, player.y, player.w, player.h, "#66ddff");

  // シールド表示
  if (player.shield > 0) {
    ctx.save();

    for (let i = 0; i < player.shield; i++) {
      ctx.strokeStyle = `rgba(80, 200, 255, ${0.75 - i * 0.15})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        player.x,
        player.y,
        player.r + 12 + i * 8,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    ctx.restore();
  }
}




function drawPlayerBullets() {
  for (const b of playerBullets) {
    ctx.fillStyle = "#66ddff";
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(180,240,255,0.45)";
    ctx.fillRect(b.x - 1, b.y + 4, 2, 14);
  }
}

function drawEnemyBullets() {
  for (const b of enemyBullets) {
    ctx.fillStyle = b.color || "#ff5555";
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawEnemies() {
  for (const e of enemies) {
    drawImageCenter(images[e.type], e.x, e.y, e.w, e.h, "#ff6666");

    if (e.type === "mboss" || e.type === "lboss") {
      drawBossHpBar(e);
    }
  }
}

function drawBossHpBar(e) {
  const barW = Math.min(W * 0.7, e.type === "lboss" ? 420 : 300);
  const barH = 12;
  const bx = W / 2 - barW / 2;
  const by = 20;

  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(bx, by, barW, barH);

  ctx.fillStyle = e.type === "lboss" ? "#ff4444" : "#ffaa33";
  ctx.fillRect(bx, by, barW * Math.max(e.hp / e.maxHp, 0), barH);

  ctx.strokeStyle = "white";
  ctx.strokeRect(bx, by, barW, barH);
}

function drawItems() {
  for (const item of items) {
    const pulse = Math.sin(item.t * 8) * 2;

    if (item.type === "rapid") ctx.fillStyle = "#ff5555";
    if (item.type === "spread") ctx.fillStyle = "#4488ff";
    if (item.type === "clone") ctx.fillStyle = "#55ff88";
    if (item.type === "shield") ctx.fillStyle = "#55ccff";

    ctx.beginPath();
    ctx.arc(item.x, item.y, item.r + pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let label = "";
    if (item.type === "rapid") label = "R";
    if (item.type === "spread") label = "S";
    if (item.type === "clone") label = "C";
    if (item.type === "shield") label = "D";

    ctx.fillText(label, item.x, item.y + 1);
  }
}


function drawEffects() {
  for (const ef of effects) {
    ctx.strokeStyle = ef.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ef.x, ef.y, ef.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawUI() {
  if (!player) return;

  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(10, 10, 190, 146);

  ctx.fillStyle = "white";
  ctx.font = "18px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  ctx.fillText(`SCORE: ${score}`, 20, 18);
  ctx.fillText(`HP: ${player.hp}/${player.maxHp}`, 20, 44);
  ctx.fillText(`Shield: ${player.shield}/${player.maxShield}`, 20, 70);

  ctx.font = "14px sans-serif";
  ctx.fillText(`Rapid Lv: ${player.rapidLevel}`, 20, 96);
  ctx.fillText(`Spread: ${player.spread ? "ON" : "OFF"}`, 20, 116);
  ctx.fillText(`Clone: ${player.clones}/4`, 20, 136);


  ctx.textAlign = "right";
  ctx.fillText(`TIME: ${Math.floor(gameTime)}`, W - 20, 20);

  ctx.restore();
}

function drawTitle() {
  const titleImg = images.title;

  // タイトル画像を画面いっぱいに表示
  if (titleImg && !titleImg.failed && titleImg.complete && titleImg.naturalWidth > 0) {
    drawImageCover(titleImg, 0, 0, W, H);
  } else {
    // タイトル画像が読めなかった時の保険
    ctx.fillStyle = "#020212";
    ctx.fillRect(0, 0, W, H);
  }

  // 少し暗いフィルターを重ねて文字を読みやすくする
  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  ctx.fillRect(0, 0, W, H);

  ctx.save();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // 画像内にも PRESS START があるけど、操作説明として追加表示
  ctx.fillStyle = "rgba(180, 255, 255, 0.95)";
  ctx.font = `bold ${Math.min(28, W * 0.045)}px sans-serif`;
  ctx.shadowColor = "rgba(80, 255, 255, 0.9)";
  ctx.shadowBlur = 12;
  ctx.fillText("PRESS ENTER / SPACE / CLICK", W / 2, H * 0.82);

  // 制作者表記
  ctx.shadowBlur = 8;
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.font = `${Math.min(18, W * 0.032)}px sans-serif`;
  ctx.fillText("制作：竹内先生", W / 2, H * 0.9);

  // 操作説明
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.font = `${Math.min(15, W * 0.028)}px sans-serif`;
  ctx.fillText("WASD / 矢印キー：移動　スマホ：ドラッグ移動", W / 2, H * 0.95);

  ctx.restore();
}


function drawGameOver() {
  drawCenterPanel("GAME OVER", "#ff5555", `SCORE: ${score}`, "Enter / Space / R でリスタート");
}

function drawClear() {
  drawCenterPanel("GAME CLEAR!", "#66ff99", `SCORE: ${score}`, "Enter / Space / R でリスタート");
}

function drawCenterPanel(title, color, line1, line2) {
  ctx.fillStyle = "rgba(0,0,0,0.68)";
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = color;
  ctx.font = `bold ${Math.min(50, W * 0.1)}px sans-serif`;
  ctx.fillText(title, W / 2, H / 2 - 50);

  ctx.fillStyle = "white";
  ctx.font = `${Math.min(24, W * 0.05)}px sans-serif`;
  ctx.fillText(line1, W / 2, H / 2 + 10);

  ctx.font = `${Math.min(18, W * 0.04)}px sans-serif`;
  ctx.fillText(line2, W / 2, H / 2 + 55);
}

function drawImageCenter(img, x, y, w, h, fallbackColor = "#ffffff") {
  if (img && !img.failed && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
  } else {
    ctx.fillStyle = fallbackColor;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(w, h) / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawImageCover(img, x, y, w, h) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = w / h;

  let drawW;
  let drawH;
  let drawX;
  let drawY;

  if (canvasRatio > imgRatio) {
    drawW = w;
    drawH = w / imgRatio;
    drawX = x;
    drawY = y + (h - drawH) / 2;
  } else {
    drawH = h;
    drawW = h * imgRatio;
    drawX = x + (w - drawW) / 2;
    drawY = y;
  }

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
}


function circleHit(x1, y1, r1, x2, y2, r2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const rr = r1 + r2;
  return dx * dx + dy * dy <= rr * rr;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randomSpawnX(margin = 120) {
  if (W < margin * 2) {
    return W / 2;
  }

  return rand(margin, W - margin);
}
