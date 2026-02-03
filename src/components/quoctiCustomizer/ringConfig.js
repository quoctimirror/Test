// Ring Customizer Configuration
// Diamond-Head compatibility rules using Set for O(1) lookup

// List of Diamonds (10 types)
export const diamonds = [
  { id: 1, name: "Round", icon: "round" },
  { id: 2, name: "Princess", icon: "princess" },
  { id: 3, name: "Radiant", icon: "radiant" },
  { id: 4, name: "Emerald", icon: "emerald" },
  { id: 5, name: "Marquise", icon: "marquise" },
  { id: 6, name: "Oval", icon: "oval" },
  { id: 7, name: "Pear", icon: "pear" },
  { id: 8, name: "Heart", icon: "heart" },
  { id: 9, name: "Asscher", icon: "asscher" },
  { id: 10, name: "Cushion", icon: "cushion" },
];

// List of Heads (15 types)
export const heads = [
  { id: 1, name: "4-Prong Nouveau", icon: "4-prong" },
  { id: 2, name: "6-Prong Nouveau", icon: "6-prong" },
  { id: 3, name: "Classic Basket", icon: "classic-basket" },
  { id: 4, name: "Diamond Basket", icon: "diamond-basket" },
  { id: 5, name: "Surprise Diamond", icon: "surprise-diamond" },
  { id: 6, name: "6 Prong Diamond", icon: "6-prong-diamond" },
  { id: 7, name: "Diamond Tulip", icon: "diamond-tulip" },
  { id: 8, name: "Classic Halo", icon: "classic-halo" },
  { id: 9, name: "Floral Halo", icon: "floral-halo" },
  { id: 10, name: "Hidden Halo", icon: "hidden-halo" },
  { id: 11, name: "Dual Halo", icon: "dual-halo" },
  { id: 12, name: "Fancy Halo", icon: "fancy-halo" },
  { id: 13, name: "Clustered Diamond", icon: "clustered-diamond" },
  { id: 14, name: "Vintage Trefoil", icon: "vintage-trefoil" },
  { id: 15, name: "Classic Bezel", icon: "classic-bezel" },
];

// List of Bands (15 types) - compatible with all
export const bands = [
  { id: 1, name: "Solitaire", icon: "solitaire" },
  { id: 2, name: "Knife Edge Solitaire", icon: "knife-edge" },
  { id: 3, name: "Split Ring Solitaire", icon: "split-ring" },
  { id: 4, name: "French Pavé", icon: "french-pave" },
  { id: 5, name: "Cathedral Pavé", icon: "cathedral-pave" },
  { id: 6, name: "Triple Row Pavé", icon: "triple-row" },
  { id: 7, name: "Round Channel", icon: "round-channel" },
  { id: 8, name: "Baguette Channel", icon: "baguette-channel" },
  { id: 9, name: "Floating Station", icon: "floating-station" },
  { id: 10, name: "Alternating Marquise", icon: "alt-marquise" },
  { id: 11, name: "Three Stone", icon: "three-stone" },
  { id: 12, name: "Knife Edge Pavé", icon: "knife-edge-pave" },
  { id: 13, name: "Floral Bypass", icon: "floral-bypass" },
  { id: 14, name: "Twist Pavé", icon: "twist-pave" },
  { id: 15, name: "Alternating Baguette", icon: "alt-baguette" },
];

// Set of valid Diamond-Head pairs (format: "diamondId-headId")
// Method 3: Store in Set for O(1) lookup
export const validDiamondHeadPairs = new Set([
  // Diamond 1 (Round) - compatible with all 15 heads
  "1-1", "1-2", "1-3", "1-4", "1-5", "1-6", "1-7", "1-8", "1-9", "1-10", "1-11", "1-12", "1-13", "1-14", "1-15",

  // Diamond 2 (Princess) - compatible with 1,3,4,5,7,8,9,10,11,13,15
  "2-1", "2-3", "2-4", "2-5", "2-7", "2-8", "2-9", "2-10", "2-11", "2-13", "2-15",

  // Diamond 3 (Radiant) - compatible with 1,3,4,5,7,8,9,10,11,13,15
  "3-1", "3-3", "3-4", "3-5", "3-7", "3-8", "3-9", "3-10", "3-11", "3-13", "3-15",

  // Diamond 4 (Emerald) - compatible with 1,3,4,5,7,8,9,10,11,13,15
  "4-1", "4-3", "4-4", "4-5", "4-7", "4-8", "4-9", "4-10", "4-11", "4-13", "4-15",

  // Diamond 5 (Marquise) - compatible with 2,3,4,5,6,7,8,9,10,11,13,15 (derived from Head rules)
  "5-2", "5-3", "5-4", "5-5", "5-6", "5-7", "5-8", "5-9", "5-10", "5-11", "5-13", "5-15",

  // Diamond 6 (Oval) - compatible with all 15 heads
  "6-1", "6-2", "6-3", "6-4", "6-5", "6-6", "6-7", "6-8", "6-9", "6-10", "6-11", "6-12", "6-13", "6-14", "6-15",

  // Diamond 7 (Pear) - compatible with 2,3,4,5,6,7,8,9,10,11,13,15 (derived from Head rules)
  "7-2", "7-3", "7-4", "7-5", "7-6", "7-7", "7-8", "7-9", "7-10", "7-11", "7-13", "7-15",

  // Diamond 8 (Heart) - compatible with 1,5,7,8,10,13,15
  "8-1", "8-5", "8-7", "8-8", "8-10", "8-13", "8-15",

  // Diamond 9 (Asscher) - compatible with 1,3,4,5,7,8,9,10,11,13,14,15
  "9-1", "9-3", "9-4", "9-5", "9-7", "9-8", "9-9", "9-10", "9-11", "9-13", "9-14", "9-15",

  // Diamond 10 (Cushion) - compatible with 1,3,4,5,7,8,9,10,11,12,13,14,15
  "10-1", "10-3", "10-4", "10-5", "10-7", "10-8", "10-9", "10-10", "10-11", "10-12", "10-13", "10-14", "10-15",
]);

// Helper functions

/**
 * Check if Diamond-Head pair is valid
 */
export function isValidPair(diamondId, headId) {
  return validDiamondHeadPairs.has(`${diamondId}-${headId}`);
}

/**
 * Get list of valid Head IDs for a Diamond
 */
export function getValidHeadsForDiamond(diamondId) {
  return heads.filter(head => isValidPair(diamondId, head.id)).map(h => h.id);
}

/**
 * Get list of valid Diamond IDs for a Head
 */
export function getValidDiamondsForHead(headId) {
  return diamonds.filter(diamond => isValidPair(diamond.id, headId)).map(d => d.id);
}

/**
 * Get list of disabled Head IDs for a Diamond
 */
export function getDisabledHeadsForDiamond(diamondId) {
  return heads.filter(head => !isValidPair(diamondId, head.id)).map(h => h.id);
}

/**
 * Get list of disabled Diamond IDs for a Head
 */
export function getDisabledDiamondsForHead(headId) {
  return diamonds.filter(diamond => !isValidPair(diamond.id, headId)).map(d => d.id);
}

/**
 * Create key for ring image: d{diamondId}h{headId}b{bandId}
 */
export function getRingImageKey(diamondId, headId, bandId) {
  return `d${diamondId}h${headId}b${bandId}`;
}

// Default selection
export const defaultSelection = {
  diamond: 1,
  head: 1,
  band: 1,
};
