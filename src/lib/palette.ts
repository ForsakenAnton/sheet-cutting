export type PartTexture = 'none' | 'forward' | 'backward' | 'cross';

export interface PartStyle {
  fill: string;
  stroke: string;
  texture: PartTexture;
}

const PART_COLORS = [
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

const TEXTURES: PartTexture[] = ['none', 'forward', 'backward', 'cross'];

export function partStyle(index: number): PartStyle {
  const color = PART_COLORS[index % PART_COLORS.length];
  const texture = TEXTURES[Math.floor(index / PART_COLORS.length) % TEXTURES.length];
  return { ...color, texture };
}

export const LABEL_COLOR = '#1b1f23';
export const TEXTURE_OPACITY = 0.3;

export const SHEET_COLORS = {
  paper: '#f1f3f5',
  hatch: '#ced4da',
  border: '#6c757d',
};
