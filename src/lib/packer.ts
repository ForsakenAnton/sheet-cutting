export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Placement {
  x: number;
  y: number;
  w: number;
  h: number;
  rotated: boolean;
}

export type Heuristic = 'bssf' | 'blsf' | 'baf' | 'bl';

const EPS = 1e-6;

function score(free: Rect, w: number, h: number, heuristic: Heuristic): [number, number] {
  const leftoverW = free.w - w;
  const leftoverH = free.h - h;
  const shortSide = Math.min(leftoverW, leftoverH);
  const longSide = Math.max(leftoverW, leftoverH);

  switch (heuristic) {
    case 'bssf':
      return [shortSide, longSide];
    case 'blsf':
      return [longSide, shortSide];
    case 'baf':
      return [free.w * free.h - w * h, shortSide];
    case 'bl':
      return [free.y + h, free.x];
  }
}

export class MaxRectsBin {
  readonly width: number;
  readonly height: number;
  private free: Rect[];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.free = [{ x: 0, y: 0, w: width, h: height }];
  }

  fits(w: number, h: number, allowRotation: boolean): boolean {
    if (w <= this.width + EPS && h <= this.height + EPS) return true;
    return allowRotation && h <= this.width + EPS && w <= this.height + EPS;
  }

  insert(w: number, h: number, allowRotation: boolean, heuristic: Heuristic): Placement | null {
    let best: Placement | null = null;
    let bestA = Infinity;
    let bestB = Infinity;

    const consider = (free: Rect, pw: number, ph: number, rotated: boolean) => {
      if (pw > free.w + EPS || ph > free.h + EPS) return;
      const [a, b] = score(free, pw, ph, heuristic);
      if (a < bestA - EPS || (Math.abs(a - bestA) <= EPS && b < bestB - EPS)) {
        bestA = a;
        bestB = b;
        best = { x: free.x, y: free.y, w: pw, h: ph, rotated };
      }
    };

    for (const free of this.free) {
      consider(free, w, h, false);
      if (allowRotation && w !== h) consider(free, h, w, true);
    }

    if (best) this.occupy(best);
    return best;
  }

  private occupy(used: Placement): void {
    const kept: Rect[] = [];
    const created: Rect[] = [];

    for (const free of this.free) {
      if (!this.split(free, used, created)) kept.push(free);
    }

    this.free = prune(kept.concat(created));
  }

  private split(free: Rect, used: Placement, out: Rect[]): boolean {
    const ux2 = used.x + used.w;
    const uy2 = used.y + used.h;
    const fx2 = free.x + free.w;
    const fy2 = free.y + free.h;

    if (used.x >= fx2 - EPS || ux2 <= free.x + EPS || used.y >= fy2 - EPS || uy2 <= free.y + EPS) {
      return false;
    }

    if (used.y > free.y + EPS) out.push({ x: free.x, y: free.y, w: free.w, h: used.y - free.y });
    if (uy2 < fy2 - EPS) out.push({ x: free.x, y: uy2, w: free.w, h: fy2 - uy2 });
    if (used.x > free.x + EPS) out.push({ x: free.x, y: free.y, w: used.x - free.x, h: free.h });
    if (ux2 < fx2 - EPS) out.push({ x: ux2, y: free.y, w: fx2 - ux2, h: free.h });

    return true;
  }
}

function contains(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x - EPS &&
    inner.y >= outer.y - EPS &&
    inner.x + inner.w <= outer.x + outer.w + EPS &&
    inner.y + inner.h <= outer.y + outer.h + EPS
  );
}

function prune(rects: Rect[]): Rect[] {
  const usable = rects.filter((r) => r.w > EPS && r.h > EPS);
  const result: Rect[] = [];

  for (let i = 0; i < usable.length; i++) {
    let redundant = false;
    for (let j = 0; j < usable.length && !redundant; j++) {
      if (i === j) continue;
      if (contains(usable[j], usable[i])) {
        if (!contains(usable[i], usable[j]) || j < i) redundant = true;
      }
    }
    if (!redundant) result.push(usable[i]);
  }

  return result;
}
