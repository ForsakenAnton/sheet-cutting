import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface Limits {
  min: number;
  max: number;
  integer: boolean;
}

function useNumberInput(value: number, onChange: (value: number) => void, limits: Limits) {
  const [text, setText] = useState(() => String(value));

  useEffect(() => {
    setText((prev) => (Number(prev) === value ? prev : String(value)));
  }, [value]);

  const handleChange = (raw: string) => {
    setText(raw);
    const parsed = Number(raw.replace(',', '.'));
    if (raw.trim() === '' || !Number.isFinite(parsed)) return;
    const normalized = limits.integer ? Math.round(parsed) : parsed;
    onChange(Math.min(Math.max(normalized, limits.min), limits.max));
  };

  return {
    value: text,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => handleChange(event.target.value),
    onBlur: () => setText(String(value)),
  };
}

interface FieldProps {
  id: string;
  label: ReactNode;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  integer?: boolean;
  suffix?: string;
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  min = 0,
  max = 1_000_000,
  step = 1,
  integer = false,
  suffix,
}: FieldProps) {
  const bind = useNumberInput(value, onChange, { min, max, integer });

  const field = (
    <div className="form-floating">
      <input
        id={id}
        type="number"
        className="form-control"
        placeholder=" "
        min={min}
        max={max}
        step={step}
        {...bind}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );

  if (!suffix) return field;

  return (
    <div className="input-group">
      {field}
      <span className="input-group-text">{suffix}</span>
    </div>
  );
}

interface CellProps {
  value: number;
  onChange: (value: number) => void;
  ariaLabel: string;
  min?: number;
  max?: number;
  step?: number;
  integer?: boolean;
}

export function NumberCell({
  value,
  onChange,
  ariaLabel,
  min = 0,
  max = 1_000_000,
  step = 1,
  integer = false,
}: CellProps) {
  const bind = useNumberInput(value, onChange, { min, max, integer });

  return (
    <input
      type="number"
      className="form-control form-control-sm"
      aria-label={ariaLabel}
      min={min}
      max={max}
      step={step}
      {...bind}
    />
  );
}
