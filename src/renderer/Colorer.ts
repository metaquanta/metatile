import { Tile } from "../classes/Tile";
import { V } from "../classes/V";

export type Colorer = (t: Tile) => string;

export const colorAngles = (
  s: number,
  l: number,
  alpha = 1.0,
  kinds: string[] = [""],
  partMult = 1
): ((t: Tile) => string) => (t) => {
  console.log(`colorAngles(${kinds}, ${partMult})`);
  const th = theta(t.vertices()[1].subtract(t.vertices()[0]));
  const variant = Math.abs(kinds.indexOf(t.kind));
  const numParts = kinds.length;
  const angle =
    ((th / Math.PI / 2) % (1 / t.rotationalSymmetry)) * t.rotationalSymmetry;
  const slotSize = 360 / (numParts * partMult);
  const a = (angle * slotSize + variant * partMult * slotSize + 360) % 360;
  const color = `hsla(${a}, ${s}%, ${l}%, ${alpha})`;
  console.log(
    `colorAngles [${angle}, ${variant * partMult}]: ${color}   [${
      variant * partMult * slotSize
    } - ${slotSize + variant * partMult * slotSize}]`
  );
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
  return (
    (Math.atan(a.y / a.x) + (a.x > 0 ? Math.PI : 0) + Math.PI * 2) %
    (Math.PI * 2)
  );
};
