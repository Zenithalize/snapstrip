import { describe, it, expect } from 'vitest';
import { composeStrip, DEFAULT_LAYOUT } from '../utils/canvasCompose';

describe('Canvas Compose Engine', () => {
  it('has correct default layout dimensions for 2x3 photobooth strip', () => {
    expect(DEFAULT_LAYOUT.cols).toBe(2);
    expect(DEFAULT_LAYOUT.rows).toBe(3);
    expect(DEFAULT_LAYOUT.canvasWidth).toBe(800);
    expect(DEFAULT_LAYOUT.canvasHeight).toBe(1200);
    expect(DEFAULT_LAYOUT.frameWidth).toBe(360);
    expect(DEFAULT_LAYOUT.frameHeight).toBe(270);
  });

  it('generates an HTMLCanvasElement with 2x resolution', async () => {
    const canvas = await composeStrip(
      [],
      DEFAULT_LAYOUT,
      { type: 'holographic' },
      'none',
      { date: '2026-08-01', font: 'Caveat', textColor: '#2d1b69' },
      [],
      2
    );

    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(canvas.width).toBe(1600);
    expect(canvas.height).toBe(2400);
  });
});
