import { useEffect, useState } from 'react';

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  integer?: boolean;
  suffix?: string;
  id?: string;
  small?: boolean;
  ariaLabel?: string;
}

export function NumberField({
  value,
  onChange,
  min = 0,
  max = 1_000_000,
  step = 1,
  integer = false,
  suffix,
  id,
  small = false,
  ariaLabel,
}: Props) {
  const [text, setText] = useState(() => String(value));

  useEffect(() => {
    setText((prev) => (Number(prev) === value ? prev : String(value)));
  }, [value]);

  const handleChange = (raw: string) => {
    setText(raw);
    const parsed = Number(raw.replace(',', '.'));
    if (raw.trim() === '' || !Number.isFinite(parsed)) return;
    const normalized = integer ? Math.round(parsed) : parsed;
    onChange(Math.min(Math.max(normalized, min), max));
  };

  const input = (
    <input
      id={id}
      type="number"
      className={small ? 'form-control form-control-sm' : 'form-control'}
      value={text}
      min={min}
      max={max}
      step={step}
      aria-label={ariaLabel}
      onChange={(event) => handleChange(event.target.value)}
      onBlur={() => setText(String(value))}
    />
  );

  if (!suffix) return input;

  return (
    <div className={small ? 'input-group input-group-sm' : 'input-group'}>
      {input}
      <span className="input-group-text">{suffix}</span>
    </div>
  );
}
