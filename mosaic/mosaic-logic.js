let images = [];
let currentImages = []; // Track what's currently displayed
let intervalId = null;
let currentInterval = 10000;
let tileCount = 3;

const fileInput = document.getElementById('fileInput');
const container = document.getElementById('container');
const tileSlider = document.getElementById('tileSlider');
const intervalInput = document.getElementById('intervalInput');
const tileCountDisplay = document.getElementById('tileCount');
const toggleBtn = document.getElementById('toggleControls');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const controls = document.getElementById('controls');

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
    if (images.length > 0) {
      initTiles();
    }
  }
});

toggleBtn.addEventListener('click', () => {
  controls.classList.toggle('hidden');
  toggleBtn.textContent = controls.classList.contains('hidden') ? 'Show Controls' : 'Hide Controls';
});

fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

function initTiles() {
  if (intervalId) clearInterval(intervalId);

  container.innerHTML = '';
  currentImages = [];

  // Create tiles with initial unique images
  for (let i = 0; i < tileCount; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.id = `tile${i}`;
    container.appendChild(tile);

    const imageUrl = getUniqueImage();
    tile.style.backgroundImage = `url(${imageUrl})`;
    currentImages.push(imageUrl);
  }

  // Start interval to change one random tile
  intervalId = setInterval(changeRandomTile, currentInterval);
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

  // Pick a random tile
  const tileIndex = Math.floor(Math.random() * tileCount);
  const tile = document.getElementById(`tile${tileIndex}`);

  // Get new unique image
  const newImage = getUniqueImage();

  // Update tracking and display
  currentImages[tileIndex] = newImage;
  tile.style.backgroundImage = `url(${newImage})`;
}

// Press 'h' to toggle controls
document.addEventListener('keydown', (e) => {
  if (e.key === 'h' || e.key === 'H') {
    controls.classList.toggle('hidden');
  }
});
