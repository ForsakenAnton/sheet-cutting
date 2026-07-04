import type { LayoutResult, Project } from '../types';
import { SheetCanvas } from './SheetCanvas';

interface Props {
  project: Project;
  result: LayoutResult;
  dark: boolean;
}

export function LayoutView({ project, result, dark }: Props) {
  const { sheet, unit } = project;

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-body-tertiary fw-semibold">Layout Result</div>

      <div className="card-body">
        {result.sheets.length === 0 ? (
          <div className="empty-state text-center text-body-secondary py-5">
            <i className="bi bi-grid-3x3-gap fs-1 d-block mb-3 opacity-50" />
            <p className="mb-0">Add a part to see the cutting plan.</p>
          </div>
        ) : (
          <div className="vstack gap-4">
            {result.sheets.map((layout, index) => (
              <div key={index}>
                {result.sheets.length > 1 && (
                  <div className="d-flex justify-content-between small text-body-secondary mb-1">
                    <span className="fw-semibold">
                      Sheet {index + 1} of {result.sheets.length}
                    </span>
                    <span>{layout.parts.length} parts</span>
                  </div>
                )}
                <SheetCanvas layout={layout} sheet={sheet} unit={unit} index={index} dark={dark} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
