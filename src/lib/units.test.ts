import { describe, expect, it } from 'vitest';
import { formatArea, formatLength, fromUnit, isUnit, toUnit } from './units';

describe('units', () => {
  it('converts millimetres to display units and back', () => {
    expect(toUnit(2500, 'in')).toBe(98.4252);
    expect(toUnit(2500, 'm')).toBe(2.5);
    expect(toUnit(3.2, 'cm')).toBe(0.32);
    expect(fromUnit(96, 'in')).toBe(2438.4);
    expect(fromUnit(0.125, 'in')).toBe(3.175);
    expect(toUnit(fromUnit(0.0625, 'in'), 'in')).toBe(0.0625);
  });

  it('formats lengths without trailing zeros', () => {
    expect(formatLength(800, 'mm')).toBe('800');
    expect(formatLength(800, 'cm')).toBe('80');
    expect(formatLength(450, 'm')).toBe('0.45');
  });

  it('formats areas in square metres or square feet', () => {
    expect(formatArea(2500 * 1250, 'mm')).toBe('3.13 m²');
    expect(formatArea(fromUnit(96, 'in') * fromUnit(48, 'in'), 'in')).toBe('32.0 ft²');
  });

  it('recognises only supported units', () => {
    expect(isUnit('cm')).toBe(true);
    expect(isUnit('ft')).toBe(false);
    expect(isUnit('toString')).toBe(false);
    expect(isUnit(undefined)).toBe(false);
  });
});
