import type { Part, Project, Unit } from '../types';
import { readStorage } from './storage';
import { fromUnit, isUnit } from './units';

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

export const PROJECT_KEY = 'sheet-cutting.project.v2';
const LEGACY_PROJECT_KEY = 'sheet-cutting.project';

export const MAX_QTY = 2000;
export const MAX_LENGTH = 100_000;

const inches = (value: number) => fromUnit(value, 'in');

export function createId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function createPart(width: number, height: number, qty: number): Part {
  return { id: createId(), width, height, qty };
}

export function createBlankPart(unit: Unit): Part {
  return unit === 'in' ? createPart(inches(16), inches(12), 1) : createPart(400, 300, 1);
}

export function createDefaultProject(unit: Unit = 'mm'): Project {
  if (unit === 'in') {
    return {
      unit,
      sheet: {
        width: inches(96),
        height: inches(48),
        thickness: inches(0.75),
        material: 'Plywood',
      },
      parts: [
        createPart(inches(30), inches(22), 2),
        createPart(inches(22), inches(22), 2),
        createPart(inches(15), inches(22), 4),
      ],
      settings: { kerf: inches(0.125), margin: inches(0.5), optimize: true, allowRotation: true },
    };
  }

  return {
    unit,
    sheet: { width: 2500, height: 1250, thickness: 18, material: 'Plywood' },
    parts: [createPart(800, 600, 2), createPart(600, 600, 2), createPart(400, 600, 4)],
    settings: { kerf: 3, margin: 10, optimize: true, allowRotation: true },
  };
}

type Json = Record<string, unknown>;

function isRecord(value: unknown): value is Json {
  return typeof value === 'object' && value !== null;
}

function finite(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function parseJson(raw: string | null): unknown {
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeProject(raw: unknown, legacy: boolean): Project | null {
  if (!isRecord(raw)) return null;

  const unit = isUnit(raw.unit) ? raw.unit : 'mm';
  const fallback = createDefaultProject(unit);
  const sheet = isRecord(raw.sheet) ? raw.sheet : {};
  const settings = isRecord(raw.settings) ? raw.settings : {};
  const rawParts = Array.isArray(raw.parts) ? raw.parts.filter(isRecord) : [];

  const length = (value: unknown, fallbackMm: number, allowZero: boolean) => {
    const number = finite(value);
    if (number === null) return fallbackMm;
    const mm = Math.min(legacy ? fromUnit(number, unit) : number, MAX_LENGTH);
    return mm > 0 || (allowZero && mm === 0) ? mm : fallbackMm;
  };

  const parts = rawParts
    .map((part) => {
      const qty = finite(part.qty);
      return {
        id: typeof part.id === 'string' && part.id !== '' ? part.id : createId(),
        width: length(part.width, 0, false),
        height: length(part.height, 0, false),
        qty: qty === null ? 1 : Math.min(Math.max(Math.round(qty), 1), MAX_QTY),
      };
    })
    .filter((part) => part.width > 0 && part.height > 0);

  return {
    unit,
    sheet: {
      width: length(sheet.width, fallback.sheet.width, false),
      height: length(sheet.height, fallback.sheet.height, false),
      thickness: length(sheet.thickness, fallback.sheet.thickness, true),
      material:
        typeof sheet.material === 'string' && MATERIALS.includes(sheet.material)
          ? sheet.material
          : fallback.sheet.material,
    },
    parts,
    settings: {
      kerf: length(settings.kerf, fallback.settings.kerf, true),
      margin: length(settings.margin, fallback.settings.margin, true),
      optimize: typeof settings.optimize === 'boolean' ? settings.optimize : true,
      allowRotation: typeof settings.allowRotation === 'boolean' ? settings.allowRotation : true,
    },
  };
}

export function loadProject(): Project {
  const current = parseJson(readStorage(PROJECT_KEY));
  if (current !== null) return normalizeProject(current, false) ?? createDefaultProject();
  const legacy = parseJson(readStorage(LEGACY_PROJECT_KEY));
  return normalizeProject(legacy, true) ?? createDefaultProject();
}
