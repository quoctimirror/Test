/**
 * AvatarGenerator - Creates personalized avatar image for event participants
 * Generates a 1080x1920 image (Instagram/TikTok story ratio)
 */
import React, { useRef, useEffect, useCallback } from 'react';
import { getDiamondConfig } from '../../../constants/eventConstants';

// Background gradient presets - user can choose
export const AVATAR_BACKGROUNDS = [
  { id: 'pink', name: 'Hồng phấn', start: '#1a0a10', mid: '#B91C6B', end: '#fce4ec' },
  { id: 'purple', name: 'Tím hoàng hôn', start: '#0d0d2b', mid: '#4a1942', end: '#c9a5c9' },
  { id: 'midnight', name: 'Đêm huyền bí', start: '#1a1a2e', mid: '#16213e', end: '#e8d5e8' },
  { id: 'rose', name: 'Hoa hồng', start: '#2d132c', mid: '#801336', end: '#f6d5d5' },
  { id: 'galaxy', name: 'Thiên hà', start: '#0f0f23', mid: '#5c2751', end: '#f5e6e8' },
];

// Scenery presets - user can choose
export const AVATAR_SCENERIES = [
  { id: 'mountains', name: 'Núi non', icon: '🏔️' },
  { id: 'stars', name: 'Bầu trời sao', icon: '✨' },
  { id: 'flowers', name: 'Hoa lá', icon: '🌸' },
  { id: 'waves', name: 'Sóng biển', icon: '🌊' },
  { id: 'none', name: 'Không có', icon: '◯' },
];

// Scenery colors
const SCENERY_COLORS = ['#d4a5d4', '#c9a5c9', '#e8c5e8', '#f0d5f0'];

/**
 * Auto-generate background and scenery based on lightNumber and diamondShape
 * Uses deterministic algorithm so same input always produces same output
 */
const autoSelectBackground = (lightNumber, diamondShape) => {
  // Map diamond shapes to preferred backgrounds
  const diamondToBgPreference = {
    round: ['pink', 'rose'],
    oval: ['purple', 'galaxy'],
    pear: ['midnight', 'purple'],
    heart: ['rose', 'pink'],
    princess: ['galaxy', 'midnight'],
    emerald: ['midnight', 'purple'],
    marquise: ['purple', 'galaxy'],
  };

  const preferences = diamondToBgPreference[diamondShape] || ['pink'];
  const bgIndex = lightNumber % preferences.length;
  return preferences[bgIndex];
};

const autoSelectScenery = (lightNumber, diamondShape) => {
  // Map diamond shapes to preferred sceneries
  const diamondToSceneryPreference = {
    round: ['stars', 'flowers'],
    oval: ['waves', 'mountains'],
    pear: ['flowers', 'stars'],
    heart: ['flowers', 'stars'],
    princess: ['stars', 'mountains'],
    emerald: ['mountains', 'waves'],
    marquise: ['stars', 'waves'],
  };

  const preferences = diamondToSceneryPreference[diamondShape] || ['mountains'];
  const sceneryIndex = Math.floor(lightNumber / 2) % preferences.length;
  return preferences[sceneryIndex];
};

const AvatarGenerator = ({
  displayName,
  lightNumber,
  diamondShape,
  backgroundId = null, // If null, auto-generate
  sceneryId = null, // If null, auto-generate
  onGenerated,
}) => {
  const canvasRef = useRef(null);
  const config = getDiamondConfig(diamondShape);

  // Auto-select if not provided
  const finalBackgroundId = backgroundId || autoSelectBackground(lightNumber, diamondShape);
  const finalSceneryId = sceneryId || autoSelectScenery(lightNumber, diamondShape);

  // Seed random based on lightNumber for consistent scenery
  const seedRandom = useCallback((seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }, []);

  // Draw diamond shape
  const drawDiamond = useCallback(
    (ctx, x, y, size) => {
      const color = config?.color || '#E91E63';

      // Create gradient for diamond
      const gradient = ctx.createLinearGradient(
        x - size / 2,
        y - size / 2,
        x + size / 2,
        y + size / 2
      );
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, '#ffffff');
      gradient.addColorStop(1, color);

      ctx.beginPath();

      // Draw based on shape
      switch (diamondShape) {
        case 'heart':
          ctx.moveTo(x, y + size * 0.3);
          ctx.bezierCurveTo(x, y - size * 0.1, x - size * 0.5, y - size * 0.3, x - size * 0.5, y);
          ctx.bezierCurveTo(x - size * 0.5, y + size * 0.3, x, y + size * 0.5, x, y + size * 0.5);
          ctx.bezierCurveTo(x, y + size * 0.5, x + size * 0.5, y + size * 0.3, x + size * 0.5, y);
          ctx.bezierCurveTo(x + size * 0.5, y - size * 0.3, x, y - size * 0.1, x, y + size * 0.3);
          break;
        case 'oval':
          ctx.ellipse(x, y, size * 0.35, size * 0.5, 0, 0, Math.PI * 2);
          break;
        case 'pear':
          ctx.moveTo(x, y - size * 0.5);
          ctx.bezierCurveTo(x + size * 0.3, y - size * 0.3, x + size * 0.4, y + size * 0.1, x + size * 0.3, y + size * 0.4);
          ctx.bezierCurveTo(x + size * 0.1, y + size * 0.5, x - size * 0.1, y + size * 0.5, x - size * 0.3, y + size * 0.4);
          ctx.bezierCurveTo(x - size * 0.4, y + size * 0.1, x - size * 0.3, y - size * 0.3, x, y - size * 0.5);
          break;
        case 'princess':
          ctx.rect(x - size * 0.4, y - size * 0.4, size * 0.8, size * 0.8);
          break;
        case 'round':
          ctx.arc(x, y, size * 0.45, 0, Math.PI * 2);
          break;
        case 'emerald':
          ctx.moveTo(x - size * 0.3, y - size * 0.45);
          ctx.lineTo(x + size * 0.3, y - size * 0.45);
          ctx.lineTo(x + size * 0.45, y - size * 0.2);
          ctx.lineTo(x + size * 0.45, y + size * 0.2);
          ctx.lineTo(x + size * 0.3, y + size * 0.45);
          ctx.lineTo(x - size * 0.3, y + size * 0.45);
          ctx.lineTo(x - size * 0.45, y + size * 0.2);
          ctx.lineTo(x - size * 0.45, y - size * 0.2);
          ctx.closePath();
          break;
        case 'marquise':
          ctx.ellipse(x, y, size * 0.25, size * 0.5, 0, 0, Math.PI * 2);
          break;
        default:
          ctx.arc(x, y, size * 0.45, 0, Math.PI * 2);
      }

      ctx.fillStyle = gradient;
      ctx.fill();

      // Add sparkle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(x - size * 0.15, y - size * 0.15, size * 0.08, 0, Math.PI * 2);
      ctx.fill();

      // Add glow
      ctx.shadowColor = color;
      ctx.shadowBlur = 30;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
    },
    [diamondShape, config]
  );

  // Generate avatar
  const generateAvatar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    // Get selected background (auto-generated or provided)
    const bg = AVATAR_BACKGROUNDS.find((b) => b.id === finalBackgroundId) || AVATAR_BACKGROUNDS[0];

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, bg.start);
    gradient.addColorStop(0.5, bg.mid);
    gradient.addColorStop(1, bg.end);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw music staff lines (subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const y = height * 0.45 + i * 50;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw scenery based on selection (auto-generated or provided)
    const sceneryColor = SCENERY_COLORS[Math.floor(seedRandom(lightNumber + 1) * SCENERY_COLORS.length)];

    if (finalSceneryId === 'mountains') {
      // Draw mountains
      ctx.fillStyle = sceneryColor + '40';
      for (let i = 0; i < 3; i++) {
        const peakX = width * (0.2 + i * 0.3) + seedRandom(lightNumber + i * 10) * 100;
        const peakY = height * 0.25 + seedRandom(lightNumber + i * 20) * 100;
        ctx.beginPath();
        ctx.moveTo(peakX - 300, height * 0.6);
        ctx.lineTo(peakX, peakY);
        ctx.lineTo(peakX + 300, height * 0.6);
        ctx.fill();
      }
    } else if (finalSceneryId === 'stars') {
      // Draw stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 50; i++) {
        const starX = seedRandom(lightNumber + i * 7) * width;
        const starY = seedRandom(lightNumber + i * 13) * height * 0.6;
        const starSize = 1 + seedRandom(lightNumber + i * 17) * 3;
        ctx.beginPath();
        ctx.arc(starX, starY, starSize, 0, Math.PI * 2);
        ctx.fill();
      }
      // Draw some larger glowing stars
      for (let i = 0; i < 8; i++) {
        const starX = seedRandom(lightNumber + i * 23) * width;
        const starY = seedRandom(lightNumber + i * 29) * height * 0.5;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(starX, starY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(starX, starY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (finalSceneryId === 'flowers') {
      // Draw flower petals
      ctx.fillStyle = sceneryColor + '50';
      for (let i = 0; i < 20; i++) {
        const flowerX = seedRandom(lightNumber + i * 11) * width;
        const flowerY = height * 0.15 + seedRandom(lightNumber + i * 19) * height * 0.25;
        const petalSize = 20 + seedRandom(lightNumber + i * 23) * 30;
        // Draw 5 petals
        for (let p = 0; p < 5; p++) {
          const angle = (p / 5) * Math.PI * 2;
          const px = flowerX + Math.cos(angle) * petalSize * 0.5;
          const py = flowerY + Math.sin(angle) * petalSize * 0.5;
          ctx.beginPath();
          ctx.ellipse(px, py, petalSize * 0.3, petalSize * 0.5, angle, 0, Math.PI * 2);
          ctx.fill();
        }
        // Flower center
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(flowerX, flowerY, petalSize * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = sceneryColor + '50';
      }
      // Add floating petals
      ctx.fillStyle = sceneryColor + '30';
      for (let i = 0; i < 15; i++) {
        const petalX = seedRandom(lightNumber + i * 31) * width;
        const petalY = seedRandom(lightNumber + i * 37) * height * 0.7;
        ctx.beginPath();
        ctx.ellipse(petalX, petalY, 8, 15, seedRandom(lightNumber + i) * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (finalSceneryId === 'waves') {
      // Draw ocean waves
      ctx.strokeStyle = sceneryColor + '60';
      ctx.lineWidth = 3;
      for (let w = 0; w < 8; w++) {
        const waveY = height * 0.2 + w * 40;
        ctx.beginPath();
        ctx.moveTo(0, waveY);
        for (let x = 0; x < width; x += 20) {
          const y = waveY + Math.sin((x + seedRandom(lightNumber + w) * 100) / 50) * 15;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // Add foam dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 30; i++) {
        const foamX = seedRandom(lightNumber + i * 41) * width;
        const foamY = height * 0.18 + seedRandom(lightNumber + i * 43) * height * 0.2;
        ctx.beginPath();
        ctx.arc(foamX, foamY, 2 + seedRandom(lightNumber + i) * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // finalSceneryId === 'none' - don't draw any scenery

    // Draw diamond in center
    const diamondSize = 280;
    const diamondY = height * 0.5;
    drawDiamond(ctx, width / 2, diamondY, diamondSize);

    // Draw reflection
    ctx.globalAlpha = 0.3;
    ctx.save();
    ctx.translate(0, diamondY * 2 + 100);
    ctx.scale(1, -0.5);
    drawDiamond(ctx, width / 2, diamondY, diamondSize);
    ctx.restore();
    ctx.globalAlpha = 1;

    // Draw water ripple lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const rippleY = height * 0.72 + i * 30;
      ctx.beginPath();
      ctx.moveTo(width * 0.1, rippleY);
      ctx.bezierCurveTo(
        width * 0.3,
        rippleY + 5,
        width * 0.7,
        rippleY - 5,
        width * 0.9,
        rippleY
      );
      ctx.stroke();
    }

    // Draw name (cursive style)
    ctx.font = 'italic 72px serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'center';
    ctx.fillText(displayName, width / 2, height * 0.18);

    // Draw light number
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(`ÁNH SÁNG #${lightNumber}`, width / 2, height * 0.24);

    // Draw tagline
    ctx.font = '28px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('Ánh sáng của bạn là một phần của', width / 2, height * 0.82);
    ctx.fillText('Bản Giao Hưởng Kim Cương', width / 2, height * 0.86);

    // Draw logo
    ctx.font = 'bold 32px serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('MIRROR × Diamond', width / 2, height * 0.94);

    // Export
    const dataUrl = canvas.toDataURL('image/png');
    onGenerated?.(dataUrl);
  }, [displayName, lightNumber, diamondShape, finalBackgroundId, finalSceneryId, drawDiamond, seedRandom, onGenerated]);

  useEffect(() => {
    generateAvatar();
  }, [generateAvatar]);

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
