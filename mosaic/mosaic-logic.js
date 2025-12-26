let images = [];
let currentImages = []; // Track what's currently displayed
let intervalId = null;
let currentInterval = 10000;
let tileCount = 3;
let fillType = 'fill';
let isPaused = false;
let lastChangedTileIndex = -1;

const fileInput = document.getElementById('fileInput');
const container = document.getElementById('container');
const tileSlider = document.getElementById('tileSlider');
const intervalInput = document.getElementById('intervalInput');
const tileCountDisplay = document.getElementById('tileCount');
const toggleBtn = document.getElementById('toggleControls');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const controls = document.getElementById('controls');
const fillTypeSelect = document.getElementById('fillTypeSelect');
const pausePlayBtn = document.getElementById('pausePlayBtn');
const restoreBtn = document.getElementById('restoreBtn');

fileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
  images = files.map(f => URL.createObjectURL(f));

  if (images.length > 0) {
    initTiles();
  }
});

tileSlider.addEventListener('input', (e) => {
  tileCount = parseInt(e.target.value);
  tileCountDisplay.textContent = tileCount;
  if (images.length > 0) {
    initTiles();
  }
});

intervalInput.addEventListener('change', (e) => {
  const value = parseInt(e.target.value);
  if (value > 0) {
    currentInterval = value * 1000;
    // Restart the interval with new timing (don't re-roll images)
    if (!isPaused && intervalId) {
      clearInterval(intervalId);
      intervalId = setInterval(changeRandomTile, currentInterval);
    }
  }
});

toggleBtn.addEventListener('click', () => {
  controls.classList.add('minimized');
});

restoreBtn.addEventListener('click', () => {
  controls.classList.remove('minimized');
});

fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

fillTypeSelect.addEventListener('change', (e) => {
  fillType = e.target.value;

  // Apply to all existing tiles
  const tiles = document.querySelectorAll('.tile');
  tiles.forEach(tile => {
    tile.classList.remove('fill', 'fit');
    tile.classList.add(fillType);
  });
});

pausePlayBtn.addEventListener('click', () => {
  if (isPaused) {
    // Resume
    isPaused = false;
    pausePlayBtn.textContent = 'Pause';
    if (images.length > 0) {
      intervalId = setInterval(changeRandomTile, currentInterval);
    }
  } else {
    // Pause
    isPaused = true;
    pausePlayBtn.textContent = 'Play';
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
});

function initTiles() {
  if (intervalId) clearInterval(intervalId);

  container.innerHTML = '';
  currentImages = [];
  lastChangedTileIndex = -1; // Reset last changed tile

  // Create tiles with initial unique images
  for (let i = 0; i < tileCount; i++) {
    const tile = document.createElement('div');
    tile.className = `tile ${fillType}`;
    tile.id = `tile${i}`;
    container.appendChild(tile);

    const imageUrl = getUniqueImage();
    tile.style.backgroundImage = `url(${imageUrl})`;
    currentImages.push(imageUrl);
  }

  // Start interval to change one random tile (only if not paused)
  if (!isPaused) {
    intervalId = setInterval(changeRandomTile, currentInterval);
  }
}

function getUniqueImage() {
  // Get images not currently displayed
  const available = images.filter(img => !currentImages.includes(img));

  // If we have available unique images, use one
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }

  // Otherwise fall back to any random image
  return images[Math.floor(Math.random() * images.length)];
}

function changeRandomTile() {
  if (images.length === 0 || tileCount === 0) return;

  // Pick a random tile (but not the same one as last time, if possible)
  let tileIndex;
  if (tileCount === 1) {
    tileIndex = 0;
  } else {
    // Create array of available tile indices (excluding the last changed one)
    const availableIndices = [];
    for (let i = 0; i < tileCount; i++) {
      if (i !== lastChangedTileIndex) {
        availableIndices.push(i);
      }
    }
    tileIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  }

  lastChangedTileIndex = tileIndex;
  const tile = document.getElementById(`tile${tileIndex}`);

  // Get new unique image
  const newImage = getUniqueImage();

  // Fade out
  tile.style.opacity = '0';

  // Wait for fade out, then change image and fade in
  setTimeout(() => {
    currentImages[tileIndex] = newImage;
    tile.style.backgroundImage = `url(${newImage})`;

    // Fade in
    tile.style.opacity = '1';
  }, 500); // Match the CSS transition duration
}

// Press 'h' to toggle controls
document.addEventListener('keydown', (e) => {
  if (e.key === 'h' || e.key === 'H') {
    controls.classList.toggle('minimized');
  }
});
