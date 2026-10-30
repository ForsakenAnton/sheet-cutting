import { describe, expect, it } from 'vitest';
import type { LayoutResult, Part, Project } from '../types';
import { MAX_PIECES, computeLayout } from './layout';

const TOLERANCE = 1e-6;

function createRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function part(id: string, width: number, height: number, qty: number): Part {
  return { id, width, height, qty };
}

function project(parts: Part[], overrides: Partial<Project> = {}): Project {
  return {
    unit: 'mm',
    sheet: { width: 2500, height: 1250, thickness: 18, material: 'MDF' },
    parts,
    settings: { kerf: 3, margin: 10, optimize: true, allowRotation: true },
    ...overrides,
  };
}

function violations(input: Project, result: LayoutResult): string[] {
  const { sheet, settings } = input;
  const found: string[] = [];

  result.sheets.forEach((layout, sheetIndex) => {
    if (layout.parts.length === 0) found.push(`sheet ${sheetIndex} is empty`);

    layout.parts.forEach((placed, index) => {
      const source = input.parts.find((item) => item.id === placed.partId);
      if (!source) {
        found.push(`unknown part ${placed.partId}`);
        return;
      }

      const expected = placed.rotated
        ? [source.height, source.width]
        : [source.width, source.height];
      if (placed.width !== expected[0] || placed.height !== expected[1]) {
        found.push(`sheet ${sheetIndex} part ${index} has wrong size`);
      }
      if (placed.rotated && !settings.allowRotation) {
        found.push(`sheet ${sheetIndex} part ${index} rotated while rotation is off`);
      }

      const inside =
        placed.x >= settings.margin - TOLERANCE &&
        placed.y >= settings.margin - TOLERANCE &&
        placed.x + placed.width <= sheet.width - settings.margin + TOLERANCE &&
        placed.y + placed.height <= sheet.height - settings.margin + TOLERANCE;
      if (!inside) found.push(`sheet ${sheetIndex} part ${index} is outside the margin`);

      layout.parts.slice(index + 1).forEach((other, offset) => {
        const apartX =
          placed.x + placed.width + settings.kerf <= other.x + TOLERANCE ||
          other.x + other.width + settings.kerf <= placed.x + TOLERANCE;
        const apartY =
          placed.y + placed.height + settings.kerf <= other.y + TOLERANCE ||
          other.y + other.height + settings.kerf <= placed.y + TOLERANCE;
        if (!apartX && !apartY) {
          found.push(`sheet ${sheetIndex} parts ${index} and ${index + offset + 1} are too close`);
        }
      });
    });
  });

  const unplaced = result.unplaced.reduce((sum, item) => sum + item.count, 0);
  if (result.placedCount + unplaced !== result.totalCount) found.push('counts do not add up');

  return found;
}

describe('computeLayout', () => {
  it('keeps random layouts inside the margins with a kerf between parts', () => {
    const random = createRandom(12345);
    const pick = (min: number, max: number, decimals: number) =>
      Number((min + random() * (max - min)).toFixed(decimals));

    for (let run = 0; run < 300; run++) {
      const decimals = run % 3 === 0 ? 1 : 0;
      const parts = Array.from({ length: 1 + Math.floor(random() * 8) }, (_, index) =>
        part(
          `p${index}`,
          pick(20, 1500, decimals),
          pick(20, 1200, decimals),
          1 + Math.floor(random() * 15),
        ),
      );
      const input = project(parts, {
        sheet: {
          width: pick(300, 3000, decimals),
          height: pick(300, 2000, decimals),
          thickness: 18,
          material: 'MDF',
        },
        settings: {
          kerf: [0, 3, 3.2, 0.5, 10][run % 5],
          margin: [0, 10, 5.5][run % 3],
          optimize: run % 4 !== 0,
          allowRotation: run % 2 === 0,
        },
      });
      const result = computeLayout(input);

      expect(violations(input, result), `run ${run}`).toEqual([]);
      expect(result.totalCount).toBe(parts.reduce((sum, item) => sum + item.qty, 0));
    }
  });

  it('fits parts edge to edge when they fill the sheet exactly', () => {
    const input = project([part('a', 495, 500, 2)], {
      sheet: { width: 1000, height: 500, thickness: 0, material: 'MDF' },
      settings: { kerf: 10, margin: 0, optimize: true, allowRotation: false },
    });
    const result = computeLayout(input);

    expect(result.sheets).toHaveLength(1);
    expect(result.placedCount).toBe(2);
    expect(result.sheets[0].parts.map((item) => item.x).sort((a, b) => a - b)).toEqual([0, 505]);
  });

  it('reports parts larger than the usable area', () => {
    const input = project([part('a', 800, 600, 2)], {
      sheet: { width: 500, height: 400, thickness: 0, material: 'MDF' },
    });
    const result = computeLayout(input);

    expect(result.sheets).toEqual([]);
    expect(result.placedCount).toBe(0);
    expect(result.unplaced).toEqual([{ partId: 'a', count: 2, reason: 'oversize' }]);
  });

  it('subtracts the edge margin from the usable area', () => {
    const sheet = { width: 1000, height: 500, thickness: 0, material: 'MDF' };
    const exact = [part('a', 1000, 500, 1)];

    expect(computeLayout(project(exact, { sheet })).unplaced[0]?.reason).toBe('oversize');
    expect(
      computeLayout(
        project(exact, {
          sheet,
          settings: { kerf: 3, margin: 0, optimize: true, allowRotation: true },
        }),
      ).placedCount,
    ).toBe(1);
  });

  it('rotates parts only when rotation is allowed', () => {
    const sheet = { width: 400, height: 1200, thickness: 0, material: 'MDF' };
    const parts = [part('a', 1000, 300, 1)];
    const settings = { kerf: 3, margin: 0, optimize: true, allowRotation: true };

    const rotated = computeLayout(project(parts, { sheet, settings }));
    expect(rotated.sheets[0].parts[0]).toMatchObject({ rotated: true, width: 300, height: 1000 });
    expect(rotated.rotatedByPart).toEqual({ a: 1 });

    const fixed = computeLayout(
      project(parts, { sheet, settings: { ...settings, allowRotation: false } }),
    );
    expect(fixed.placedCount).toBe(0);
    expect(fixed.unplaced[0]?.reason).toBe('oversize');
  });

  it('reports pieces over the piece limit', () => {
    const result = computeLayout(
      project([part('a', 100, 100, 1500), part('b', 50, 50, 1000)], {
        settings: { kerf: 0, margin: 0, optimize: false, allowRotation: true },
      }),
    );

    expect(result.totalCount).toBe(2500);
    expect(result.placedCount).toBe(MAX_PIECES);
    expect(result.unplaced).toEqual([{ partId: 'b', count: 500, reason: 'limit' }]);
  });

  it('returns an empty result without parts', () => {
    const result = computeLayout(project([]));

    expect(result.totalCount).toBe(0);
    expect(result.sheets).toEqual([]);
    expect(result.unplaced).toEqual([]);
  });
});
