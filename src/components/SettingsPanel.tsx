import type { Settings, Unit } from '../types';
import { UNITS } from '../lib/units';
import { NumberField } from './NumberField';

interface Props {
  settings: Settings;
  unit: Unit;
  onChange: (patch: Partial<Settings>) => void;
}

export function SettingsPanel({ settings, unit, onChange }: Props) {
  const step = UNITS[unit].step;

  return (
    <div className="card shadow-sm d-print-none">
      <div className="card-header bg-body-tertiary d-flex align-items-center gap-2">
        <span className="step-badge">3</span>
        <span className="fw-semibold">Settings</span>
      </div>
      <div className="card-body vstack gap-3">
        <NumberField
          id="kerf"
          label="Blade kerf"
          value={settings.kerf}
          min={0}
          max={100}
          step={step}
          suffix={unit}
          onChange={(value) => onChange({ kerf: value })}
        />

        <NumberField
          id="margin"
          label="Edge margin"
          value={settings.margin}
          min={0}
          max={1000}
          step={step}
          suffix={unit}
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
