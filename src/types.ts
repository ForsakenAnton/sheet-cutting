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
