/**
 * Orbit visualization utilities for Product Finder
 */

// Orbit radii configuration
export const ORBIT_RADII = {
  1: { rx: 333, ry: 56 },
  2: { rx: 539, ry: 80 },
  3: { rx: 821, ry: 113.5 },
};

// SVG viewbox constants
export const VIEWBOX = {
  WIDTH: 1700,
  HEIGHT: 280,
  CENTER_X: 850,
  CENTER_Y: 140,
};

/**
 * Calculate position on orbit ellipse
 * @param {number} orbit - Orbit level (1, 2, or 3)
 * @param {number} angleDeg - Angle in degrees
 * @returns {{ percentX: number, percentY: number }}
 */
export const getPositionOnOrbit = (orbit, angleDeg) => {
  const { rx, ry } = ORBIT_RADII[orbit];
  const angleRad = (angleDeg * Math.PI) / 180;
  const x = rx * Math.cos(angleRad);
  const y = ry * Math.sin(angleRad);
  const percentX = ((VIEWBOX.CENTER_X + x) / VIEWBOX.WIDTH) * 100;
  const percentY = ((VIEWBOX.CENTER_Y + y) / VIEWBOX.HEIGHT) * 100;
  return { percentX, percentY };
};

/**
 * Generate evenly distributed angles for items on orbit
 * @param {number} count - Number of items
 * @returns {number[]} Array of angles in degrees
 */
export const getOrbitAngles = (count) => {
  if (count <= 0) return [];
  const angles = [];
  const step = 360 / count;
  for (let i = 0; i < count; i++) {
    angles.push(i * step);
  }
  return angles;
};

/**
 * Find index of selected option in options array
 * @param {Array} options - Array of options
 * @param {string} selectionId - Selected option ID
 * @returns {number} Index or 0 if not found
 */
export const getIndexFromSelection = (options, selectionId) => {
  if (!options || !selectionId) return 0;
  const index = options.findIndex(opt => opt.id === selectionId);
  return index >= 0 ? index : 0;
};

/**
 * Step URL to index mapping
 */
export const STEP_MAP = {
  'choose-shape': 0,
  'choose-band': 1,
  'choose-sidestone': 2,
};

/**
 * Build product finder image path
 * @param {string} band - Band style ID
 * @param {string} mainStone - Main stone ID
 * @param {string} sideStone - Side stone ID
 * @returns {string} Image path
 */
export const buildImagePath = (band, mainStone, sideStone) => {
  return `/product-finder/a1_${band}_${mainStone}_${sideStone}.png`;
};
