interface Props {
  disabled: boolean;
  onExportSvg: () => void;
}

export function ActionsPanel({ disabled, onExportSvg }: Props) {
  return (
    <div className="card shadow-sm">
      <div className="card-header bg-body-tertiary fw-semibold">Actions</div>
      <div className="card-body vstack gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary"
          disabled={disabled}
          onClick={onExportSvg}
        >
          <i className="bi bi-filetype-svg me-2" />
          Export SVG
        </button>
      </div>
    </div>
  );
}
