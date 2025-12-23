const canvas = document.getElementById("frutigeraero");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game State
let gameState = "game";

// World settings
const MAP_WIDTH = 9000; 
const MAP_HEIGHT = 1440; 
const CAMERA_ZOOM = 1; 

function getBackgroundScale() {
  return canvas.height / MAP_HEIGHT;
}

// Player settings
const PLAYER_SCALE = 0.27;  
const ORIGINAL_SIZE = 2500;
const PLAYER_SIZE = ORIGINAL_SIZE * PLAYER_SCALE;

const player = {
  x: PLAYER_SIZE / 2,
  y: MAP_HEIGHT - PLAYER_SIZE * 0.45, 
  speed: 2.5,
  walkTime: 0,
  facing: "right",
  img: null
};

// Load player images
const playerSprite = new Image();

// Fallback
const savedSprite = localStorage.getItem("selectedPlayerSprite") || "Player_1.png";

playerSprite.src = savedSprite;
player.img = playerSprite;

// Background
const bgImage = new Image();
bgImage.src = "FrutigerAero.png";

// Input
const keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// Audio state
let audioEnabled = true;
const AUDIO_ICON_SIZE = 20;
const AUDIO_ICON_X = 18;
const AUDIO_ICON_Y = 18;
const SONG_TITLE = "alyzea - crystal settings";

const bgMusic = new Audio("alyzea_crystal_settings.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.6;

const audioOnIcon = new Image();
audioOnIcon.src = "audio_on_white.png";

const audioOffIcon = new Image();
audioOffIcon.src = "audio_off_white.png";

let audioStarted = false;
function startAudioIfNotStarted() {
    if (!audioStarted && audioEnabled) {
        bgMusic.play().catch(() => {});
        audioStarted = true;
    }
}
window.addEventListener("keydown", startAudioIfNotStarted);
window.addEventListener("mousedown", startAudioIfNotStarted);

// Audio toggle handling
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

// NPCs: Aero Bot & Mist
const CHARACTER_SIZE = 2500;

const AEROBOT_SCALE = 0.27;
const MIST_SCALE = 0.27;
const aeroBot = {
  x: 2026,
  y: 650,
  width: CHARACTER_SIZE * AEROBOT_SCALE,
  height: CHARACTER_SIZE * AEROBOT_SCALE,
  img: new Image()
};
aeroBot.img.src = "AeroBot.png";

const mist = {
  x: 6175,
  y: 600,
  width: CHARACTER_SIZE * MIST_SCALE,
  height: CHARACTER_SIZE * MIST_SCALE,
  img: new Image()
};
mist.img.src = "Mist.png";

// Dialogue images
const aeroBotDialogue = new Image();
aeroBotDialogue.src = "AeroBot_Dialogue.png";
const mistDialogue = new Image();
mistDialogue.src = "Mist_Dialogue.png";

// Dialogue flags
let showAeroBotDialogue = false;
let showMistDialogue = false;

// Helper collision check
function checkCollision(rect, character) {
  return (
    rect.x < character.x + character.width &&
    rect.x + rect.width > character.x &&
    rect.y < character.y + character.height &&
    rect.y + rect.height > character.y
  );
}

// Player hitbox
function getPlayerHitbox() {
  return {
    x: player.x - PLAYER_SIZE * 0.2,
    y: player.y - PLAYER_SIZE * 0.1,
    width: PLAYER_SIZE * 0.4,
    height: PLAYER_SIZE * 0.9
  };
}

// Update
function update() {
  let dx = 0;
  if (keys["a"]) dx -= 1;
  if (keys["d"]) dx += 1;

  if (dx !== 0) dx /= Math.hypot(dx);

  player.x += dx * player.speed;

  if (dx < 0) player.facing = "left";
  if (dx > 0) player.facing = "right";

  if (dx !== 0) player.walkTime += 0.15;
  else player.walkTime = 0;

  const half = PLAYER_SIZE / 2;
  player.x = Math.max(half, Math.min(MAP_WIDTH - half, player.x));

   // Realm transition to Lobby
if (player.x >= MAP_WIDTH - half - 2) {
  window.location.href = "index_lobby.html";
}


  // Dialogue flags
  const hitbox = getPlayerHitbox();
  showAeroBotDialogue = checkCollision(hitbox, aeroBot);
  showMistDialogue = checkCollision(hitbox, mist);
}

// Draw Audio UI
function drawAudioUI() {
  ctx.setTransform(1,0,0,1,0,0);
  const icon = audioEnabled ? audioOnIcon : audioOffIcon;
  ctx.drawImage(icon, AUDIO_ICON_X, AUDIO_ICON_Y, AUDIO_ICON_SIZE, AUDIO_ICON_SIZE);

  if (audioEnabled) {
    ctx.font = "14px 'Press Start 2P'";
    ctx.fillStyle = "#ffffffff";
    ctx.textAlign = "left";
    ctx.fillText(SONG_TITLE, AUDIO_ICON_X + 40, AUDIO_ICON_Y + 18);
  }
}

// Draw
function draw() {
    const worldScale = getBackgroundScale();
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Camera
  const viewW = canvas.width;
const scaledWorldWidth = MAP_WIDTH * worldScale;

let camX = player.x * worldScale - viewW / 2;
camX = Math.max(0, Math.min(scaledWorldWidth - viewW, camX));
ctx.setTransform(1, 0, 0, 1, -camX, 0);

  // Draw background
  const bgScale = getBackgroundScale();
const scaledWidth = MAP_WIDTH * worldScale;
const scaledHeight = canvas.height;

ctx.drawImage(
  bgImage,
  0,
  0,
  MAP_WIDTH,
  MAP_HEIGHT,
  0,
  0,
  scaledWidth,
  scaledHeight
);

  // Draw NPCs
  ctx.drawImage(
  aeroBot.img,
  aeroBot.x * worldScale,
  aeroBot.y * worldScale,
  aeroBot.width * worldScale,
  aeroBot.height * worldScale
);

ctx.drawImage(
  mist.img,
  mist.x * worldScale,
  mist.y * worldScale,
  mist.width * worldScale,
  mist.height * worldScale
);

  // Draw player
  const hop = Math.sin(player.walkTime) * 10 * worldScale;

const scaledPlayerSize = PLAYER_SIZE * worldScale;
const playerX = player.x * worldScale - scaledPlayerSize / 2;
const PLAYER_Y_OFFSET = 325;

const playerY =
  player.y - PLAYER_SIZE / 2 - hop - PLAYER_Y_OFFSET;

ctx.save();
if (player.facing === "left") {
  ctx.translate(playerX + scaledPlayerSize / 2, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(
    player.img,
    -scaledPlayerSize / 2,
    playerY,
    scaledPlayerSize,
    scaledPlayerSize
  );
} else {
  ctx.drawImage(
    player.img,
    playerX,
    playerY,
    scaledPlayerSize,
    scaledPlayerSize
  );
}
ctx.restore();


  drawAudioUI();

  // Dialogue
  if (showAeroBotDialogue && aeroBotDialogue.complete) {
    ctx.setTransform(1,0,0,1,0,0);
    const dw = canvas.width;
    const dh = dw * (aeroBotDialogue.height / aeroBotDialogue.width);
    ctx.drawImage(aeroBotDialogue, 0, canvas.height - dh, dw, dh);
  }

  if (showMistDialogue && mistDialogue.complete) {
    ctx.setTransform(1,0,0,1,0,0);
    const dw = canvas.width;
    const dh = dw * (mistDialogue.height / mistDialogue.width);
    ctx.drawImage(mistDialogue, 0, canvas.height - dh, dw, dh);
  }
}


// Loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
