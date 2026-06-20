import type { SheetSpec, Unit } from '../types';
import { MATERIALS } from '../lib/project';
import { UNITS } from '../lib/units';
import { NumberField } from './NumberField';

interface Props {
  sheet: SheetSpec;
  unit: Unit;
  onChange: (patch: Partial<SheetSpec>) => void;
}

export function SheetPanel({ sheet, unit, onChange }: Props) {
  const step = UNITS[unit].step;

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-body-tertiary d-flex align-items-center gap-2">
        <span className="step-badge">1</span>
        <span className="fw-semibold">Sheet</span>
      </div>
      <div className="card-body vstack gap-3">
        <div>
          <label className="form-label" htmlFor="sheet-width">
            Width
          </label>
          <NumberField
            id="sheet-width"
            value={sheet.width}
            min={1}
            step={step}
            suffix={unit}
            onChange={(value) => onChange({ width: value })}
          />
        </div>

        <div>
          <label className="form-label" htmlFor="sheet-height">
            Height
          </label>
          <NumberField
            id="sheet-height"
            value={sheet.height}
            min={1}
            step={step}
            suffix={unit}
            onChange={(value) => onChange({ height: value })}
          />
        </div>

        <div>
          <label className="form-label" htmlFor="sheet-thickness">
            Thickness <span className="text-body-secondary fw-normal">(optional)</span>
          </label>
          <NumberField
            id="sheet-thickness"
            value={sheet.thickness}
            min={0}
            step={step}
            suffix={unit}
            onChange={(value) => onChange({ thickness: value })}
          />
        </div>

        <div>
          <label className="form-label" htmlFor="sheet-material">
            Material
          </label>
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
        </div>
      </div>
    </div>
  );
}
