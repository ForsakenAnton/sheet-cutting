import { useCallback, useState } from 'react';
import type { Unit } from '../types';
import type { ThemeChoice } from '../hooks/useTheme';
import { hasDonate } from '../donate';
import { UNITS, UNIT_LIST } from '../lib/units';
import { CoffeeIcon } from './CoffeeIcon';
import { DonateDialog } from './DonateDialog';

interface Props {
  unit: Unit;
  onUnitChange: (unit: Unit) => void;
  theme: ThemeChoice;
  onThemeChange: (theme: ThemeChoice) => void;
  onNewProject: () => void;
}

const THEME_OPTIONS: { value: ThemeChoice; icon: string; title: string }[] = [
  { value: 'light', icon: 'bi-sun-fill', title: 'Light' },
  { value: 'dark', icon: 'bi-moon-stars-fill', title: 'Dark' },
  { value: 'auto', icon: 'bi-circle-half', title: 'System' },
];

export function AppNavbar({ unit, onUnitChange, theme, onThemeChange, onNewProject }: Props) {
  const [donateOpen, setDonateOpen] = useState(false);
  const closeDonate = useCallback(() => setDonateOpen(false), []);

  return (
    <nav className="navbar bg-body-tertiary border-bottom sticky-top d-print-none">
      <div className="container-fluid gap-2 flex-nowrap">
        <span className="navbar-brand app-brand d-flex align-items-center gap-2 mb-0">
          <i className="bi bi-rulers fs-4 text-primary" />
          <span className="fw-semibold text-truncate d-none d-sm-inline">
            Sheet Cutting Planner
          </span>
        </span>

        <div className="d-flex align-items-center gap-2">
          {hasDonate && (
            <button
              type="button"
              className="donate-button"
              title="Buy me a coffee"
              aria-label="Buy me a coffee"
              onClick={() => setDonateOpen(true)}
            >
              <CoffeeIcon size={20} steam />
              <span className="donate-label">Buy me a coffee</span>
            </button>
          )}

          <label
            className="d-none d-md-inline text-body-secondary small mb-0"
            htmlFor="unit-select"
          >
            Units
          </label>
          <select
            id="unit-select"
            className="form-select form-select-sm w-auto"
            value={unit}
            onChange={(event) => onUnitChange(event.target.value as Unit)}
          >
            {UNIT_LIST.map((item) => (
              <option key={item} value={item}>
                {UNITS[item].label}
              </option>
            ))}
          </select>

          <div className="btn-group btn-group-sm" role="group" aria-label="Color mode">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                title={option.title}
                aria-label={option.title}
                aria-pressed={theme === option.value}
                className={`btn ${theme === option.value ? 'btn-secondary' : 'btn-outline-secondary'}`}
                onClick={() => onThemeChange(option.value)}
              >
                <i className={`bi ${option.icon}`} />
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-sm btn-primary text-nowrap"
            title="New Project"
            aria-label="New Project"
            onClick={onNewProject}
          >
            <i className="bi bi-file-earmark-plus me-1" />
            <span className="d-none d-sm-inline">New Project</span>
          </button>
        </div>
      </div>
      {donateOpen && <DonateDialog onClose={closeDonate} />}
    </nav>
  );
}
