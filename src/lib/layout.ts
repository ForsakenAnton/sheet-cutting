import type { LayoutResult, PlacedPart, Project, SheetLayout, UnplacedPart } from '../types';
import { MaxRectsBin } from './packer';
import type { Heuristic } from './packer';

export const MAX_SHEETS = 60;
export const MAX_PIECES = 2000;
const HEURISTICS: Heuristic[] = ['bssf', 'baf', 'blsf', 'bl'];
const ORDERS = ['area', 'maxSide', 'height', 'width'] as const;

type Order = (typeof ORDERS)[number];

interface Piece {
  partId: string;
  colorIndex: number;
  width: number;
  height: number;
}

interface Attempt extends LayoutResult {
  compactness: number;
}

function expand(project: Project): { pieces: Piece[]; skipped: UnplacedPart[] } {
  const pieces: Piece[] = [];
  const skipped: UnplacedPart[] = [];

  project.parts.forEach((part, colorIndex) => {
    if (part.width <= 0 || part.height <= 0) return;
    const qty = Math.max(Math.floor(part.qty), 0);
    const taken = Math.min(qty, MAX_PIECES - pieces.length);
    for (let i = 0; i < taken; i++) {
      pieces.push({ partId: part.id, colorIndex, width: part.width, height: part.height });
    }
    if (taken < qty) skipped.push({ partId: part.id, count: qty - taken, reason: 'limit' });
  });

  return { pieces, skipped };
}

function sortPieces(pieces: Piece[], order: Order): Piece[] {
  const copy = pieces.slice();

  copy.sort((a, b) => {
    switch (order) {
      case 'area':
        return (
          b.width * b.height - a.width * a.height ||
          Math.max(b.width, b.height) - Math.max(a.width, a.height)
        );
      case 'maxSide':
        return (
          Math.max(b.width, b.height) - Math.max(a.width, a.height) ||
          b.width * b.height - a.width * a.height
        );
      case 'height':
        return b.height - a.height || b.width - a.width;
      case 'width':
        return b.width - a.width || b.height - a.height;
    }
  });

  return copy;
}

function addUnplaced(list: UnplacedPart[], piece: Piece, reason: UnplacedPart['reason']): void {
  const entry = list.find((item) => item.partId === piece.partId && item.reason === reason);
  if (entry) entry.count += 1;
  else list.push({ partId: piece.partId, count: 1, reason });
}

function packOnce(pieces: Piece[], project: Project, heuristic: Heuristic): Attempt {
  const { sheet, settings } = project;
  const kerf = Math.max(settings.kerf, 0);
  const margin = Math.max(settings.margin, 0);
  const usableW = sheet.width - margin * 2;
  const usableH = sheet.height - margin * 2;
  const binW = usableW + kerf;
  const binH = usableH + kerf;

  const bins: MaxRectsBin[] = [];
  const sheets: SheetLayout[] = [];
  const unplaced: UnplacedPart[] = [];
  const rotatedByPart: Record<string, number> = {};
  let placedCount = 0;

  const store = (index: number, piece: Piece, x: number, y: number, rotated: boolean) => {
    const placed: PlacedPart = {
      partId: piece.partId,
      colorIndex: piece.colorIndex,
      x: margin + x,
      y: margin + y,
      width: rotated ? piece.height : piece.width,
      height: rotated ? piece.width : piece.height,
      rotated,
    };
    sheets[index].parts.push(placed);
    sheets[index].usedArea += piece.width * piece.height;
    if (rotated) rotatedByPart[piece.partId] = (rotatedByPart[piece.partId] ?? 0) + 1;
    placedCount += 1;
  };

  for (const piece of pieces) {
    const w = piece.width + kerf;
    const h = piece.height + kerf;

    if (usableW <= 0 || usableH <= 0) {
      addUnplaced(unplaced, piece, 'oversize');
      continue;
    }

    const fitsSheet =
      (w <= binW && h <= binH) || (settings.allowRotation && h <= binW && w <= binH);

    if (!fitsSheet) {
      addUnplaced(unplaced, piece, 'oversize');
      continue;
    }

    let done = false;

    for (let i = 0; i < bins.length; i++) {
      const spot = bins[i].insert(w, h, settings.allowRotation, heuristic);
      if (spot) {
        store(i, piece, spot.x, spot.y, spot.rotated);
        done = true;
        break;
      }
    }

    if (done) continue;

    if (bins.length >= MAX_SHEETS) {
      addUnplaced(unplaced, piece, 'space');
      continue;
    }

    const bin = new MaxRectsBin(binW, binH);
    const spot = bin.insert(w, h, settings.allowRotation, heuristic);
    bins.push(bin);
    sheets.push({ parts: [], usedArea: 0 });

    if (spot) store(bins.length - 1, piece, spot.x, spot.y, spot.rotated);
    else addUnplaced(unplaced, piece, 'oversize');
  }

  const sheetArea = sheets.length * sheet.width * sheet.height;
  const usedArea = sheets.reduce((sum, item) => sum + item.usedArea, 0);
  const compactness = sheets.reduce((sum, item) => sum + item.usedArea * item.usedArea, 0);

  return {
    sheets,
    placedCount,
    totalCount: pieces.length,
    unplaced,
    sheetArea,
    usedArea,
    wasteArea: Math.max(sheetArea - usedArea, 0),
    utilization: sheetArea > 0 ? usedArea / sheetArea : 0,
    rotatedByPart,
    compactness,
  };
}

function better(candidate: Attempt, current: Attempt): boolean {
  if (candidate.placedCount !== current.placedCount)
    return candidate.placedCount > current.placedCount;
  if (candidate.sheets.length !== current.sheets.length)
    return candidate.sheets.length < current.sheets.length;
  return candidate.compactness > current.compactness;
}

export function computeLayout(project: Project): LayoutResult {
  const { pieces, skipped } = expand(project);

  if (pieces.length === 0) {
    return {
      sheets: [],
      placedCount: 0,
      totalCount: 0,
      unplaced: [],
      sheetArea: 0,
      usedArea: 0,
      wasteArea: 0,
      utilization: 0,
      rotatedByPart: {},
    };
  }

  const heavy = pieces.length > 400;
  const depth = project.settings.optimize ? (heavy ? 2 : 4) : 1;
  const heuristics: Heuristic[] = HEURISTICS.slice(0, depth);
  const orders: Order[] = ORDERS.slice(0, depth);

  const attempts = orders.flatMap((order) => {
    const sorted = sortPieces(pieces, order);
    return heuristics.map((heuristic) => packOnce(sorted, project, heuristic));
  });
  const best = attempts.reduce((current, attempt) =>
    better(attempt, current) ? attempt : current,
  );
  const skippedCount = skipped.reduce((sum, item) => sum + item.count, 0);

  return {
    ...best,
    totalCount: best.totalCount + skippedCount,
    unplaced: best.unplaced.concat(skipped),
  };
}
