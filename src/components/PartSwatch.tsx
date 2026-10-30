import type { PartTexture } from '../lib/palette';
import { partStyle } from '../lib/palette';

interface Props {
  index: number;
  shape?: 'dot' | 'box';
}

const STRIPE = 'rgb(27 31 35 / 0.4)';
const FORWARD = `repeating-linear-gradient(-45deg, ${STRIPE} 0 1px, transparent 1px 4px)`;
const BACKWARD = `repeating-linear-gradient(45deg, ${STRIPE} 0 1px, transparent 1px 4px)`;

const TEXTURE_IMAGES: Record<PartTexture, string | undefined> = {
  none: undefined,
  forward: FORWARD,
  backward: BACKWARD,
  cross: `${FORWARD}, ${BACKWARD}`,
};

export function PartSwatch({ index, shape = 'dot' }: Props) {
  const style = partStyle(index);

  return (
    <span
      className={shape === 'box' ? 'legend-box' : 'legend-dot'}
      style={{
        backgroundColor: style.fill,
        backgroundImage: TEXTURE_IMAGES[style.texture],
        borderColor: style.stroke,
      }}
    />
  );
}
