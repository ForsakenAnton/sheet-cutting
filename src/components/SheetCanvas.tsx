import type { SheetLayout, SheetSpec, Unit } from '../types';
import { LABEL_COLOR, canvasTheme, partColor } from '../lib/palette';
import { formatLength, partSizeLabel } from '../lib/format';

interface Props {
  layout: SheetLayout;
  sheet: SheetSpec;
  unit: Unit;
  index: number;
  dark: boolean;
}

export function SheetCanvas({ layout, sheet, unit, index, dark }: Props) {
  const theme = canvasTheme(dark);
  const scale = Math.max(sheet.width, sheet.height);
  const stroke = scale / 700;
  const hatch = scale / 90;
  const baseFont = scale / 42;
  const patternId = `hatch-${index}`;

  return (
    <div className="sheet-figure">
      <div className="dim-top">
        {formatLength(sheet.width, unit)} {unit}
      </div>
      <div className="d-flex align-items-stretch gap-2">
        <div className="dim-left">
          {formatLength(sheet.height, unit)} {unit}
        </div>
        <svg
          data-sheet={index}
          className="sheet-svg"
          viewBox={`0 0 ${sheet.width} ${sheet.height}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Sheet ${index + 1} layout`}
        >
          <defs>
            <pattern
              id={patternId}
              width={hatch}
              height={hatch}
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width={hatch} height={hatch} fill={theme.paper} />
              <line x1={0} y1={0} x2={0} y2={hatch} stroke={theme.hatch} strokeWidth={hatch / 4} />
            </pattern>
          </defs>

          <rect x={0} y={0} width={sheet.width} height={sheet.height} fill={`url(#${patternId})`} />

          {layout.parts.map((part, partIndex) => {
            const color = partColor(part.colorIndex);
            const label = partSizeLabel(part.width, part.height, unit);
            const fontSize = Math.min(
              baseFont,
              part.height * 0.24,
              (part.width * 0.88) / (label.length * 0.55),
            );
            const showLabel = fontSize > baseFont / 3.2;

            return (
              <g key={partIndex}>
                <rect
                  x={part.x}
                  y={part.y}
                  width={part.width}
                  height={part.height}
                  fill={color.fill}
                  stroke={color.stroke}
                  strokeWidth={stroke}
                />
                {showLabel && (
                  <text
                    x={part.x + part.width / 2}
                    y={part.y + part.height / 2}
                    fontSize={fontSize}
                    fill={LABEL_COLOR}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="system-ui, sans-serif"
                  >
                    {label}
                    {part.rotated ? ' ↻' : ''}
                  </text>
                )}
              </g>
            );
          })}

          <rect
            x={stroke / 2}
            y={stroke / 2}
            width={sheet.width - stroke}
            height={sheet.height - stroke}
            fill="none"
            stroke={theme.border}
            strokeWidth={stroke * 1.5}
          />
        </svg>
      </div>
    </div>
  );
}
