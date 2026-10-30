import type { CSSProperties } from 'react';
import type { SheetLayout, SheetSpec, Unit } from '../types';
import type { PartTexture } from '../lib/palette';
import { LABEL_COLOR, SHEET_COLORS, TEXTURE_OPACITY, partStyle } from '../lib/palette';
import { formatLength, partSizeLabel } from '../lib/format';

interface Props {
  layout: SheetLayout;
  sheet: SheetSpec;
  unit: Unit;
  index: number;
}

type Texture = Exclude<PartTexture, 'none'>;

const CHAR_WIDTH = 0.55;
const TEXTURE_ROTATION: Record<Texture, number> = { forward: 45, backward: -45, cross: 45 };

export function SheetCanvas({ layout, sheet, unit, index }: Props) {
  const scale = Math.max(sheet.width, sheet.height);
  const stroke = scale / 700;
  const hatch = scale / 90;
  const grain = scale / 150;
  const baseFont = scale / 42;
  const minFont = baseFont / 3.2;
  const patternId = `hatch-${index}`;
  const textureId = (texture: Texture) => `texture-${index}-${texture}`;
  const figureStyle = { '--sheet-ratio': sheet.width / sheet.height } as CSSProperties;
  const styles = layout.parts.map((part) => partStyle(part.colorIndex));
  const textures = [...new Set(styles.map((style) => style.texture))].filter(
    (texture): texture is Texture => texture !== 'none',
  );

  return (
    <div className="sheet-figure" style={figureStyle}>
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
              <rect
                className="sheet-paper"
                width={hatch}
                height={hatch}
                fill={SHEET_COLORS.paper}
              />
              <line
                className="sheet-hatch"
                x1={0}
                y1={0}
                x2={0}
                y2={hatch}
                stroke={SHEET_COLORS.hatch}
                strokeWidth={hatch / 4}
              />
            </pattern>
            {textures.map((texture) => (
              <pattern
                key={texture}
                id={textureId(texture)}
                width={grain}
                height={grain}
                patternUnits="userSpaceOnUse"
                patternTransform={`rotate(${TEXTURE_ROTATION[texture]})`}
              >
                <line
                  x1={grain / 2}
                  y1={0}
                  x2={grain / 2}
                  y2={grain}
                  stroke={LABEL_COLOR}
                  strokeOpacity={TEXTURE_OPACITY}
                  strokeWidth={grain / 4}
                />
                {texture === 'cross' && (
                  <line
                    x1={0}
                    y1={grain / 2}
                    x2={grain}
                    y2={grain / 2}
                    stroke={LABEL_COLOR}
                    strokeOpacity={TEXTURE_OPACITY}
                    strokeWidth={grain / 4}
                  />
                )}
              </pattern>
            ))}
          </defs>

          <rect x={0} y={0} width={sheet.width} height={sheet.height} fill={`url(#${patternId})`} />

          {layout.parts.map((part, partIndex) => {
            const style = styles[partIndex];
            const size = partSizeLabel(part.width, part.height, unit);
            const label = part.rotated ? `${size} ↻` : size;
            const span = label.length * CHAR_WIDTH;
            const across = Math.min(baseFont, part.height * 0.45, (part.width * 0.88) / span);
            const along = Math.min(baseFont, part.width * 0.45, (part.height * 0.88) / span);
            const vertical = along > across * 2 || (across <= minFont && along > minFont);
            const fontSize = vertical ? along : across;
            const cx = part.x + part.width / 2;
            const cy = part.y + part.height / 2;

            return (
              <g key={partIndex}>
                <rect
                  x={part.x}
                  y={part.y}
                  width={part.width}
                  height={part.height}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={stroke}
                />
                {style.texture !== 'none' && (
                  <rect
                    x={part.x}
                    y={part.y}
                    width={part.width}
                    height={part.height}
                    fill={`url(#${textureId(style.texture)})`}
                  />
                )}
                {fontSize > minFont && (
                  <text
                    x={cx}
                    y={cy}
                    transform={vertical ? `rotate(-90 ${cx} ${cy})` : undefined}
                    fontSize={fontSize}
                    fill={LABEL_COLOR}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="system-ui, sans-serif"
                  >
                    {label}
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
            stroke={SHEET_COLORS.border}
            strokeWidth={stroke * 1.5}
          />
        </svg>
      </div>
    </div>
  );
}
