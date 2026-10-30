import type { LayoutResult, Project } from '../types';
import { formatArea, formatLength } from '../lib/format';
import { PartSwatch } from './PartSwatch';

interface Props {
  project: Project;
  result: LayoutResult;
}

export function CutList({ project, result }: Props) {
  const { parts, unit } = project;
  if (parts.length === 0) return null;

  const rotatedByPart = result.rotatedByPart;
  const totalCount = parts.reduce((sum, part) => sum + part.qty, 0);
  const totalArea = parts.reduce((sum, part) => sum + part.width * part.height * part.qty, 0);
  const totalPerimeter = parts.reduce(
    (sum, part) => sum + (part.width + part.height) * 2 * part.qty,
    0,
  );

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-body-tertiary fw-semibold">Cut List</div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-sm align-middle mb-0 text-nowrap">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Width</th>
                <th scope="col">Height</th>
                <th scope="col">Qty</th>
                <th scope="col">Rotated</th>
                <th scope="col" className="text-end">
                  Area
                </th>
                <th scope="col" className="text-end">
                  Perimeter
                </th>
              </tr>
            </thead>
            <tbody>
              {parts.map((part, index) => {
                const rotated = rotatedByPart[part.id] ?? 0;
                return (
                  <tr key={part.id}>
                    <td>
                      <span className="d-inline-flex align-items-center gap-2">
                        <PartSwatch index={index} />
                        {index + 1}
                      </span>
                    </td>
                    <td>{formatLength(part.width, unit)}</td>
                    <td>{formatLength(part.height, unit)}</td>
                    <td>{part.qty}</td>
                    <td>
                      {rotated > 0 ? (
                        <span className="badge text-bg-secondary">{rotated} × 90°</span>
                      ) : (
                        <span className="text-body-secondary">0°</span>
                      )}
                    </td>
                    <td className="text-end">
                      {formatArea(part.width * part.height * part.qty, unit)}
                    </td>
                    <td className="text-end">
                      {formatLength((part.width + part.height) * 2 * part.qty, unit)} {unit}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="fw-semibold border-top">
                <td colSpan={3}>Total</td>
                <td>{totalCount}</td>
                <td />
                <td className="text-end">{formatArea(totalArea, unit)}</td>
                <td className="text-end">
                  {formatLength(totalPerimeter, unit)} {unit}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        {result.placedCount < result.totalCount && (
          <p className="small text-body-secondary mb-0 mt-2">
            Placed {result.placedCount} of {result.totalCount} pieces — adjust the sheet size or
            settings.
          </p>
        )}
      </div>
    </div>
  );
}
