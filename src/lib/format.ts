import type { UnplacedPart, Unit } from '../types';
import { MAX_PIECES, MAX_SHEETS } from './layout';
import { formatLength } from './units';

export { formatArea, formatLength, formatPercent } from './units';

export const UNPLACED_REASONS: Record<UnplacedPart['reason'], string> = {
  oversize: 'larger than the usable sheet area',
  space: `over the ${MAX_SHEETS}-sheet limit`,
  limit: `over the ${MAX_PIECES}-piece limit`,
};

export function partSizeLabel(width: number, height: number, unit: Unit): string {
  return `${formatLength(width, unit)} × ${formatLength(height, unit)}`;
}

export function pieceCount(count: number): string {
  return `${count} ${count === 1 ? 'pc' : 'pcs'}`;
}
