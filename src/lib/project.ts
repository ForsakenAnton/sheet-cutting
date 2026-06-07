import type { Part, Project } from '../types';

export const MATERIALS = [
  'Plywood',
  'MDF',
  'Chipboard',
  'Solid wood',
  'Metal',
  'Acrylic',
  'Glass',
  'Other',
];

export const PROJECT_KEY = 'sheet-cutting.project';

export function createId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function createPart(width: number, height: number, qty: number): Part {
  return { id: createId(), width, height, qty };
}

export const DEFAULT_PROJECT: Project = {
  unit: 'mm',
  sheet: { width: 2500, height: 1250, thickness: 18, material: 'Plywood' },
  parts: [createPart(800, 600, 2), createPart(600, 600, 2), createPart(400, 600, 4)],
  settings: { kerf: 3, margin: 10, optimize: true, allowRotation: true },
};
