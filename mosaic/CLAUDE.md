# Photo Tile Display - Architecture

## Structure
- **index.html** - Presentation layer (HTML structure + CSS styling)
- **mosaic-logic.js** - All application logic

## How It Works

### Core State
- `images[]` - All loaded image URLs (from folder upload)
- `currentImages[]` - Currently displayed images (tracks what's on screen)
- `tileCount` - Number of tiles to display (1-6)
- `currentInterval` - Milliseconds between image rotations

### Initialization Flow
1. User uploads folder of images via file input
2. `initTiles()` shuffles all images and picks first N unique ones
3. Creates N tile divs, assigns unique images as backgrounds
4. Starts interval timer to rotate images

### Image Rotation
- Every N seconds, `changeRandomTile()` fires
- Picks one random tile to update
- `getUniqueImage()` finds an image NOT currently displayed
- Updates that tile with new image

### Key Constraint
**No duplicate images on screen** (unless fewer images than tiles exist)
- Achieved by filtering `currentImages[]` when selecting new images
- Initial display uses shuffle + slice to guarantee uniqueness

### Controls
- Tile count slider: 1-6 tiles (re-initializes display on change)
- Interval number input: seconds between rotations (step=5)
- Toggle/hide controls button + 'h' keyboard shortcut
- Fullscreen button
