import type { FilterPreset, FilterId } from '../types/photobooth';

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'none',
    name: 'Natural',
    css: 'none',
  },
  {
    id: 'soft',
    name: 'Soft Pastel',
    css: 'brightness(1.05) contrast(0.95) saturate(0.9)',
  },
  {
    id: 'vivid',
    name: 'Vivid K-Pop',
    css: 'saturate(1.4) contrast(1.1)',
  },
  {
    id: 'vintage',
    name: 'Vintage 90s',
    css: 'sepia(0.4) contrast(1.05) brightness(1.05)',
  },
  {
    id: 'noir',
    name: 'Noir Mono',
    css: 'grayscale(1) contrast(1.2)',
  },
  {
    id: 'dreamy',
    name: 'Dreamy Pink',
    css: 'brightness(1.1) saturate(0.7) hue-rotate(10deg)',
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    css: 'sepia(0.3) saturate(1.3) brightness(1.1)',
  },
  {
    id: 'cool',
    name: 'Cool Breeze',
    css: 'hue-rotate(200deg) saturate(0.9) brightness(1.05)',
  },
  {
    id: 'y2k',
    name: 'Y2K Glow',
    css: 'saturate(1.6) contrast(1.15) hue-rotate(-10deg)',
  },
];

export function getFilterCss(id: FilterId): string {
  const preset = FILTER_PRESETS.find((f) => f.id === id);
  return preset ? preset.css : 'none';
}
