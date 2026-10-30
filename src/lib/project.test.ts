import { afterEach, describe, expect, it, vi } from 'vitest';
import { PROJECT_KEY, createDefaultProject, loadProject } from './project';

function stubStorage(entries: Record<string, string>): void {
  const store = new Map(Object.entries(entries));
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('loadProject', () => {
  it('starts with the default project when nothing is stored', () => {
    stubStorage({});
    const project = loadProject();

    expect(project.unit).toBe('mm');
    expect(project.sheet.width).toBe(2500);
    expect(project.parts).toHaveLength(3);
  });

  it('reads the stored project in millimetres', () => {
    const stored = {
      unit: 'in',
      sheet: { width: 2438.4, height: 1219.2, thickness: 19.05, material: 'MDF' },
      parts: [{ id: 'a', width: 600, height: 400, qty: 3 }],
      settings: { kerf: 3.175, margin: 0, optimize: false, allowRotation: false },
    };
    stubStorage({ [PROJECT_KEY]: JSON.stringify(stored) });

    expect(loadProject()).toEqual(stored);
  });

  it('migrates a legacy project from its unit to millimetres', () => {
    stubStorage({
      'sheet-cutting.project': JSON.stringify({
        unit: 'in',
        sheet: { width: 96, height: 48, thickness: 0.75, material: 'Plywood' },
        parts: [{ id: 'a', width: 30, height: 20, qty: 2 }],
        settings: { kerf: 0.125, margin: 0.5, optimize: true, allowRotation: false },
      }),
    });
    const project = loadProject();

    expect(project.unit).toBe('in');
    expect(project.sheet).toMatchObject({ width: 2438.4, height: 1219.2, thickness: 19.05 });
    expect(project.parts[0]).toMatchObject({ width: 762, height: 508, qty: 2 });
    expect(project.settings).toMatchObject({ kerf: 3.175, margin: 12.7, allowRotation: false });
  });

  it('repairs broken stored data', () => {
    stubStorage({
      [PROJECT_KEY]: JSON.stringify({
        unit: 'ft',
        sheet: 'none',
        parts: [{ width: 'a' }, null, { id: 'k', width: 100, height: 50, qty: -3 }],
        settings: null,
      }),
    });
    const project = loadProject();

    expect(project.unit).toBe('mm');
    expect(project.sheet).toEqual(createDefaultProject().sheet);
    expect(project.parts).toEqual([{ id: 'k', width: 100, height: 50, qty: 1 }]);
    expect(project.settings).toEqual(createDefaultProject().settings);
  });

  it('falls back to the default project on invalid JSON', () => {
    stubStorage({ [PROJECT_KEY]: '{not json' });

    expect(loadProject().parts).toHaveLength(3);
  });

  it('survives a storage that throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('denied');
      },
    });

    expect(loadProject().sheet.width).toBe(2500);
  });
});

describe('createDefaultProject', () => {
  it('uses imperial sizes for inches', () => {
    const project = createDefaultProject('in');

    expect(project.unit).toBe('in');
    expect(project.sheet).toMatchObject({ width: 2438.4, height: 1219.2 });
    expect(project.settings.kerf).toBe(3.175);
  });
});
