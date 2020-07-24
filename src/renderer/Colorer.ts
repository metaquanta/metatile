import { Tile } from "../classes/Tile";
import { V } from "../classes/V";

export type Colorer = (t: Tile) => string;

export const colorAngles = (
  numParts: number,
  partMult: number,
  s: number,
  l: number,
  alpha = 1.0
): ((t: Tile) => string) => (t) => {
  const th = theta(t.vertices()[1].subtract(t.vertices()[0]));
  const variant = 1;
  const a =
    ((th * 360) / numParts / Math.PI / 2 +
      ((variant || 1) * partMult * 360) / numParts) %
    360;
  const color = `hsla(${a}, ${s}%, ${l}%, ${alpha})`;
  return color;
};

export const colorStream: (
  n: number,
  s: number,
  l: number,
  alpha?: number,
  i?: number
) => Generator<string> = function* (n, s, l, alpha = 1.0, i = 0) {
  for (; i < 360; i = i + 360 / n) {
    yield `hsla(${i}, ${s}%, ${l}%, ${alpha})`;
  }
  yield* colorStream(n, s, l);
};

export const theta = (a: V): number => {
  return Math.atan(a.y / a.x) + (a.x > 0 ? Math.PI : 0);
};
