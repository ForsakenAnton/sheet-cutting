import { useEffect, useState } from 'react';
import type { ChangeEvent, KeyboardEvent, ReactNode } from 'react';
import type { Unit } from '../types';
import { MAX_LENGTH } from '../lib/project';
import { UNITS, fromUnit, roundTo, toUnit } from '../lib/units';

interface Limits {
  min: number;
  max: number;
  step: number;
  decimals: number;
}

function parseNumber(text: string): number | null {
  const normalized = text.trim().replace(',', '.');
  if (normalized === '') return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function lengthLimits(unit: Unit, allowZero: boolean, max: number): Limits {
  const { step, decimals } = UNITS[unit];
  return { min: allowZero ? 0 : 10 ** -decimals, max: toUnit(max, unit), step, decimals };
}

function useNumberInput(value: number, onChange: (value: number) => void, limits: Limits) {
  const { min, max, step, decimals } = limits;
  const [text, setText] = useState(() => String(value));

  useEffect(() => {
    setText((prev) => {
      const parsed = parseNumber(prev);
      return parsed !== null && roundTo(parsed, decimals) === value ? prev : String(value);
    });
  }, [value, decimals]);

  const clamp = (input: number) => Math.min(Math.max(roundTo(input, decimals), min), max);

  const commit = (next: number) => {
    setText(String(next));
    if (next !== value) onChange(next);
  };

  return {
    value: text,
    inputMode: decimals > 0 ? ('decimal' as const) : ('numeric' as const),
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      setText(event.target.value);
      const parsed = parseNumber(event.target.value);
      if (parsed === null) return;
      const next = roundTo(parsed, decimals);
      if (next >= min && next <= max && next !== value) onChange(next);
    },
    onBlur: () => {
      const parsed = parseNumber(text);
      commit(parsed === null ? value : clamp(parsed));
    },
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
      event.preventDefault();
      const current = parseNumber(text) ?? value;
      commit(clamp(current + (event.key === 'ArrowUp' ? step : -step)));
    },
  };
}

interface LengthFieldProps {
  id: string;
  label: ReactNode;
  value: number;
  unit: Unit;
  onChange: (value: number) => void;
  allowZero?: boolean;
  max?: number;
}

export function LengthField({
  id,
  label,
  value,
  unit,
  onChange,
  allowZero = false,
  max = MAX_LENGTH,
}: LengthFieldProps) {
  const bind = useNumberInput(
    toUnit(value, unit),
    (next) => onChange(fromUnit(next, unit)),
    lengthLimits(unit, allowZero, max),
  );

  return (
    <div className="input-group">
      <div className="form-floating">
        <input
          id={id}
          type="text"
          autoComplete="off"
          className="form-control"
          placeholder=" "
          {...bind}
        />
        <label htmlFor={id}>{label}</label>
      </div>
      <span className="input-group-text">{UNITS[unit].label}</span>
    </div>
  );
}

interface LengthCellProps {
  value: number;
  unit: Unit;
  onChange: (value: number) => void;
  ariaLabel: string;
}

export function LengthCell({ value, unit, onChange, ariaLabel }: LengthCellProps) {
  const bind = useNumberInput(
    toUnit(value, unit),
    (next) => onChange(fromUnit(next, unit)),
    lengthLimits(unit, false, MAX_LENGTH),
  );

  return (
    <input
      type="text"
      autoComplete="off"
      className="form-control form-control-sm"
      aria-label={ariaLabel}
      {...bind}
    />
  );
}

interface CountCellProps {
  value: number;
  onChange: (value: number) => void;
  ariaLabel: string;
  min: number;
  max: number;
}

export function CountCell({ value, onChange, ariaLabel, min, max }: CountCellProps) {
  const bind = useNumberInput(value, onChange, { min, max, step: 1, decimals: 0 });

  return (
    <input
      type="text"
      autoComplete="off"
      className="form-control form-control-sm"
      aria-label={ariaLabel}
      {...bind}
    />
  );
}
