import type { Part, Unit } from '../types';
import { MAX_QTY, createBlankPart, createPart } from '../lib/project';
import { CountCell, LengthCell } from './NumberField';
import { PartSwatch } from './PartSwatch';

interface Props {
  parts: Part[];
  unit: Unit;
  allowRotation: boolean;
  onChange: (parts: Part[]) => void;
  onRotationChange: (value: boolean) => void;
}

export function PartsPanel({ parts, unit, allowRotation, onChange, onRotationChange }: Props) {
  const update = (id: string, patch: Partial<Part>) => {
    onChange(parts.map((part) => (part.id === id ? { ...part, ...patch } : part)));
  };

  const remove = (id: string) => {
    onChange(parts.filter((part) => part.id !== id));
  };

  const add = () => {
    const last = parts[parts.length - 1];
    onChange([...parts, last ? createPart(last.width, last.height, 1) : createBlankPart(unit)]);
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
          <p className="text-body-secondary small mb-3">
            No parts yet. Add the first one to start.
          </p>
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
                        <PartSwatch index={index} />
                        {index + 1}
                      </span>
                    </td>
                    <td>
                      <LengthCell
                        value={part.width}
                        unit={unit}
                        ariaLabel={`Part ${index + 1} width`}
                        onChange={(value) => update(part.id, { width: value })}
                      />
                    </td>
                    <td>
                      <LengthCell
                        value={part.height}
                        unit={unit}
                        ariaLabel={`Part ${index + 1} height`}
                        onChange={(value) => update(part.id, { height: value })}
                      />
                    </td>
                    <td>
                      <CountCell
                        value={part.qty}
                        min={1}
                        max={MAX_QTY}
                        ariaLabel={`Part ${index + 1} quantity`}
                        onChange={(value) => update(part.id, { qty: value })}
                      />
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        title="Remove part"
                        aria-label={`Remove part ${index + 1}`}
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
