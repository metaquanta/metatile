import { Tile } from "../classes/Tile";
import { V } from "../classes/V";

export type Colorer = (t: Tile) => string;

export const colorRotation = ({
  saturation: s = 50,
  lightness: l = 50,
  alpha = 1,
  protos = [],
  protoSeparation = 1,
  hueOffset = 0.01
}: {
  saturation?: number;
  lightness?: number;
  alpha?: number;
  protos?: string[];
  protoSeparation?: number;
  hueOffset?: number;
}): ((t: Tile) => string) => (t) => {
  const th = theta(t.vertices()[1].subtract(t.vertices()[0]));
  const variant = Math.abs(protos.indexOf(t.kind));
  const numParts = protos.length;
  const angle =
    ((th / Math.PI / 2) % (1 / t.rotationalSymmetry)) * t.rotationalSymmetry +
    hueOffset;
  const slotSize = 360 / (numParts * protoSeparation);
  const a =
    (angle * slotSize + variant * protoSeparation * slotSize + 360) % 360;
  const color = `hsla(${a}, ${s}%, ${l}%, ${alpha})`;
  return color;
};

export const colorSet = (
  colorByProto: Map<string, string>,
  defaultColor = "blue"
): ((t: Tile) => string) => (t) => {
  return colorByProto.get(t.kind) || defaultColor;
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
