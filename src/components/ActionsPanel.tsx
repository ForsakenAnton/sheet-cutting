interface Props {
  disabled: boolean;
  onExportPdf: () => void;
  onExportSvg: () => void;
  onPrint: () => void;
}

export function ActionsPanel({ disabled, onExportPdf, onExportSvg, onPrint }: Props) {
  return (
    <div className="card shadow-sm d-print-none">
      <div className="card-header bg-body-tertiary fw-semibold">Actions</div>
      <div className="card-body vstack gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary"
          disabled={disabled}
          onClick={onExportPdf}
        >
          <i className="bi bi-file-earmark-pdf me-2" />
          Export PDF
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          disabled={disabled}
          onClick={onExportSvg}
        >
          <i className="bi bi-filetype-svg me-2" />
          Export SVG
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          disabled={disabled}
          onClick={onPrint}
        >
          <i className="bi bi-printer me-2" />
          Print
        </button>
      </div>
    </div>
  );
}
