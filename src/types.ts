export type Unit = 'mm' | 'cm' | 'm' | 'in';

export interface Part {
  id: string;
  width: number;
  height: number;
  qty: number;
}

export interface SheetSpec {
  width: number;
  height: number;
  thickness: number;
  material: string;
}

export interface Settings {
  kerf: number;
  margin: number;
  optimize: boolean;
  allowRotation: boolean;
}

export interface Project {
  unit: Unit;
  sheet: SheetSpec;
  parts: Part[];
  settings: Settings;
}

export interface PlacedPart {
  partId: string;
  colorIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
}

export interface SheetLayout {
  parts: PlacedPart[];
  usedArea: number;
}

export interface UnplacedPart {
  partId: string;
  count: number;
  reason: 'oversize' | 'space' | 'limit';
}

export interface LayoutResult {
  sheets: SheetLayout[];
  placedCount: number;
  totalCount: number;
  unplaced: UnplacedPart[];
  sheetArea: number;
  usedArea: number;
  wasteArea: number;
  utilization: number;
  rotatedByPart: Record<string, number>;
}
