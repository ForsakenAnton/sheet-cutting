import type { Part, Unit } from '../types';
import { createPart } from '../lib/project';
import { partColor } from '../lib/palette';
import { UNITS } from '../lib/units';
import { NumberField } from './NumberField';

interface Props {
  parts: Part[];
  unit: Unit;
  allowRotation: boolean;
  onChange: (parts: Part[]) => void;
  onRotationChange: (value: boolean) => void;
}

export function PartsPanel({ parts, unit, allowRotation, onChange, onRotationChange }: Props) {
  const step = UNITS[unit].step;

  const update = (id: string, patch: Partial<Part>) => {
    onChange(parts.map((part) => (part.id === id ? { ...part, ...patch } : part)));
  };

  const remove = (id: string) => {
    onChange(parts.filter((part) => part.id !== id));
  };

  const add = () => {
    const last = parts[parts.length - 1];
    onChange([...parts, createPart(last ? last.width : 400, last ? last.height : 300, 1)]);
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-body-tertiary d-flex align-items-center gap-2">
        <span className="step-badge">2</span>
        <span className="fw-semibold">Parts</span>
        <button type="button" className="btn btn-sm btn-primary ms-auto" onClick={add}>
          <i className="bi bi-plus-lg me-1" />
          Add Part
        </button>
      </div>

      <div className="card-body">
        {parts.length === 0 ? (
          <p className="text-body-secondary small mb-3">No parts yet. Add the first one to start.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-2 parts-table">
              <thead>
                <tr>
                  <th scope="col" className="text-body-secondary fw-normal">
                    #
                  </th>
                  <th scope="col" className="text-body-secondary fw-normal">
                    Width
                  </th>
                  <th scope="col" className="text-body-secondary fw-normal">
                    Height
                  </th>
                  <th scope="col" className="text-body-secondary fw-normal">
                    Qty
                  </th>
                  <th scope="col" />
                </tr>
              </thead>
              <tbody>
                {parts.map((part, index) => (
                  <tr key={part.id}>
                    <td>
                      <span className="d-inline-flex align-items-center gap-1">
                        <span
                          className="legend-dot"
                          style={{
                            background: partColor(index).fill,
                            borderColor: partColor(index).stroke,
                          }}
                        />
                        {index + 1}
                      </span>
                    </td>
                    <td>
                      <NumberField
                        small
                        value={part.width}
                        min={1}
                        step={step}
                        ariaLabel={`Part ${index + 1} width`}
                        onChange={(value) => update(part.id, { width: value })}
                      />
                    </td>
                    <td>
                      <NumberField
                        small
                        value={part.height}
                        min={1}
                        step={step}
                        ariaLabel={`Part ${index + 1} height`}
                        onChange={(value) => update(part.id, { height: value })}
                      />
                    </td>
                    <td>
                      <NumberField
                        small
                        integer
                        value={part.qty}
                        min={1}
                        max={2000}
                        step={1}
                        ariaLabel={`Part ${index + 1} quantity`}
                        onChange={(value) => update(part.id, { qty: value })}
                      />
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        title="Remove part"
                        onClick={() => remove(part.id)}
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="form-check mb-0">
          <input
            className="form-check-input"
            type="checkbox"
            id="allow-rotation"
            checked={allowRotation}
            onChange={(event) => onRotationChange(event.target.checked)}
          />
          <label className="form-check-label" htmlFor="allow-rotation">
            Allow rotation (90°)
          </label>
        </div>
      </div>
    </div>
  );
}
