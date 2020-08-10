import { Polygon } from "./Polygon";
import { Prototile, singlePrototile, Tile } from "./Tile";
import { Tiling, TilingOptions } from "./Tiling";
import { V } from "./V";
import { ColorRotationParameters } from "../renderer/Colorer";

const s = V(31, 17);
const t = V(97, 109);

export interface Rule {
  protos: Prototile[];
  tile: () => Tile;
  tileFromEdge: (edge: V, pos?: V) => Tile;
  tiling: (tile: Tile, options: TilingOptions) => Tiling;
  colorOptions?: ColorRotationParameters;
}

export function Rule(
  f: (edge: V, origin: V) => Tile,
  prototiles: Prototile[],
  colorOptions?: ColorRotationParameters
): Rule {
  return {
    protos: prototiles,
    tile: () => f(s, t),
    tileFromEdge: (u: V, v: V = V(0, 0)) => f(u, v),
    tiling: (tile, options) => Tiling(tile, options),
    colorOptions
  };
}

export function singlePrototileRule<P extends Polygon>(
  f: (edge: V, origin: V) => P,
  parent: (t: P) => P,
  children: (t: P) => P[],
  rotationalSymmetry = 1,
  colorOptions?: ColorRotationParameters
): Rule {
  const proto = singlePrototile(parent, children, rotationalSymmetry);
  return {
    protos: [proto],
    tile: () => proto.create(f(s, t)),
    tileFromEdge: (u: V, v: V = V(0, 0)) => proto.create(f(u, v)),
    tiling: (tile) => Tiling(tile),
    colorOptions
  };
}
