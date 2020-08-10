import { Prototile, Tile } from "./Tile";
import { Tiling, TilingOptions } from "./Tiling";
import { V } from "./V";
import { ColorRotationParameters } from "../renderer/Colorer";
import { first } from "../util";

const s = V(31, 17);
const t = V(97, 109);

export interface Rule {
  readonly protos: Prototile[];
  readonly tile: () => Tile;
  readonly tileFromEdge: (edge: V, pos?: V) => Tile;
  readonly tiling: (tile: Tile, options: TilingOptions) => Tiling;
  readonly colorOptions?: ColorRotationParameters;
}

export function Rule(
  prototiles: Prototile[],
  colorOptions?: ColorRotationParameters
): Rule {
  const seed = first(prototiles, (p) => p.tile !== undefined);
  if (seed === undefined)
    throw new Error("No Prototile has a seed tile method.");

  return {
    protos: prototiles,
    tile: () => (seed.tile as (v: V, p: V) => Tile)(s, t),
    tileFromEdge: (u: V, v: V = V(0, 0)) =>
      (seed.tile as (v: V, p: V) => Tile)(u, v),
    tiling: (tile, options) => Tiling(tile, options),
    colorOptions
  };
}
