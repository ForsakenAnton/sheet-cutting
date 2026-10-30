import type { SheetSpec, Unit } from '../types';
import { MATERIALS } from '../lib/project';
import { LengthField } from './NumberField';

interface Props {
  sheet: SheetSpec;
  unit: Unit;
  onChange: (patch: Partial<SheetSpec>) => void;
}

export function SheetPanel({ sheet, unit, onChange }: Props) {
  return (
    <div className="card shadow-sm">
      <div className="card-header bg-body-tertiary d-flex align-items-center gap-2">
        <span className="step-badge">1</span>
        <span className="fw-semibold">Sheet</span>
      </div>
      <div className="card-body vstack gap-3">
        <LengthField
          id="sheet-width"
          label="Width"
          value={sheet.width}
          unit={unit}
          onChange={(value) => onChange({ width: value })}
        />

        <LengthField
          id="sheet-height"
          label="Height"
          value={sheet.height}
          unit={unit}
          onChange={(value) => onChange({ height: value })}
        />

        <LengthField
          id="sheet-thickness"
          label={
            <>
              Thickness <span className="text-body-secondary">(optional)</span>
            </>
          }
          value={sheet.thickness}
          unit={unit}
          allowZero
          onChange={(value) => onChange({ thickness: value })}
        />

        <div className="form-floating">
          <select
            id="sheet-material"
            className="form-select"
            value={sheet.material}
            onChange={(event) => onChange({ material: event.target.value })}
          >
            {MATERIALS.map((material) => (
              <option key={material} value={material}>
                {material}
              </option>
            ))}
          </select>
          <label htmlFor="sheet-material">Material</label>
        </div>
      </div>
    </div>
  );
}
