import type { RefObject } from 'react';
import type { LayoutResult, Project } from '../types';
import {
  UNPLACED_REASONS,
  formatArea,
  formatPercent,
  partSizeLabel,
  pieceCount,
} from '../lib/format';
import { PartSwatch } from './PartSwatch';
import { SheetCanvas } from './SheetCanvas';

interface Props {
  project: Project;
  result: LayoutResult;
  computing: boolean;
  canvasRef: RefObject<HTMLDivElement | null>;
}

interface TileProps {
  label: string;
  value: string;
  tone?: string;
}

function Tile({ label, value, tone }: TileProps) {
  return (
    <div className="col-6 col-lg-3">
      <div className="stat-tile">
        <div className="stat-label">{label}</div>
        <div className={`stat-value ${tone ?? ''}`}>{value}</div>
      </div>
    </div>
  );
}

export function LayoutView({ project, result, computing, canvasRef }: Props) {
  const { sheet, unit, parts } = project;
  const placedByPart = new Map<string, number>();

  result.sheets.forEach((layout) => {
    layout.parts.forEach((part) => {
      placedByPart.set(part.partId, (placedByPart.get(part.partId) ?? 0) + 1);
    });
  });

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-body-tertiary d-flex align-items-center gap-2">
        <span className="fw-semibold">Layout Result</span>
        {computing && (
          <span className="d-inline-flex align-items-center gap-2 small text-body-secondary d-print-none">
            <span className="spinner-border spinner-border-sm" aria-hidden="true" />
            Updating…
          </span>
        )}
      </div>

      <div className={`card-body ${computing ? 'is-computing' : ''}`}>
        {result.totalCount === 0 ? (
          <div className="empty-state text-center text-body-secondary py-5">
            <i className="bi bi-grid-3x3-gap fs-1 d-block mb-3 opacity-50" />
            <p className="mb-0">Add a part to see the cutting plan.</p>
          </div>
        ) : (
          <>
            <div className="row g-2 g-lg-3 mb-4 text-center stat-grid">
              <Tile label="Sheets needed" value={String(result.sheets.length)} />
              <Tile
                label="Parts placed"
                value={`${result.placedCount} / ${result.totalCount}`}
                tone={result.placedCount === result.totalCount ? 'text-success' : 'text-danger'}
              />
              <Tile
                label="Utilization"
                value={formatPercent(result.utilization)}
                tone="text-primary"
              />
              <Tile
                label="Waste"
                value={formatArea(result.wasteArea, unit)}
                tone="text-warning-emphasis"
              />
            </div>

            {result.unplaced.length > 0 && (
              <div className="alert alert-warning d-flex gap-2">
                <i className="bi bi-exclamation-triangle-fill" />
                <div>
                  <div className="fw-semibold">
                    {result.placedCount === 0
                      ? 'No parts could be placed'
                      : 'Some parts were not placed'}
                  </div>
                  <ul className="list-unstyled mb-0">
                    {result.unplaced.map((item) => {
                      const index = parts.findIndex((entry) => entry.id === item.partId);
                      if (index < 0) return null;
                      const part = parts[index];
                      return (
                        <li
                          key={`${item.partId}-${item.reason}`}
                          className="d-flex align-items-baseline gap-2"
                        >
                          <PartSwatch index={index} />
                          <span>
                            #{index + 1} · {partSizeLabel(part.width, part.height, unit)} {unit} —{' '}
                            {pieceCount(item.count)}, {UNPLACED_REASONS[item.reason]}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}

            {result.sheets.length > 0 && (
              <>
                <div ref={canvasRef} className="vstack gap-4">
                  {result.sheets.map((layout, index) => (
                    <div key={index}>
                      {result.sheets.length > 1 && (
                        <div className="d-flex justify-content-between small text-body-secondary mb-1">
                          <span className="fw-semibold">
                            Sheet {index + 1} of {result.sheets.length}
                          </span>
                          <span>
                            {layout.parts.length} parts ·{' '}
                            {formatPercent(layout.usedArea / (sheet.width * sheet.height))}
                          </span>
                        </div>
                      )}
                      <SheetCanvas layout={layout} sheet={sheet} unit={unit} index={index} />
                    </div>
                  ))}
                </div>

                <div className="d-flex flex-wrap gap-3 mt-3">
                  {parts.map((part, index) => {
                    const count = placedByPart.get(part.id) ?? 0;
                    if (count === 0) return null;
                    return (
                      <span key={part.id} className="d-inline-flex align-items-center gap-2 small">
                        <PartSwatch index={index} shape="box" />
                        {partSizeLabel(part.width, part.height, unit)}
                        <span className="text-body-secondary">({count})</span>
                      </span>
                    );
                  })}
                  <span className="d-inline-flex align-items-center gap-2 small">
                    <span className="legend-box legend-waste" />
                    Waste
                  </span>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
