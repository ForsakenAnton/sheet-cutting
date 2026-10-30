import { describe, expect, it } from 'vitest';
import { partStyle } from './palette';

describe('partStyle', () => {
  it('keeps the first ten parts solid', () => {
    expect(partStyle(0).texture).toBe('none');
    expect(partStyle(9).texture).toBe('none');
  });

  it('adds a texture instead of repeating a color', () => {
    expect(partStyle(10)).toMatchObject({ fill: partStyle(0).fill, texture: 'forward' });
    expect(partStyle(20).texture).toBe('backward');
    expect(partStyle(30).texture).toBe('cross');
  });

  it('gives forty parts distinct styles', () => {
    const keys = Array.from({ length: 40 }, (_, index) => {
      const style = partStyle(index);
      return `${style.fill}/${style.texture}`;
    });

    expect(new Set(keys).size).toBe(40);
  });
});
