import type { Unit } from '../types';

interface UnitInfo {
  label: string;
  name: string;
  areaLabel: string;
  areaFactor: number;
  step: number;
  decimals: number;
}

export const UNITS: Record<Unit, UnitInfo> = {
  mm: { label: 'mm', name: 'Millimeters', areaLabel: 'm²', areaFactor: 1e-6, step: 1, decimals: 1 },
  cm: {
    label: 'cm',
    name: 'Centimeters',
    areaLabel: 'm²',
    areaFactor: 1e-4,
    step: 0.1,
    decimals: 2,
  },
  m: { label: 'm', name: 'Meters', areaLabel: 'm²', areaFactor: 1, step: 0.01, decimals: 3 },
  in: {
    label: 'in',
    name: 'Inches',
    areaLabel: 'ft²',
    areaFactor: 1 / 144,
    step: 0.25,
    decimals: 2,
  },
};

export const UNIT_LIST: Unit[] = ['mm', 'cm', 'm', 'in'];

export function formatLength(value: number, unit: Unit): string {
  const info = UNITS[unit];
  const rounded = Number(value.toFixed(info.decimals));
  return String(rounded);
}

export function formatArea(value: number, unit: Unit): string {
  const info = UNITS[unit];
  const converted = value * info.areaFactor;
  const decimals = converted < 10 ? 2 : 1;
  return `${converted.toFixed(decimals)} ${info.areaLabel}`;
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
