import * as THREE from 'three';

/**
 * Procedural PBR texture generators for realistic luxury roofing materials and modern architecture.
 * Features singleton caching for instant mobile performance and zero GC stutter.
 * Uses Three.js SRGBColorSpace and high-contrast PBR bump/roughness maps.
 */

let cachedAsphalt: { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } | null = null;
let cachedMetal: { map: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture } | null = null;
let cachedTile: { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } | null = null;
let cachedFlatTPO: { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } | null = null;
let cachedLimestone: { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } | null = null;
let cachedCedarWood: { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } | null = null;

/**
 * 1. Architectural Slate Charcoal Shingles
 * Deep, multi-tonal dimensional shingle tabs with pronounced shadow lines and ceramic granule noise.
 */
export function createAsphaltShingleTexture(): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  if (cachedAsphalt) return cachedAsphalt;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bumpCtx = bumpCanvas.getContext('2d')!;

  // Deep architectural dark slate base
  ctx.fillStyle = '#1e242c';
  ctx.fillRect(0, 0, 512, 512);

  bumpCtx.fillStyle = '#505050';
  bumpCtx.fillRect(0, 0, 512, 512);

  const rowHeight = 64;
  const tabWidth = 128;

  for (let y = 0; y < 512; y += rowHeight) {
    const isOdd = (y / rowHeight) % 2 === 1;
    const offsetX = isOdd ? tabWidth / 2 : 0;

    for (let x = -tabWidth; x < 512 + tabWidth; x += tabWidth) {
      const actualX = x + offsetX;

      // Rich architectural tab variations (charcoal, deep pewter, dark flint)
      const rVal = 32 + Math.floor(Math.random() * 18);
      const gVal = 38 + Math.floor(Math.random() * 18);
      const bVal = 48 + Math.floor(Math.random() * 20);

      ctx.fillStyle = `rgb(${rVal}, ${gVal}, ${bVal})`;
      ctx.fillRect(actualX + 2, y + 2, tabWidth - 4, rowHeight - 6);

      // Deep dark drop shadow below each shingle row for heavy 3D dimension
      ctx.fillStyle = 'rgba(8, 10, 14, 0.9)';
      ctx.fillRect(actualX, y + rowHeight - 6, tabWidth, 6);

      // Subtle top edge highlight (beveled sun reflection)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.fillRect(actualX + 2, y + 2, tabWidth - 4, 2);

      // Bump map grooves
      bumpCtx.fillStyle = '#A0A0A0';
      bumpCtx.fillRect(actualX + 2, y + 2, tabWidth - 4, rowHeight - 6);
      bumpCtx.fillStyle = '#101010';
      bumpCtx.fillRect(actualX, y + rowHeight - 6, tabWidth, 6);
    }
  }

  // Heavy mineral granule noise
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const bumpData = bumpCtx.getImageData(0, 0, 512, 512);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 40;
    imgData.data[i] = Math.min(255, Math.max(0, imgData.data[i] + noise));
    imgData.data[i + 1] = Math.min(255, Math.max(0, imgData.data[i + 1] + noise));
    imgData.data[i + 2] = Math.min(255, Math.max(0, imgData.data[i + 2] + noise));

    const bumpNoise = (Math.random() - 0.5) * 50;
    bumpData.data[i] = Math.min(255, Math.max(0, bumpData.data[i] + bumpNoise));
    bumpData.data[i + 1] = bumpData.data[i];
    bumpData.data[i + 2] = bumpData.data[i];
  }
  ctx.putImageData(imgData, 0, 0);
  bumpCtx.putImageData(bumpData, 0, 0);

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);
  map.colorSpace = THREE.SRGBColorSpace;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2, 2);

  cachedAsphalt = { map, bumpMap };
  return cachedAsphalt;
}

/**
 * 2. Modern Standing Seam Metal
 * Sleek metallic dark midnight navy/slate with sharp raised seams and brushed specular highlights.
 */
export function createStandingSeamTexture(): { map: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture } {
  if (cachedMetal) return cachedMetal;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 512;
  roughCanvas.height = 512;
  const roughCtx = roughCanvas.getContext('2d')!;

  // Deep architectural steel finish
  ctx.fillStyle = '#141c26';
  ctx.fillRect(0, 0, 512, 512);

  roughCtx.fillStyle = '#404c5c';
  roughCtx.fillRect(0, 0, 512, 512);

  // Standing seams spaced every 64 pixels
  const panelWidth = 64;
  for (let x = 0; x < 512; x += panelWidth) {
    // Sharp metal bevel highlight on left
    ctx.fillStyle = 'rgba(210, 230, 255, 0.7)';
    ctx.fillRect(x, 0, 3, 512);

    // Raised 1.5" standing seam cap
    ctx.fillStyle = '#0a1017';
    ctx.fillRect(x + 3, 0, 4.5, 512);

    // Hard cast shadow on right side of seam
    ctx.fillStyle = 'rgba(2, 4, 7, 0.85)';
    ctx.fillRect(x + 7.5, 0, 7, 512);

    // Mirror specular strip in roughness map
    roughCtx.fillStyle = '#0a0d12';
    roughCtx.fillRect(x, 0, 14, 512);
  }

  // Brushed aluminum fine grain striations
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < 90; i++) {
    const rx = Math.random() * 512;
    ctx.fillRect(rx, 0, 1 + Math.random() * 2, 512);
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);
  map.colorSpace = THREE.SRGBColorSpace;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(2, 2);

  cachedMetal = { map, roughnessMap };
  return cachedMetal;
}

/**
 * 3. Spanish & Mediterranean Clay S-Tile
 * Rich burnt orange / terracotta with cylindrical barrel gradients and deep shadow channels.
 */
export function createClayTileTexture(): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  if (cachedTile) return cachedTile;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bumpCtx = bumpCanvas.getContext('2d')!;

  // Deep baked terracotta ground
  ctx.fillStyle = '#9e3f22';
  ctx.fillRect(0, 0, 512, 512);

  bumpCtx.fillStyle = '#404040';
  bumpCtx.fillRect(0, 0, 512, 512);

  const tileWidth = 64;
  const tileHeight = 80;

  for (let y = 0; y < 512; y += tileHeight) {
    for (let x = 0; x < 512; x += tileWidth) {
      // Sculpted 3D barrel curve gradient
      const grad = ctx.createLinearGradient(x, 0, x + tileWidth, 0);
      grad.addColorStop(0, '#581b0a');
      grad.addColorStop(0.2, '#aa4223');
      grad.addColorStop(0.5, '#e46e45');
      grad.addColorStop(0.8, '#9c381c');
      grad.addColorStop(1, '#441407');

      ctx.fillStyle = grad;
      ctx.fillRect(x + 1.5, y + 2, tileWidth - 3, tileHeight - 6);

      // Deep horizontal lap shadow underneath
      ctx.fillStyle = 'rgba(25, 8, 3, 0.85)';
      ctx.fillRect(x, y + tileHeight - 8, tileWidth, 8);

      // Cylindrical normal bump
      const bumpGrad = bumpCtx.createLinearGradient(x, 0, x + tileWidth, 0);
      bumpGrad.addColorStop(0, '#101010');
      bumpGrad.addColorStop(0.5, '#FFFFFF');
      bumpGrad.addColorStop(1, '#101010');
      bumpCtx.fillStyle = bumpGrad;
      bumpCtx.fillRect(x + 1.5, y + 2, tileWidth - 3, tileHeight - 6);
    }
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2.5, 2.5);
  map.colorSpace = THREE.SRGBColorSpace;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2.5, 2.5);

  cachedTile = { map, bumpMap };
  return cachedTile;
}

/**
 * 4. Architectural Flat TPO Commercial Membrane
 * Cool slate-pewter waterproof membrane with dark thermal weld seams and ballast texture.
 * Eliminates washed-out plain white box look.
 */
export function createFlatTPOTexture(): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  if (cachedFlatTPO) return cachedFlatTPO;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bumpCtx = bumpCanvas.getContext('2d')!;

  // Modern architectural light slate/pewter membrane (not blinding bleached white)
  ctx.fillStyle = '#8f9da9';
  ctx.fillRect(0, 0, 512, 512);

  bumpCtx.fillStyle = '#808080';
  bumpCtx.fillRect(0, 0, 512, 512);

  // Heat welded seam lines every 128px
  const seamSpacing = 128;
  for (let x = seamSpacing; x < 512; x += seamSpacing) {
    // Dark thermal weld bead
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();

    // Weld highlight
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 2.5, 0);
    ctx.lineTo(x - 2.5, 512);
    ctx.stroke();

    // Bump seam
    bumpCtx.fillStyle = '#202020';
    bumpCtx.fillRect(x - 2, 0, 4, 512);
  }

  // Fine textured matte roller noise
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const bumpData = bumpCtx.getImageData(0, 0, 512, 512);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 20;
    imgData.data[i] = Math.min(255, Math.max(0, imgData.data[i] + noise));
    imgData.data[i + 1] = Math.min(255, Math.max(0, imgData.data[i + 1] + noise));
    imgData.data[i + 2] = Math.min(255, Math.max(0, imgData.data[i + 2] + noise));

    const bNoise = (Math.random() - 0.5) * 30;
    bumpData.data[i] = Math.min(255, Math.max(0, bumpData.data[i] + bNoise));
    bumpData.data[i + 1] = bumpData.data[i];
    bumpData.data[i + 2] = bumpData.data[i];
  }
  ctx.putImageData(imgData, 0, 0);
  bumpCtx.putImageData(bumpData, 0, 0);

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);
  map.colorSpace = THREE.SRGBColorSpace;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2, 2);

  cachedFlatTPO = { map, bumpMap };
  return cachedFlatTPO;
}

/**
 * 5. Modern Austin Limestone Ashlar Masonry
 * Warm stone blocks with crisp mortar joints and natural mineral striations.
 */
export function createWallTexture(): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  if (cachedLimestone) return cachedLimestone;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bumpCtx = bumpCanvas.getContext('2d')!;

  // Warm limestone base
  ctx.fillStyle = '#b8aea0';
  ctx.fillRect(0, 0, 512, 512);

  bumpCtx.fillStyle = '#808080';
  bumpCtx.fillRect(0, 0, 512, 512);

  const blockHeight = 48;
  const blockWidth = 128;

  for (let y = 0; y < 512; y += blockHeight) {
    const isOdd = (y / blockHeight) % 2 === 1;
    const offsetX = isOdd ? blockWidth / 2 : 0;

    for (let x = -blockWidth; x < 512 + blockWidth; x += blockWidth) {
      const actualX = x + offsetX;

      // Subtle natural stone shade variance
      const tone = Math.floor(Math.random() * 24);
      ctx.fillStyle = `rgb(${190 + tone}, ${182 + tone}, ${170 + tone})`;
      ctx.fillRect(actualX + 2, y + 2, blockWidth - 4, blockHeight - 4);

      // Deep recessed mortar channels
      ctx.fillStyle = '#6e6456';
      ctx.fillRect(actualX, y + blockHeight - 3, blockWidth, 3);
      ctx.fillRect(actualX + blockWidth - 3, y, 3, blockHeight);

      // Bump grooves
      bumpCtx.fillStyle = '#A0A0A0';
      bumpCtx.fillRect(actualX + 2, y + 2, blockWidth - 4, blockHeight - 4);
      bumpCtx.fillStyle = '#1A1A1A';
      bumpCtx.fillRect(actualX, y + blockHeight - 3, blockWidth, 3);
      bumpCtx.fillRect(actualX + blockWidth - 3, y, 3, blockHeight);
    }
  }

  // Surface texture noise
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const bumpData = bumpCtx.getImageData(0, 0, 512, 512);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 24;
    imgData.data[i] = Math.min(255, Math.max(0, imgData.data[i] + noise));
    imgData.data[i + 1] = Math.min(255, Math.max(0, imgData.data[i + 1] + noise));
    imgData.data[i + 2] = Math.min(255, Math.max(0, imgData.data[i + 2] + noise));

    const bNoise = (Math.random() - 0.5) * 35;
    bumpData.data[i] = Math.min(255, Math.max(0, bumpData.data[i] + bNoise));
    bumpData.data[i + 1] = bumpData.data[i];
    bumpData.data[i + 2] = bumpData.data[i];
  }
  ctx.putImageData(imgData, 0, 0);
  bumpCtx.putImageData(bumpData, 0, 0);

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);
  map.colorSpace = THREE.SRGBColorSpace;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2, 2);

  cachedLimestone = { map, bumpMap };
  return cachedLimestone;
}

/**
 * 6. Luxury Architectural Western Red Cedar Siding
 * Rich amber-caramel horizontal wood planks for upper floors and modern cantilevers.
 */
export function createCedarWoodTexture(): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  if (cachedCedarWood) return cachedCedarWood;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bumpCtx = bumpCanvas.getContext('2d')!;

  // Warm rich cedar base
  ctx.fillStyle = '#6b371b';
  ctx.fillRect(0, 0, 512, 512);

  bumpCtx.fillStyle = '#808080';
  bumpCtx.fillRect(0, 0, 512, 512);

  const plankHeight = 24;

  for (let y = 0; y < 512; y += plankHeight) {
    const tone = Math.floor(Math.random() * 20);
    ctx.fillStyle = `rgb(${130 + tone}, ${65 + tone}, ${28 + Math.floor(tone * 0.7)})`;
    ctx.fillRect(0, y + 1.5, 512, plankHeight - 3);

    // Dark shadow reveal groove between planks
    ctx.fillStyle = 'rgba(20, 8, 4, 0.9)';
    ctx.fillRect(0, y + plankHeight - 2, 512, 2);

    // Bump groove
    bumpCtx.fillStyle = '#A0A0A0';
    bumpCtx.fillRect(0, y + 1.5, 512, plankHeight - 3);
    bumpCtx.fillStyle = '#101010';
    bumpCtx.fillRect(0, y + plankHeight - 2, 512, 2);
  }

  // Fine wood grain horizontal lines
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let i = 0; i < 120; i++) {
    const py = Math.random() * 512;
    ctx.fillRect(0, py, 512, 1);
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);
  map.colorSpace = THREE.SRGBColorSpace;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2, 2);

  cachedCedarWood = { map, bumpMap };
  return cachedCedarWood;
}
