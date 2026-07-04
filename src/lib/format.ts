import type { Unit } from '../types';
import { UNITS } from './units';

export { formatArea, formatLength, formatPercent } from './units';

export function partSizeLabel(width: number, height: number, unit: Unit): string {
  const decimals = UNITS[unit].decimals;
  const w = Number(width.toFixed(decimals));
  const h = Number(height.toFixed(decimals));
  return `${w} × ${h}`;
}

export function formatNumber(value: number, decimals = 2): string {
  return Number(value.toFixed(decimals)).toString();
}
