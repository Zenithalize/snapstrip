import type {
  FrameItem,
  LayoutConfig,
  BackgroundConfig,
  FilterId,
  StripMeta,
  Sticker,
} from '../types/photobooth';
import { getFilterCss } from './filters';

// Default layout config (800x1200 at 1x, scaled 2x to 1600x2400 for crisp high-dpi render)
export const DEFAULT_LAYOUT: LayoutConfig = {
  cols: 2,
  rows: 3,
  frameWidth: 360,
  frameHeight: 270,
  gap: 20,
  padding: 40,
  borderRadius: 14,
  canvasWidth: 800,
  canvasHeight: 1200,
};

// Polyfill for roundRect on CanvasRenderingContext2D if missing
function drawRoundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}

// Render background onto Canvas context
function renderBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bg: BackgroundConfig
) {
  ctx.save();

  if (bg.type === 'holographic') {
    // Iridescent sheen: linear + conic diagonal sheen
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0.0, '#ffafbd'); // Pastel Pink
    grad.addColorStop(0.2, '#ffc3a0'); // Soft Peach
    grad.addColorStop(0.4, '#b9fbc0'); // Mint Light
    grad.addColorStop(0.6, '#9bf6ff'); // Aqua Light
    grad.addColorStop(0.8, '#c084fc'); // Soft Lavender
    grad.addColorStop(1.0, '#ffafbd'); // Pink repeat
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle overlay diagonal shimmer rays
    ctx.globalCompositeOperation = 'overlay';
    const shimmer = ctx.createLinearGradient(0, 0, width, 0);
    shimmer.addColorStop(0.0, 'rgba(255, 255, 255, 0.4)');
    shimmer.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
    shimmer.addColorStop(1.0, 'rgba(255, 255, 255, 0.4)');
    ctx.fillStyle = shimmer;
    ctx.fillRect(0, 0, width, height);
  } else if (bg.type === 'lace') {
    ctx.fillStyle = '#fce4ec'; // Soft Pink
    ctx.fillRect(0, 0, width, height);

    // Draw delicate heart/dot pattern overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    const spacing = 36;
    for (let x = 18; x < width; x += spacing) {
      for (let y = 18; y < height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (bg.type === 'starry') {
    ctx.fillStyle = '#0d1b2a'; // Deep Dark Night
    ctx.fillRect(0, 0, width, height);

    // Draw sparkling star dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    const seed = [
      [120, 100], [400, 150], [700, 80], [1400, 200], [300, 600],
      [1200, 800], [200, 1400], [1500, 1600], [600, 2100], [1300, 2300]
    ];
    seed.forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();

      // Tiny cross shimmer
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx - 8, sy); ctx.lineTo(sx + 8, sy);
      ctx.moveTo(sx, sy - 8); ctx.lineTo(sx, sy + 8);
      ctx.stroke();
    });
  } else if (bg.type === 'mint') {
    ctx.fillStyle = '#f0fff4'; // Mint Cream
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = bg.color || '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}

// Helper to load image element from dataUrl
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Main Compose function
 * Returns a high-resolution HTMLCanvasElement (1600x2400 for crispness)
 */
export async function composeStrip(
  frames: FrameItem[],
  layout: LayoutConfig = DEFAULT_LAYOUT,
  background: BackgroundConfig = { type: 'holographic' },
  filterId: FilterId = 'none',
  meta: StripMeta = { date: new Date().toLocaleDateString(), font: 'Caveat', textColor: '#2d1b69' },
  stickers: Sticker[] = [],
  scaleFactor: number = 2 // 2x high dpi render
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const width = layout.canvasWidth * scaleFactor;
  const height = layout.canvasHeight * scaleFactor;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context');

  // 1. Render Background
  renderBackground(ctx, width, height, background);

  // Scaled dimensions
  const padding = layout.padding * scaleFactor;
  const gap = layout.gap * scaleFactor;
  const frameW = layout.frameWidth * scaleFactor;
  const frameH = layout.frameHeight * scaleFactor;
  const radius = layout.borderRadius * scaleFactor;
  const filterCss = getFilterCss(filterId);

  // 2. Render Frames (2x3 grid)
  const totalSlots = layout.cols * layout.rows;
  for (let slotIndex = 0; slotIndex < totalSlots; slotIndex++) {
    const col = slotIndex % layout.cols;
    const row = Math.floor(slotIndex / layout.cols);

    const x = padding + col * (frameW + gap);
    const y = padding + row * (frameH + gap);

    const frameItem = frames[slotIndex];

    ctx.save();

    // Set rounded rectangle clip path
    drawRoundRectPath(ctx, x, y, frameW, frameH, radius);
    ctx.clip();

    if (!frameItem || frameItem.isBlank) {
      // Draw white/soft placeholder frame
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x, y, frameW, frameH);

      // Draw faint camera icon / placeholder text
      ctx.fillStyle = '#cbd5e1';
      ctx.font = `600 ${20 * scaleFactor}px 'Nunito', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Shot ${slotIndex + 1}`, x + frameW / 2, y + frameH / 2);
    } else {
      try {
        const img = await loadImage(frameItem.dataUrl);

        ctx.save();

        // Apply mirror transform if requested
        if (frameItem.mirrored) {
          ctx.translate(x + frameW, y);
          ctx.scale(-1, 1);
          ctx.translate(-x, -y);
        }

        // Apply filter preset
        if (filterCss !== 'none') {
          ctx.filter = filterCss;
        }

        // Object-fit: cover calculation
        const imgRatio = img.width / img.height;
        const frameRatio = frameW / frameH;

        let drawW = frameW;
        let drawH = frameH;
        let offsetX = 0;
        let offsetY = 0;

        if (imgRatio > frameRatio) {
          drawH = frameH;
          drawW = frameH * imgRatio;
          offsetX = (frameW - drawW) / 2;
        } else {
          drawW = frameW;
          drawH = frameW / imgRatio;
          offsetY = (frameH - drawH) / 2;
        }

        ctx.drawImage(img, x + offsetX, y + offsetY, drawW, drawH);

        ctx.restore();
      } catch (e) {
        console.warn(`Failed to render frame ${slotIndex}:`, e);
        ctx.fillStyle = '#fee2e2';
        ctx.fillRect(x, y, frameW, frameH);
      }
    }

    // Restore clip state
    ctx.restore();

    // 3. Draw thin white inner border inside frame clip
    ctx.save();
    drawRoundRectPath(ctx, x, y, frameW, frameH, radius);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 4 * scaleFactor;
    ctx.stroke();
    ctx.restore();
  }

  // 4. Render Stickers using relative percentage coordinates (xPercent, yPercent)
  for (const sticker of stickers) {
    ctx.save();
    const sx = ((sticker.xPercent ?? 50) / 100) * width;
    const sy = ((sticker.yPercent ?? 50) / 100) * height;

    ctx.translate(sx, sy);
    ctx.rotate(((sticker.rotation || 0) * Math.PI) / 180);

    const baseStickerSize = 90 * scaleFactor * (sticker.scale || 1.0);

    try {
      const stickerImg = await loadImage(sticker.src);
      ctx.drawImage(
        stickerImg,
        -baseStickerSize / 2,
        -baseStickerSize / 2,
        baseStickerSize,
        baseStickerSize
      );
    } catch {
      // Ignore
    }

    ctx.restore();
  }

  // 5. Render Footer Area
  const footerY = height - padding / 1.5;

  ctx.save();

  // Determine text contrast color based on background
  const textColor = meta.textColor || (background.type === 'starry' ? '#ffffff' : '#2d1b69');

  // Left side: Date + Time
  ctx.fillStyle = textColor;
  ctx.font = `600 ${14 * scaleFactor}px 'DM Sans', sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(meta.date, padding, footerY);

  // Right side: Watermark "SnapStrip"
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = textColor;
  ctx.font = `800 ${14 * scaleFactor}px 'Nunito', sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('SnapStrip', width - padding, footerY);
  ctx.restore();

  // Center: Custom Text Overlay Line (up to 30 chars)
  if (meta.label && meta.label.trim().length > 0) {
    const fontName = meta.font === 'Caveat' ? "'Caveat', cursive" : meta.font === 'Playfair Display' ? "'Playfair Display', serif" : "'Space Mono', monospace";
    ctx.fillStyle = textColor;
    ctx.font = `700 ${22 * scaleFactor}px ${fontName}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(meta.label.trim().slice(0, 30), width / 2, footerY);
  }

  ctx.restore();

  return canvas;
}
