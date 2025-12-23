const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game State
let gameState = "menu";
let transitionAlpha = 0;
let logoFloatTime = 0;
let logoFade = 0;
let showHelperBotDialogue = false;

// Footer
let footerFade = 0;
const footerText = "Created by Cindy Hoang Nguyen in 2025. www.cindyhoangdesign.com";
const footerURL = "https://cindyhoangdesign.com/";

// Audio state
let audioEnabled = true;
const AUDIO_ICON_SIZE = 20;
const AUDIO_ICON_X = 18;
const AUDIO_ICON_Y = 18;
const SONG_TITLE = "alyzea - home menu";

// Assets
const menuBackground = new Image();
menuBackground.src = "LoadingScreen_FrutigerAero.png";

const bgMusic = new Audio("alyzea_home_menu.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.6;

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

const logoImage = new Image();
logoImage.src = "Aeroscape_Logo.png";

const helperBotDialogue = new Image();
helperBotDialogue.src = "HelperBot_Dialogue.png";

const cloverImage = new Image();
cloverImage.src = "Clover.png";

const cloverDialogue = new Image();
cloverDialogue.src = "Clover_Dialogue.png";

const lockedDoorDialogue = new Image();
lockedDoorDialogue.src = "LockedDoor.png";

const playerSprites = [];
for (let i = 1; i <= 6; i++) {
  const img = new Image();
  img.src = `Player_${i}.png`;
  playerSprites.push(img);
}

const playerImage = new Image();

let assetsLoaded = 0;
const ASSETS_TO_LOAD = 
  1 + // menu background
  1 + // audio on icon
  1 + // audio off icon
  1 + // map
  1 + // tree top
  1 + // plant
  1 + // logo
  1 + // helper bot dialogue
  1 + // clover 
  1 + // clover dialogue
  1 + // locked door dialogue
  playerSprites.length;

function assetLoaded() {
  assetsLoaded++;
  if (assetsLoaded === ASSETS_TO_LOAD) {
    requestAnimationFrame(loop);
  }
}

menuBackground.onload = assetLoaded;
audioOnIcon.onload = assetLoaded;
audioOffIcon.onload = assetLoaded;
mapImage.onload = assetLoaded;
treeTopImage.onload = assetLoaded;
plantImage.onload = assetLoaded;
logoImage.onload = assetLoaded;
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
  x: MAP_WIDTH / 2,
  y: MAP_HEIGHT - PLAYER_SIZE / 2 - 10,
  speed: 6,
  walkTime: 0,
  facing: "right"
};

// Input
const keys = {};
window.addEventListener("keydown", e => { keys[e.key.toLowerCase()] = true; });
window.addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });

// Collisions
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
  { x: 4400, y: 1100, width: 275, height: 450 }, // blue door
  { x: 1498, y: 200,  width: 375, height: 525 } // green door
];

let showLockedDoorDialogue = false;

const frutigerMetroDoor = {
  x: 3124,
  y: 170,
  width: 375,
  height: 525
};

// Menu Characters
const menuCharacters = [];

function buildCharacterGrid() {
  menuCharacters.length = 0;
  const cols = 3;
  const rows = 2;
  const size = 200;
  const spacing = 40;
  const totalWidth = cols * size + (cols - 1) * spacing;
  const startX = canvas.width / 2 - totalWidth / 2;
  const startY = canvas.height / 2 - 65;
  let index = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      menuCharacters.push({
        img: playerSprites[index],
        x: startX + c * (size + spacing),
        y: startY + r * (size + spacing),
        size,
        index
      });
      index++;
    }
  }
}
buildCharacterGrid();

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

canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  // Audio toggle
  if (
    mouseX >= AUDIO_ICON_X &&
    mouseX <= AUDIO_ICON_X + AUDIO_ICON_SIZE &&
    mouseY >= AUDIO_ICON_Y &&
    mouseY <= AUDIO_ICON_Y + AUDIO_ICON_SIZE
  ) {
    audioEnabled = !audioEnabled;
    if (audioEnabled) {
      bgMusic.play().catch(() => {});
    } else {
      bgMusic.pause();
    }
    return;
  }

  if (gameState !== "menu") return;

  // Character select
  for (const char of menuCharacters) {
    if (
      mouseX >= char.x &&
      mouseX <= char.x + char.size &&
      mouseY >= char.y &&
      mouseY <= char.y + char.size
    ) {
      playerImage.src = char.img.src;
      localStorage.setItem("selectedPlayerSprite", char.img.src);
      gameState = "transition";
    }
  }

  // Footer link
  ctx.font = "14px 'Press Start 2P'";
  const textWidth = ctx.measureText(footerText).width;
  if (
    mouseX >= 20 &&
    mouseX <= 20 + textWidth &&
    mouseY >= canvas.height - 34 &&
    mouseY <= canvas.height - 20
  ) {
    window.open(footerURL, "_blank");
  }
});

// Audio UI
function drawAudioUI() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const icon = audioEnabled ? audioOnIcon : audioOffIcon;
  ctx.drawImage(icon, AUDIO_ICON_X, AUDIO_ICON_Y, AUDIO_ICON_SIZE, AUDIO_ICON_SIZE);

  if (audioEnabled) {
    ctx.font = "14px 'Press Start 2P'";
    ctx.fillStyle = "#1db8c7";
    ctx.textAlign = "left";
    ctx.fillText(SONG_TITLE, AUDIO_ICON_X + 40, AUDIO_ICON_Y + 18);
  }
}

// Clover settings
const CLOVER_SCALE = 0.3;
const CLOVER_SIZE = 2500 * CLOVER_SCALE;
const clover = {
  x: 894,
  y: 750,
  width: CLOVER_SIZE,
  height: CLOVER_SIZE
};

// Clover hitbox 
const cloverHitbox = {
  x: clover.x + CLOVER_SIZE * 0.38,
  y: clover.y + CLOVER_SIZE * 0.8, 
  width: CLOVER_SIZE * 0.6,
  height: CLOVER_SIZE * 0.3
};

const helperBotArea = { x: 4200, y: 1750, width: 200, height: 550 };

let showCloverDialogue = false;

function update() {
  if (gameState === "menu") {
    logoFloatTime += 0.02;
    logoFade = Math.min(1, logoFade + 0.02);
    return;
  }
  if (gameState === "transition") {
    transitionAlpha += 0.05;
    if (transitionAlpha >= 1) gameState = "game";
    return;
  }
  if (gameState !== "game") return;

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
  if (!isColliding(getPlayerHitbox(nextX, player.y))) player.x = nextX;
  const nextY = player.y + dy * player.speed;
  if (!isColliding(getPlayerHitbox(player.x, nextY))) player.y = nextY;

  const half = PLAYER_SIZE / 2;
  player.x = Math.max(half, Math.min(MAP_WIDTH - half, player.x));
  player.y = Math.max(half, Math.min(MAP_HEIGHT - half, player.y));

  const playerHitbox = getPlayerHitbox(player.x, player.y);

  if (
  playerHitbox.x < frutigerMetroDoor.x + frutigerMetroDoor.width &&
  playerHitbox.x + playerHitbox.width > frutigerMetroDoor.x &&
  playerHitbox.y < frutigerMetroDoor.y + frutigerMetroDoor.height &&
  playerHitbox.y + playerHitbox.height > frutigerMetroDoor.y
) {
  window.location.href = "index_frutiger_metro.html";
}


  // Helper bot dialogue
  showHelperBotDialogue =
    playerHitbox.x < helperBotArea.x + helperBotArea.width &&
    playerHitbox.x + playerHitbox.width > helperBotArea.x &&
    playerHitbox.y < helperBotArea.y + helperBotArea.height &&
    playerHitbox.y + playerHitbox.height > helperBotArea.y;

  // Clover dialogue
  showCloverDialogue =
    playerHitbox.x < cloverHitbox.x + cloverHitbox.width &&
    playerHitbox.x + playerHitbox.width > cloverHitbox.x &&
    playerHitbox.y < cloverHitbox.y + cloverHitbox.height &&
    playerHitbox.y + playerHitbox.height > cloverHitbox.y;

// Locked door dialogue
  showLockedDoorDialogue = lockedDoorAreas.some(area =>
    playerHitbox.x < area.x + area.width &&
    playerHitbox.x + playerHitbox.width > area.x &&
    playerHitbox.y < area.y + area.height &&
    playerHitbox.y + playerHitbox.height > area.y
  );
}

// Draw Menu
function drawMenu() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(menuBackground, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(230, 244, 255, 0.9)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const logoWidth = 600;
  const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
  const floatOffset = Math.sin(logoFloatTime) * 10;
  const logoX = canvas.width / 2 - logoWidth / 2;
  const logoY = 18 + floatOffset;

  ctx.save();
  ctx.globalAlpha = logoFade;
  ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
  ctx.restore();

  ctx.fillStyle = "#1db8c7";
  ctx.font = "20px 'Press Start 2P'";
  ctx.textAlign = "center";
  ctx.fillText("Select Your Character", canvas.width / 2, 330);

  const CHARACTER_HOVER_SCALE = 1.06;
  menuCharacters.forEach(c => {
    const isHover =
      mouseX >= c.x &&
      mouseX <= c.x + c.size &&
      mouseY >= c.y &&
      mouseY <= c.y + c.size;
    ctx.save();
    if (isHover) {
      ctx.translate(c.x + c.size / 2, c.y + c.size / 2);
      ctx.scale(CHARACTER_HOVER_SCALE, CHARACTER_HOVER_SCALE);
      ctx.drawImage(c.img, -c.size / 2, -c.size / 2, c.size, c.size);
    } else {
      ctx.drawImage(c.img, c.x, c.y, c.size, c.size);
    }
    ctx.restore();
  });

  drawAudioUI();

// Controls text
ctx.save();
ctx.font = "14px 'Press Start 2P'";
ctx.fillStyle = "#1db8c7";
ctx.textAlign = "right";
ctx.fillText(
  "Controls: WASD to move",
  canvas.width - 18, 35
);
ctx.restore();

  footerFade = Math.min(1, footerFade + 0.02);
  ctx.save();
  ctx.globalAlpha = footerFade;
  ctx.font = "11px 'Press Start 2P'";
  ctx.fillStyle = "#1db8c7";
  ctx.textAlign = "left";
  ctx.fillText(footerText, 20, canvas.height - 20);
  ctx.restore();

  if (gameState === "transition") {
    ctx.fillStyle = `rgba(0,0,0,${transitionAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}
// Draw Game
function drawGame() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Camera
 const viewW = canvas.width / CAMERA_ZOOM;
  const viewH = canvas.height / CAMERA_ZOOM;
  let camX = player.x - viewW / 2;
  let camY = player.y - viewH / 2;
  camX = Math.max(0, Math.min(MAP_WIDTH - viewW, camX));
  camY = Math.max(0, Math.min(MAP_HEIGHT - viewH, camY));

  ctx.setTransform(CAMERA_ZOOM, 0, 0, CAMERA_ZOOM, -camX * CAMERA_ZOOM, -camY * CAMERA_ZOOM);

  // Draw world
  ctx.drawImage(mapImage, 0, 0, MAP_WIDTH, MAP_HEIGHT);

 const hop = Math.sin(player.walkTime) * 10;
  const playerX = player.x - PLAYER_SIZE / 2;
  const playerY = player.y - PLAYER_SIZE / 2 - hop;


// Depth sorting with Clover
const drawPlayerBehindClover = player.y < 1125;

if (drawPlayerBehindClover) {
  ctx.save();
  if (player.facing === "left") {
    ctx.translate(playerX + PLAYER_SIZE / 2, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(playerImage, -PLAYER_SIZE / 2, playerY, PLAYER_SIZE, PLAYER_SIZE);
  } else {
    ctx.drawImage(playerImage, playerX, playerY, PLAYER_SIZE, PLAYER_SIZE);
  }
  ctx.restore();
}

ctx.drawImage(cloverImage, clover.x, clover.y, CLOVER_SIZE, CLOVER_SIZE);


if (!drawPlayerBehindClover) {
  ctx.save();
  if (player.facing === "left") {
    ctx.translate(playerX + PLAYER_SIZE / 2, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(playerImage, -PLAYER_SIZE / 2, playerY, PLAYER_SIZE, PLAYER_SIZE);
  } else {
    ctx.drawImage(playerImage, playerX, playerY, PLAYER_SIZE, PLAYER_SIZE);
  }
  ctx.restore();
}

  ctx.drawImage(treeTopImage, 0, 0, MAP_WIDTH, MAP_HEIGHT);
  ctx.drawImage(plantImage, 0, 0, MAP_WIDTH, MAP_HEIGHT);


    // Helper bot dialogue overlay
  if (showHelperBotDialogue && helperBotDialogue.complete) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const dialogueWidth = canvas.width;
    const dialogueHeight = dialogueWidth * (helperBotDialogue.height / helperBotDialogue.width);
    ctx.drawImage(helperBotDialogue, 0, canvas.height - dialogueHeight, dialogueWidth, dialogueHeight);
  }

  // Clover dialogue overlay
  if (showCloverDialogue && cloverDialogue.complete) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const dialogueWidth = canvas.width;
    const dialogueHeight = dialogueWidth * (cloverDialogue.height / cloverDialogue.width);
    ctx.drawImage(cloverDialogue, 0, canvas.height - dialogueHeight, dialogueWidth, dialogueHeight);
  }

  // Locked door dialogue overlay
if (showLockedDoorDialogue && lockedDoorDialogue.complete) {
  ctx.setTransform(1,0,0,1,0,0); // reset camera
  const dialogueWidth = canvas.width; // span full width
  const dialogueHeight = dialogueWidth * (lockedDoorDialogue.height / lockedDoorDialogue.width); // keep aspect ratio
  ctx.drawImage(lockedDoorDialogue, 0, canvas.height - dialogueHeight, dialogueWidth, dialogueHeight);
}
drawAudioUI();
}

// Loop
function loop() {
  update();
  if (gameState === "menu" || gameState === "transition") drawMenu();
  else drawGame();
  requestAnimationFrame(loop);
}




