/**
 * AvatarGenerator - Creates personalized avatar image for event participants
 * Generates a 2500x4462 image by compositing layers from generatedImages folder
 *
 * Layer order (bottom to top):
 * 1. Mountain (background)
 * 2. Grass
 * 3. Flowers
 * 4. Moon
 * 5. Music
 * 6. Diamond (based on user's selected shape)
 * 7. Subheading
 * + Text overlay (user name + light number)
 *
 * Each image already has correct transparency and positioning built-in.
 * Just draw them in order at full canvas size (2500x4462).
 */
import React, { useRef, useEffect, useCallback, useState } from 'react';

// Import mountain images
import mountain1 from '@/assets/images/dmm/generatedImages/1_mountains/mountain-1@2500x.webp';
import mountain2 from '@/assets/images/dmm/generatedImages/1_mountains/mountain-2@2500x.webp';
import mountain3 from '@/assets/images/dmm/generatedImages/1_mountains/mountain-3@2500x.webp';
import mountain4 from '@/assets/images/dmm/generatedImages/1_mountains/mountain-4@2500x.webp';
import mountain5 from '@/assets/images/dmm/generatedImages/1_mountains/mountain-5@2500x.webp';
import mountain6 from '@/assets/images/dmm/generatedImages/1_mountains/mountain-6@2500x.webp';
import mountain7 from '@/assets/images/dmm/generatedImages/1_mountains/mountain-7@2500x.webp';
import mountain8 from '@/assets/images/dmm/generatedImages/1_mountains/mountain-8@2500x.webp';
import mountain9 from '@/assets/images/dmm/generatedImages/1_mountains/mountain-9@2500x.webp';
import mountain10 from '@/assets/images/dmm/generatedImages/1_mountains/mountain-10@2500x.webp';

// Import grass images
import grass1 from '@/assets/images/dmm/generatedImages/2_grass/grass-1.webp';
import grass2 from '@/assets/images/dmm/generatedImages/2_grass/grass-2.webp';
import grass3 from '@/assets/images/dmm/generatedImages/2_grass/grass-3.webp';
import grass4 from '@/assets/images/dmm/generatedImages/2_grass/grass-4.webp';
import grass5 from '@/assets/images/dmm/generatedImages/2_grass/grass-5.webp';
import grass6 from '@/assets/images/dmm/generatedImages/2_grass/grass-6.webp';
import grass7 from '@/assets/images/dmm/generatedImages/2_grass/grass-7.webp';
import grass8 from '@/assets/images/dmm/generatedImages/2_grass/grass-8.webp';
import grass9 from '@/assets/images/dmm/generatedImages/2_grass/grass-9.webp';
import grass10 from '@/assets/images/dmm/generatedImages/2_grass/grass-10.webp';

// Import flower images
import flowers1 from '@/assets/images/dmm/generatedImages/3_flowers/flowers-1.webp';
import flowers2 from '@/assets/images/dmm/generatedImages/3_flowers/flowers-2.webp';
import flowers3 from '@/assets/images/dmm/generatedImages/3_flowers/flowers-3.webp';
import flowers4 from '@/assets/images/dmm/generatedImages/3_flowers/flowers-4.webp';
import flowers5 from '@/assets/images/dmm/generatedImages/3_flowers/flowers-5.webp';
import flowers6 from '@/assets/images/dmm/generatedImages/3_flowers/flowers-6.webp';
import flowers7 from '@/assets/images/dmm/generatedImages/3_flowers/flowers-7.webp';
import flowers8 from '@/assets/images/dmm/generatedImages/3_flowers/flowers-8.webp';
import flowers9 from '@/assets/images/dmm/generatedImages/3_flowers/flowers-9.webp';
import flowers10 from '@/assets/images/dmm/generatedImages/3_flowers/flowers-10.webp';

// Import moon images
import moon1 from '@/assets/images/dmm/generatedImages/4_moons/moon-1.webp';
import moon2 from '@/assets/images/dmm/generatedImages/4_moons/moon-2.webp';
import moon3 from '@/assets/images/dmm/generatedImages/4_moons/moon-3.webp';
import moon4 from '@/assets/images/dmm/generatedImages/4_moons/moon-4.webp';
import moon5 from '@/assets/images/dmm/generatedImages/4_moons/moon-5.webp';
import moon6 from '@/assets/images/dmm/generatedImages/4_moons/moon-6.webp';
import moon7 from '@/assets/images/dmm/generatedImages/4_moons/moon-7.webp';
import moon8 from '@/assets/images/dmm/generatedImages/4_moons/moon-8.webp';
import moon9 from '@/assets/images/dmm/generatedImages/4_moons/moon-9.webp';
import moon10 from '@/assets/images/dmm/generatedImages/4_moons/moon-10.webp';
import moon11 from '@/assets/images/dmm/generatedImages/4_moons/moon-11.webp';

// Import music (only one version)
import music from '@/assets/images/dmm/generatedImages/5_music/music.webp';

// Import diamond images - mapped to shape names
import heart1 from '@/assets/images/dmm/generatedImages/6_diamonds/heart/heart-1_1@2500x.webp';
import heart2 from '@/assets/images/dmm/generatedImages/6_diamonds/heart/heart-2@2500x.webp';
import heart3 from '@/assets/images/dmm/generatedImages/6_diamonds/heart/heart-3@2500x.webp';
import round1 from '@/assets/images/dmm/generatedImages/6_diamonds/round/round-1.webp';
import round2 from '@/assets/images/dmm/generatedImages/6_diamonds/round/round-2.webp';
import round3 from '@/assets/images/dmm/generatedImages/6_diamonds/round/round-3.webp';
import emerald1 from '@/assets/images/dmm/generatedImages/6_diamonds/emerald/emerald-1.webp';
import emerald2 from '@/assets/images/dmm/generatedImages/6_diamonds/emerald/emerald-2.webp';
import emerald3 from '@/assets/images/dmm/generatedImages/6_diamonds/emerald/emerald-3.webp';
import marquise1 from '@/assets/images/dmm/generatedImages/6_diamonds/marquise/marquise-1.webp';
import marquise2 from '@/assets/images/dmm/generatedImages/6_diamonds/marquise/marquise-2.webp';
import marquise3 from '@/assets/images/dmm/generatedImages/6_diamonds/marquise/marquise-3.webp';
import oval1 from '@/assets/images/dmm/generatedImages/6_diamonds/oval/oval-1.webp';
import oval2 from '@/assets/images/dmm/generatedImages/6_diamonds/oval/oval-2.webp';
import oval3 from '@/assets/images/dmm/generatedImages/6_diamonds/oval/oval-3.webp';
import pear1 from '@/assets/images/dmm/generatedImages/6_diamonds/pear/pear-1.webp';
import pear2 from '@/assets/images/dmm/generatedImages/6_diamonds/pear/pear-2.webp';
import pear3 from '@/assets/images/dmm/generatedImages/6_diamonds/pear/pear-3.webp';
import asscher1 from '@/assets/images/dmm/generatedImages/6_diamonds/asscher/asscher-1.webp';
import asscher2 from '@/assets/images/dmm/generatedImages/6_diamonds/asscher/asscher-2.webp';
import asscher3 from '@/assets/images/dmm/generatedImages/6_diamonds/asscher/asscher-3.webp';

// Import subheading
import subheading from '@/assets/images/dmm/generatedImages/7_subheading/subheading.webp';

// Image collections
const MOUNTAINS = [mountain1, mountain2, mountain3, mountain4, mountain5, mountain6, mountain7, mountain8, mountain9, mountain10];
const GRASS = [grass1, grass2, grass3, grass4, grass5, grass6, grass7, grass8, grass9, grass10];
const FLOWERS = [flowers1, flowers2, flowers3, flowers4, flowers5, flowers6, flowers7, flowers8, flowers9, flowers10];
const MOONS = [moon1, moon2, moon3, moon4, moon5, moon6, moon7, moon8, moon9, moon10, moon11];

// Diamond images mapped to shape names from user selection
const DIAMONDS = {
  heart: [heart1, heart2, heart3],
  round: [round1, round2, round3],
  emerald: [emerald1, emerald2, emerald3],
  marquise: [marquise1, marquise2, marquise3],
  oval: [oval1, oval2, oval3],
  pear: [pear1, pear2, pear3],
  princess: [asscher1, asscher2, asscher3], // princess = asscher
};

// Helper to load image
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Seeded random for consistent results per user
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const AvatarGenerator = ({
  displayName,
  lightNumber,
  diamondShape,
  onGenerated,
}) => {
  const canvasRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const hasGenerated = useRef(false);

  const generateAvatar = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || isGenerating || hasGenerated.current) return;

    setIsGenerating(true);
    hasGenerated.current = true;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGenerating(false);
      return;
    }

    // Canvas size matches the layer images
    const width = 2500;
    const height = 4462;
    canvas.width = width;
    canvas.height = height;

    try {
      // Use lightNumber as seed for unique combination per user
      const seed = lightNumber || 1;

      // Select random image from each category based on seed
      const mountainIndex = Math.floor(seededRandom(seed) * MOUNTAINS.length);
      const grassIndex = Math.floor(seededRandom(seed + 1) * GRASS.length);
      const flowersIndex = Math.floor(seededRandom(seed + 2) * FLOWERS.length);
      const moonIndex = Math.floor(seededRandom(seed + 3) * MOONS.length);
      const diamondVariantIndex = Math.floor(seededRandom(seed + 4) * 3);

      // Get diamond images based on user's selected shape
      const diamondImages = DIAMONDS[diamondShape] || DIAMONDS.heart;

      // Load all layer images in parallel
      const [mountainImg, grassImg, flowersImg, moonImg, musicImg, diamondImg, subheadingImg] = await Promise.all([
        loadImage(MOUNTAINS[mountainIndex]),
        loadImage(GRASS[grassIndex]),
        loadImage(FLOWERS[flowersIndex]),
        loadImage(MOONS[moonIndex]),
        loadImage(music),
        loadImage(diamondImages[diamondVariantIndex]),
        loadImage(subheading),
      ]);

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw layers in order at original size (0, 0)
      // Each image already has correct position/transparency built-in
      // Layer 1: Mountain (background)
      ctx.drawImage(mountainImg, 0, 0);

      // Layer 2: Grass
      ctx.drawImage(grassImg, 0, 0);

      // Layer 3: Flowers
      ctx.drawImage(flowersImg, 0, 0);

      // Layer 4: Moon
      ctx.drawImage(moonImg, 0, 0);

      // Layer 5: Music
      ctx.drawImage(musicImg, 0, 0);

      // Layer 6: Diamond (user's selected shape)
      ctx.drawImage(diamondImg, 0, 0);

      // Layer 7: Subheading
      ctx.drawImage(subheadingImg, 0, 0);

      // Layer 8: Text overlay - User name only
      // Position at 18% from top (same as original local code)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'italic 160px Georgia, "Times New Roman", serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;
      ctx.fillText(displayName || 'Guest', width / 2, height * 0.14);
      ctx.shadowBlur = 0;

      // Export as PNG
      const dataUrl = canvas.toDataURL('image/png');
      onGenerated?.(dataUrl);
    } catch (error) {
      console.error('Error generating avatar:', error);
      hasGenerated.current = false;
    } finally {
      setIsGenerating(false);
    }
  }, [displayName, lightNumber, diamondShape, onGenerated, isGenerating]);

  useEffect(() => {
    generateAvatar();
  }, [generateAvatar]);

  // Reset when props change to allow regeneration
  useEffect(() => {
    hasGenerated.current = false;
  }, [displayName, lightNumber, diamondShape]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'none' }}
      aria-hidden="true"
    />
  );
};

// Download helper
export const downloadAvatar = (dataUrl, filename) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
};

export default AvatarGenerator;
