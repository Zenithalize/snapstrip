import { describe, it, expect } from 'vitest';
import { FILTER_PRESETS, getFilterCss } from '../utils/filters';

describe('Filter Preset Utilities', () => {
  it('contains all required preset definitions', () => {
    const filterIds = FILTER_PRESETS.map((f) => f.id);
    expect(filterIds).toContain('none');
    expect(filterIds).toContain('soft');
    expect(filterIds).toContain('vivid');
    expect(filterIds).toContain('vintage');
    expect(filterIds).toContain('noir');
    expect(filterIds).toContain('dreamy');
    expect(filterIds).toContain('golden');
    expect(filterIds).toContain('cool');
    expect(filterIds).toContain('y2k');
  });

  it('returns valid CSS strings for filter presets', () => {
    expect(getFilterCss('none')).toBe('none');
    expect(getFilterCss('noir')).toBe('grayscale(1) contrast(1.2)');
    expect(getFilterCss('vivid')).toBe('saturate(1.4) contrast(1.1)');
  });
});
