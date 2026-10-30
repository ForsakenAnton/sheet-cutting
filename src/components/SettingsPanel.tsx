import type { Settings, Unit } from '../types';
import { LengthField } from './NumberField';

interface Props {
  settings: Settings;
  unit: Unit;
  onChange: (patch: Partial<Settings>) => void;
}

export function SettingsPanel({ settings, unit, onChange }: Props) {
  return (
    <div className="card shadow-sm d-print-none">
      <div className="card-header bg-body-tertiary d-flex align-items-center gap-2">
        <span className="step-badge">3</span>
        <span className="fw-semibold">Settings</span>
      </div>
      <div className="card-body vstack gap-3">
        <LengthField
          id="kerf"
          label="Blade kerf"
          value={settings.kerf}
          unit={unit}
          allowZero
          max={100}
          onChange={(value) => onChange({ kerf: value })}
        />

        <LengthField
          id="margin"
          label="Edge margin"
          value={settings.margin}
          unit={unit}
          allowZero
          max={1000}
          onChange={(value) => onChange({ margin: value })}
        />

        <div className="form-check mb-0">
          <input
            className="form-check-input"
            type="checkbox"
            id="optimize"
            checked={settings.optimize}
            onChange={(event) => onChange({ optimize: event.target.checked })}
          />
          <label className="form-check-label" htmlFor="optimize">
            Optimize for least waste
          </label>
          <div className="form-text">Tries several packing strategies and keeps the best one.</div>
        </div>
      </div>
    </div>
  );
}
