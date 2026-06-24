export interface PartColor {
  fill: string;
  stroke: string;
}

export const PART_COLORS: PartColor[] = [
  { fill: '#a8c7fa', stroke: '#3b6fd4' },
  { fill: '#a9dfb5', stroke: '#3f9a55' },
  { fill: '#ffd08a', stroke: '#d68a17' },
  { fill: '#f2a7a7', stroke: '#cc4b4b' },
  { fill: '#d3b8f0', stroke: '#8a4fd0' },
  { fill: '#a6dfe2', stroke: '#3a9aa0' },
  { fill: '#f7c3e0', stroke: '#c95fa4' },
  { fill: '#d8dc92', stroke: '#94992c' },
  { fill: '#f0c9a8', stroke: '#c07d3a' },
  { fill: '#c2c9d4', stroke: '#6c757d' },
];

export function partColor(index: number): PartColor {
  return PART_COLORS[index % PART_COLORS.length];
}

export const LABEL_COLOR = '#1b1f23';

export interface CanvasTheme {
  paper: string;
  border: string;
  hatch: string;
}

export function canvasTheme(dark: boolean): CanvasTheme {
  return dark
    ? { paper: '#2b3035', border: '#6c757d', hatch: '#495057' }
    : { paper: '#f1f3f5', border: '#6c757d', hatch: '#ced4da' };
}
