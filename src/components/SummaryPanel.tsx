import type { LayoutResult, Project } from '../types';
import { formatArea, formatLength, formatPercent } from '../lib/format';

interface Props {
  project: Project;
  result: LayoutResult;
}

interface RowProps {
  label: string;
  value: string;
  tone?: string;
}

function Row({ label, value, tone }: RowProps) {
  return (
    <div className="d-flex justify-content-between gap-3 summary-row">
      <span className="text-body-secondary">{label}</span>
      <span className={`fw-semibold text-end ${tone ?? ''}`}>{value}</span>
    </div>
  );
}

export function SummaryPanel({ project, result }: Props) {
  const { sheet, unit } = project;
  const sheets = result.sheets.length;

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-body-tertiary fw-semibold">Summary</div>
      <div className="card-body vstack gap-2">
        <Row
          label="Sheet size"
          value={`${formatLength(sheet.width, unit)} × ${formatLength(sheet.height, unit)} ${unit}`}
        />
        <Row
          label="Material"
          value={`${sheet.material}${sheet.thickness > 0 ? `, ${formatLength(sheet.thickness, unit)} ${unit}` : ''}`}
        />
        <Row label="Sheets used" value={String(sheets)} />
        <Row label="Sheet area" value={formatArea(result.sheetArea, unit)} />
        <Row label="Used area" value={formatArea(result.usedArea, unit)} />
        <Row label="Waste area" value={formatArea(result.wasteArea, unit)} />
        <Row label="Utilization" value={formatPercent(result.utilization)} tone="text-primary" />
      </div>
    </div>
  );
}
