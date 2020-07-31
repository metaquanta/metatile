import { Tile } from "../classes/Tile";
import { theta } from "../util";

export type Colorer = (t: Tile) => string;

export type ColorRotationParameters = {
  saturation?: number;
  lightness?: number;
  alpha?: number;
  protos?: string[];
  hueSpan?: number;
  hueOffset?: number;
};

export const colorRotation = ({
  saturation: s = 0.5,
  lightness: l = 0.5,
  alpha = 1,
  protos = [],
  hueSpan = 0.15,
  hueOffset = 0.32
}: ColorRotationParameters): ((t: Tile) => string) => {
  const numParts = protos.length;
  const slotSize = 360 / numParts;
  const hueVariation = slotSize * hueSpan;
  const colors = getColors(numParts, hueOffset * 360);
  return (t) => {
    const th = theta(t.vertices()[1].subtract(t.vertices()[0]));
    const variant = Math.abs(protos.indexOf(t.kind));
    const angle =
      ((th / Math.PI / 2) % (1 / t.rotationalSymmetry)) * t.rotationalSymmetry;
    const angleHueVar = Math.abs(angle - 0.5) * hueVariation * 2;
    const angleLightVar = Math.abs(((angle + 0.25) % 1) - 0.5) * hueSpan * 2;

    const hueRyb = (angleHueVar + colors[variant]) % 360;
    const hueRgb = rybToRgb(hueRyb);
    const color = `hsla(${hueRgb}, ${s * 100}%, ${
      (l - angleLightVar) * 100
    }%, ${alpha})`;
    return color;
  };
};

export const colorSet = (
  colorByProto: Map<string, string>,
  defaultColor = "blue"
): ((t: Tile) => string) => (t) => {
  return colorByProto.get(t.kind) || defaultColor;
};

export function rybToRgb(theta: number): number {
  if (theta < 120) return theta / 2;
  if (theta < 180) return theta - 60;
  if (theta < 240) return theta * 2 - 240;
  if (theta < 300) return theta * (3 / 4) + 60;
  return theta * (5 / 4) - 90;
}

function getColors(n: number, offset: number): number[] {
  if (n === 2) {
    return [offset, (offset + 180) % 360];
  }
  if (n === 3) {
    return [offset, (offset + 150) % 360, (offset + 210) % 360];
  }
  if (n === 4) {
    return [
      (offset + 330) % 360,
      (offset + 30) % 360,
      (offset + 150) % 360,
      (offset + 210) % 360
    ];
  }
  if (n === 5) {
    return [
      offset,
      (offset + 330) % 360,
      (offset + 30) % 360,
      (offset + 150) % 360,
      (offset + 210) % 360
    ];
  }
  return new Array(n).fill(0).map((_, i) => (i * 360) / n);
}
