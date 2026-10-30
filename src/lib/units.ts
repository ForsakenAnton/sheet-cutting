import type { Unit } from '../types';

interface UnitInfo {
  label: string;
  mm: number;
  step: number;
  decimals: number;
  areaLabel: string;
  areaFactor: number;
}

export const UNITS: Record<Unit, UnitInfo> = {
  mm: { label: 'mm', mm: 1, step: 1, decimals: 2, areaLabel: 'm²', areaFactor: 1e-6 },
  cm: { label: 'cm', mm: 10, step: 0.1, decimals: 3, areaLabel: 'm²', areaFactor: 1e-6 },
  m: { label: 'm', mm: 1000, step: 0.01, decimals: 5, areaLabel: 'm²', areaFactor: 1e-6 },
  in: {
    label: 'in',
    mm: 25.4,
    step: 0.125,
    decimals: 4,
    areaLabel: 'ft²',
    areaFactor: 1 / 92903.04,
  },
};

export const UNIT_LIST: Unit[] = ['mm', 'cm', 'm', 'in'];

export function isUnit(value: unknown): value is Unit {
  return UNIT_LIST.includes(value as Unit);
}

export function roundTo(value: number, decimals: number): number {
  return Number(value.toFixed(decimals));
}

export function toUnit(mm: number, unit: Unit): number {
  return roundTo(mm / UNITS[unit].mm, UNITS[unit].decimals);
}

export function fromUnit(value: number, unit: Unit): number {
  return roundTo(value * UNITS[unit].mm, 6);
}

export function formatLength(mm: number, unit: Unit): string {
  return String(toUnit(mm, unit));
}

export function formatArea(mm2: number, unit: Unit): string {
  const info = UNITS[unit];
  const converted = mm2 * info.areaFactor;
  const decimals = converted < 10 ? 2 : 1;
  return `${converted.toFixed(decimals)} ${info.areaLabel}`;
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
