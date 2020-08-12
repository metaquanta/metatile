import { Polygon } from "../lib/math/2d/Polygon";
import { theta } from "../lib/math/2d/V";
import { range } from "../lib/util";
import { Prototile } from "../tiles/Prototile";

// These produce a string appropriate for CSS or Canvas styles.
export type Colorer = (t: {
  proto: Prototile;
  polygon: () => Polygon;
  reflected: () => boolean;
}) => string;

export type RotationColorerOptions = {
  saturation?: number;
  lightness?: number;
  alpha?: number;
  protos?: Prototile[];
  hueSpan?: number;
  hueOffset?: number;
};

export const RotationColorer = ({
  saturation: s = 0.5,
  lightness: l = 0.5,
  alpha = 1,
  protos = [],
  hueSpan = 0,
  hueOffset = 0.05
}: RotationColorerOptions): ((t: {
  proto: Prototile;
  polygon: () => Polygon;
  reflected: () => boolean;
}) => string) => {
  // This assumes the protos lack mirror-symmetry and occur reflected.
  const numParts = protos.length * 2;
  const slotSize = 360 / numParts;
  // Nothing prevents a hueSpan > 1 reversing the "2" above
  const hueVariation = slotSize * hueSpan;
  const colors = getColors(numParts, hueOffset * 360);
  return (t) => {
    const th = theta(
      t.polygon().vertices()[1].subtract(t.polygon().vertices()[0])
    );
    // In this universe, angle=1.0 is one full rotation.
    const angle =
      ((th / Math.PI / 2) % (1 / t.proto.rotationalSymmetryOrder)) *
      t.proto.rotationalSymmetryOrder;
    const angleHueVar = Math.abs(angle - 0.5) * hueVariation * 2;
    const angleLightVar = Math.abs(((angle + 0.25) % 1) - 0.5) * hueSpan;

    const variant =
      Math.abs(protos.indexOf(t.proto)) * 2 + (t.reflected() ? 1 : 0);
    const hueRyb = (angleHueVar + colors[variant]) % 360;
    const hueRgb = rybToRgb(hueRyb);
    /*console.debug(
      `colorer: ${numParts}, ${slotSize}, ${hueVariation}, ${th}, ${variant}, `
    );*/
    const color = `hsla(${hueRgb}, ${s * 100}%, ${
      (l - angleLightVar) * 100
    }%, ${alpha})`;
    return color;
  };
};

export const SolidRgbColorer = (
  r = 0,
  g = 0,
  b = 0,
  alpha = 1
): ((t: {
  proto: Prototile;
  polygon: () => Polygon;
  reflected: () => boolean;
}) => string) => (_unused) => {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Super rough/eye-balled first order approximation of RYB color wheel.
export function rybToRgb(theta: number): number {
  if (theta < 120) return theta / 2;
  if (theta < 180) return theta - 60;
  if (theta < 240) return theta * 2 - 240;
  if (theta < 300) return theta * (3 / 4) + 60;
  return theta * (5 / 4) - 90;
}

function getColors(n: number, offset: number): number[] {
  // Basic complimentary colors.
  if (n === 2) {
    return [offset, (offset + 180) % 360];
  }
  // "Split complimentary"
  if (n === 3) {
    return [offset, (offset + 150) % 360, (offset + 210) % 360];
  }
  // "Tetradic"
  if (n === 4) {
    return [
      (offset + 330) % 360,
      (offset + 30) % 360,
      (offset + 150) % 360,
      (offset + 210) % 360
    ];
  }
  // n equidistant points
  if (n === 5) {
    return [
      offset,
      (offset + 330) % 360,
      (offset + 30) % 360,
      (offset + 150) % 360,
      (offset + 210) % 360
    ];
  }
  return range(n).map((i) => (i * 360) / n);
}
