const canvas = document.getElementById("lobby");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game State
let gameState = "game";

// Audio state
let audioEnabled = true;
const AUDIO_ICON_SIZE = 20;
const AUDIO_ICON_X = 18;
const AUDIO_ICON_Y = 18;
const SONG_TITLE = "alyzea - dream OS";

const bgMusic = new Audio("alyzea_dream_os.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.6;

// Auto-start audio
let audioStarted = false;
function startAudioIfNotStarted() {
  if (!audioStarted && audioEnabled) {
    bgMusic.play().catch(() => {});
    audioStarted = true;
  }
}
window.addEventListener("keydown", startAudioIfNotStarted);
window.addEventListener("mousedown", startAudioIfNotStarted);

//Assets
const audioOnIcon = new Image();
audioOnIcon.src = "audio_on.png";

const audioOffIcon = new Image();
audioOffIcon.src = "audio_off.png";

const mapImage = new Image();
mapImage.src = "Lobby.png";

const treeTopImage = new Image();
treeTopImage.src = "tree_top.png";

const plantImage = new Image();
plantImage.src = "Plant.png";

const helperBotDialogue = new Image();
helperBotDialogue.src = "HelperBot_Dialogue_2.png";

const cloverImage = new Image();
cloverImage.src = "Clover.png";

const cloverDialogue = new Image();
cloverDialogue.src = "Clover_Dialogue_2.png";

const lockedDoorDialogue = new Image();
lockedDoorDialogue.src = "LockedDoor.png";

const playerSprites = [];
for (let i = 1; i <= 6; i++) {
  const img = new Image();
  img.src = `Player_${i}.png`;
  playerSprites.push(img);
}
const playerImage = new Image();
playerImage.src = localStorage.getItem("selectedPlayerSprite") || "Player_1.png";


let assetsLoaded = 0;
const ASSETS_TO_LOAD = 
  1 + // audio on icon
  1 + // audio off icon
  1 + // map
  1 + // tree top
  1 + // plant
  1 + // helper bot dialogue
  1 + // clover image
  1 + // clover dialogue
  1 + // locked door dialogue
  playerSprites.length;

function assetLoaded() {
  assetsLoaded++;
  if (assetsLoaded === ASSETS_TO_LOAD) {
    requestAnimationFrame(loop);
  }
}

audioOnIcon.onload = assetLoaded;
audioOffIcon.onload = assetLoaded;
mapImage.onload = assetLoaded;
treeTopImage.onload = assetLoaded;
plantImage.onload = assetLoaded;
helperBotDialogue.onload = assetLoaded;
cloverImage.onload = assetLoaded;
cloverDialogue.onload = assetLoaded;
lockedDoorDialogue.onload = assetLoaded;
playerSprites.forEach(img => (img.onload = assetLoaded));

// World settings
const MAP_WIDTH = 5000;
const MAP_HEIGHT = 2500;

const PLAYER_SCALE = 0.3;
const PLAYER_SIZE = 2500 * PLAYER_SCALE;

const CAMERA_ZOOM = 0.65;

// Player
const player = {
  x: 4200,
  y: 1200,
  speed: 5,
  walkTime: 0,
  facing: "right"
};

// Input
const keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// Collision
const collisions = [
  {x: 1978, y: 1625, width: 1025, height: 575}, // tree
  {x: 4300, y: 1700, width: 600, height: 625}, // help desk
  {x: 3691, y: 288, width: 740, height: 490}, // right sofa
  {x: 2142, y: 274, width: 740, height: 490}, // middle sofa
  {x: 544, y: 274, width: 740, height: 490}, // left sofa
  {x: 110, y: 75, width: 450, height: 900}, // top of left wall
  {x: 0, y: 675, width: 448, height: 1000}, // bottom of left wall
  {x: 4425, y: 150, width: 500, height: 900}, // top of right wall
  {x: 4552, y: 775, width: 448, height: 816} // bottom of right wall
];

function isColliding(rect) {
  return collisions.some(c =>
    rect.x < c.x + c.width &&
    rect.x + rect.width > c.x &&
    rect.y < c.y + c.height &&
    rect.y + rect.height > c.y
  );
}

function getPlayerHitbox(x, y) {
  return {
    x: x - PLAYER_SIZE * 0.1,
    y: y + PLAYER_SIZE * 0.4,
    width: PLAYER_SIZE * 0.2,
    height: PLAYER_SIZE * 0.15
  };
}

// Locked Door Areas
const lockedDoorAreas = [
  { x: 325,  y: 1100, width: 275, height: 450 }, // orange door
  { x: 1498, y: 200,  width: 375, height: 525 } // green door
];

let showLockedDoorDialogue = false;

// Open Door Areas
const frutigerMetroDoor = { x: 3124, y: 170, width: 375, height: 525 };
const frutigerAeroDoor = { x: 4496, y: 1060, width: 275, height: 450 };

// Audio Click Handling
canvas.addEventListener("click", () => {
  if (audioEnabled && bgMusic.paused) {
    bgMusic.play().catch(() => {});
  }
});

// Mouse
let mouseX = 0;
let mouseY = 0;

canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

  // Audio toggle
canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (
    mouseX >= AUDIO_ICON_X &&
    mouseX <= AUDIO_ICON_X + AUDIO_ICON_SIZE &&
    mouseY >= AUDIO_ICON_Y &&
    mouseY <= AUDIO_ICON_Y + AUDIO_ICON_SIZE
  ) {
    audioEnabled = !audioEnabled;
    if (audioEnabled) bgMusic.play().catch(() => {});
    else bgMusic.pause();
  }
});

// NPCs
const CLOVER_SCALE = 0.3;
const CLOVER_SIZE = 2500 * CLOVER_SCALE;
const clover = { x: 894, y: 750, width: CLOVER_SIZE, height: CLOVER_SIZE };
const cloverHitbox = { x: clover.x + CLOVER_SIZE * 0.38, y: clover.y + CLOVER_SIZE * 0.8, width: CLOVER_SIZE * 0.6, height: CLOVER_SIZE * 0.3 };
const helperBotArea = { x: 4200, y: 1750, width: 200, height: 550 };
let showCloverDialogue = false;
let showHelperBotDialogue = false;

// Update
function update() {
  let dx = 0, dy = 0;
  if (keys["w"]) dy -= 1;
  if (keys["s"]) dy += 1;
  if (keys["a"]) dx -= 1;
  if (keys["d"]) dx += 1;

  if (dx || dy) {
    const len = Math.hypot(dx, dy);
    dx /= len;
    dy /= len;
  }

  if (dx < 0) player.facing = "left";
  if (dx > 0) player.facing = "right";
  player.walkTime = dx !== 0 ? player.walkTime + 0.15 : 0;

  const nextX = player.x + dx * player.speed;
  const nextY = player.y + dy * player.speed;
  if (!isColliding(getPlayerHitbox(nextX, player.y))) player.x = nextX;
  if (!isColliding(getPlayerHitbox(player.x, nextY))) player.y = nextY;

  const half = PLAYER_SIZE / 2;
  player.x = Math.max(half, Math.min(MAP_WIDTH - half, player.x));
  player.y = Math.max(half, Math.min(MAP_HEIGHT - half, player.y));

  const hitbox = getPlayerHitbox(player.x, player.y);

// Doors
if (
  checkCollision(hitbox, frutigerMetroDoor)
) window.location.href = "index_frutiger_metro.html";

if (
  checkCollision(hitbox, frutigerAeroDoor)
) window.location.href = "index_frutiger_aero.html";

// Locked Door Dialogue
showLockedDoorDialogue = lockedDoorAreas.some(area => checkCollision(hitbox, area));

// Dialogue
showCloverDialogue = checkCollision(hitbox, cloverHitbox);
showHelperBotDialogue = checkCollision(hitbox, helperBotArea);
}

function checkCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}


// Draw
function drawAudioUI() {
  ctx.setTransform(1,0,0,1,0,0);
  const icon = audioEnabled ? audioOnIcon : audioOffIcon;
  ctx.drawImage(icon, AUDIO_ICON_X, AUDIO_ICON_Y, AUDIO_ICON_SIZE, AUDIO_ICON_SIZE);
  if (audioEnabled) {
    ctx.font = "14px 'Press Start 2P'";
    ctx.fillStyle = "#1db8c7";
    ctx.textAlign = "left";
    ctx.fillText(SONG_TITLE, AUDIO_ICON_X + 40, AUDIO_ICON_Y + 18);
  }
}

function drawGame() {
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Camera
  const viewW = canvas.width / CAMERA_ZOOM;
  const viewH = canvas.height / CAMERA_ZOOM;
  let camX = player.x - viewW/2;
  let camY = player.y - viewH/2;
  camX = Math.max(0, Math.min(MAP_WIDTH - viewW, camX));
  camY = Math.max(0, Math.min(MAP_HEIGHT - viewH, camY));
  ctx.setTransform(CAMERA_ZOOM, 0, 0, CAMERA_ZOOM, -camX*CAMERA_ZOOM, -camY*CAMERA_ZOOM);

  // Map
  ctx.drawImage(mapImage, 0, 0, MAP_WIDTH, MAP_HEIGHT);

  // Player & Clover
  const hop = Math.sin(player.walkTime)*10;
  const playerX = player.x - PLAYER_SIZE/2;
  const playerY = player.y - PLAYER_SIZE/2 - hop;

  const drawBehindClover = player.y < 1125;
  if (drawBehindClover) drawPlayer(playerX, playerY);
  ctx.drawImage(cloverImage, clover.x, clover.y, CLOVER_SIZE, CLOVER_SIZE);
  if (!drawBehindClover) drawPlayer(playerX, playerY);

  function drawPlayer(px, py) {
    ctx.save();
    if (player.facing === "left") {
      ctx.translate(px + PLAYER_SIZE/2,0);
      ctx.scale(-1,1);
      ctx.drawImage(playerImage, -PLAYER_SIZE/2, py, PLAYER_SIZE, PLAYER_SIZE);
    } else {
      ctx.drawImage(playerImage, px, py, PLAYER_SIZE, PLAYER_SIZE);
    }
    ctx.restore();
  }

  // Tree top & plant
  ctx.drawImage(treeTopImage, 0, 0, MAP_WIDTH, MAP_HEIGHT);
  ctx.drawImage(plantImage, 0, 0, MAP_WIDTH, MAP_HEIGHT);

  // Dialogue overlays
  if (showHelperBotDialogue && helperBotDialogue.complete) drawDialogue(helperBotDialogue);
  if (showCloverDialogue && cloverDialogue.complete) drawDialogue(cloverDialogue);
  if (showLockedDoorDialogue && lockedDoorDialogue.complete) drawDialogue(lockedDoorDialogue);

  // Audio UI
  drawAudioUI();
}

function drawDialogue(img) {
  ctx.setTransform(1,0,0,1,0,0);
  const dw = canvas.width;
  const dh = dw * (img.height/img.width);
  ctx.drawImage(img, 0, canvas.height - dh, dw, dh);
}

  // Loop
function loop() {
  update();
  drawGame();
  requestAnimationFrame(loop);
}


loop();



