const canvas = document.getElementById("frutigermetro");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game State
let gameState = "game";

// World settings
const MAP_WIDTH = 9600; 
const MAP_HEIGHT = 960; 
const CAMERA_ZOOM = 1;  

function getWorldScale() {
  return canvas.height / MAP_HEIGHT;
}

// Player settings
const PLAYER_SCALE = 0.18;  
const ORIGINAL_SIZE = 2500; 
const PLAYER_SIZE = ORIGINAL_SIZE * PLAYER_SCALE;

const player = {
  x: PLAYER_SIZE / 2,
  y: MAP_HEIGHT - PLAYER_SIZE / 2 - 10, 
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
bgImage.src = "FrutigerMetro.png";

// Input
const keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// Audio state
let audioEnabled = true;
const AUDIO_ICON_SIZE = 20;
const AUDIO_ICON_X = 18;
const AUDIO_ICON_Y = 18;
const SONG_TITLE = "Perfume - Point (Instrumental)";

const bgMusic = new Audio("perfume_point.mp3");
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

// NPCs: Metro Bot & Melody
const CHARACTER_SIZE = 2500;

const METROBOT_SCALE = 0.18;
const MELODY_SCALE = 0.18;

const metroBot = {
  x: 1199,
  y: 460,
  width: CHARACTER_SIZE * METROBOT_SCALE,
  height: CHARACTER_SIZE * METROBOT_SCALE,
  img: new Image()
};
metroBot.img.src = "MetroBot.png";

const melody = {
  x: 3379,
  y: 460,
  width: CHARACTER_SIZE * MELODY_SCALE,
  height: CHARACTER_SIZE * MELODY_SCALE,
  img: new Image()
};
melody.img.src = "Melody.png";

// Dialogue images
const metroBotDialogue = new Image();
metroBotDialogue.src = "MetroBot_Dialogue.png";

const melodyDialogue = new Image();
melodyDialogue.src = "Melody_Dialogue.png";

// Dialogue flags
let showMetroBotDialogue = false;
let showMelodyDialogue = false;

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

  // Realm transition to Frutiger Aero
if (player.x >= MAP_WIDTH - half - 2) {
  window.location.href = "index_frutiger_aero.html";
}

  // Dialogue flags
  const hitbox = getPlayerHitbox();
  showMetroBotDialogue = checkCollision(hitbox, metroBot);
  showMelodyDialogue = checkCollision(hitbox, melody);
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
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const worldScale = getWorldScale();
  const viewW = canvas.width / worldScale;

// Camera
  let camX = player.x - viewW / 2;
  camX = Math.max(0, Math.min(MAP_WIDTH - viewW, camX));

  ctx.setTransform(
    worldScale, 0,
    0, worldScale,
    -camX * worldScale,
    0
  );

// Draw background
  ctx.drawImage(bgImage, 0, 0, MAP_WIDTH, MAP_HEIGHT);

// Draw NPCs
  ctx.drawImage(metroBot.img, metroBot.x, metroBot.y, metroBot.width, metroBot.height);
  ctx.drawImage(melody.img, melody.x, melody.y, melody.width, melody.height);

// Draw player
  const hop = Math.sin(player.walkTime) * 10;
  const playerX = player.x - PLAYER_SIZE / 2;
  const playerY = player.y - PLAYER_SIZE / 2 - hop;

  ctx.save();
  if (player.facing === "left") {
    ctx.translate(playerX + PLAYER_SIZE / 2, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(
      player.img,
      -PLAYER_SIZE / 2,
      playerY,
      PLAYER_SIZE,
      PLAYER_SIZE
    );
  } else {
    ctx.drawImage(
      player.img,
      playerX,
      playerY,
      PLAYER_SIZE,
      PLAYER_SIZE
    );
  }
  ctx.restore();

// Draw Audio UI
  drawAudioUI();

// Dialogues
  if (showMetroBotDialogue && metroBotDialogue.complete) {
    ctx.setTransform(1,0,0,1,0,0);
    const dw = canvas.width;
    const dh = dw * (metroBotDialogue.height / metroBotDialogue.width);
    ctx.drawImage(metroBotDialogue, 0, canvas.height - dh, dw, dh);
  }

  if (showMelodyDialogue && melodyDialogue.complete) {
    ctx.setTransform(1,0,0,1,0,0);
    const dw = canvas.width;
    const dh = dw * (melodyDialogue.height / melodyDialogue.width);
    ctx.drawImage(melodyDialogue, 0, canvas.height - dh, dw, dh);
  }
}

// Loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();

