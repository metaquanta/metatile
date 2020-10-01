import Polygon from "../lib/math/2d/Polygon";
import V from "../lib/math/2d/V";
import { first } from "../lib/util";
import Colorer from "../renderer/Colorer";
import Prototile from "./Prototile";
import Tile from "./Tile";
import Tiling from "./Tiling";

export interface Rule {
  readonly protos: Prototile[];
  tile(): Tile;
  tileFromEdge(edge: V, pos?: V): Tile;
  tiling(tile: Tile, options: Tiling.Options): Tiling;
  readonly colorOptions?: Colorer.RotationOptions;
}

export namespace Rule {
  export interface Builder {
    protoTile<T extends Polygon>(p: Prototile.Builder<T>): this;
    build(): Rule;
  }

  export function builder(params?: {
    colors?: Colorer.RotationOptions;
  }): Builder {
    return new _RuleBuilder({ colors: params?.colors });
  }

  export function create(
    prototiles: Prototile[],
    colorOptions?: Colorer.RotationOptions
  ): Rule {
    const tile = first(prototiles, (p) => p.tile !== undefined)?.tile as (
      i: V,
      j: V,
      p: V
    ) => Tile;
    return {
      protos: prototiles,
      tile: () => tile(V.create(100, 0), V.create(0, 100), V.create(0, 0)),
      tileFromEdge: (u: V, v: V = V.create(0, 0)) => tile(u, u.perp(), v),
      tiling: (tile, options) => Tiling.create(tile, options),
      colorOptions
    };
  }
}

class _RuleBuilder implements Rule.Builder {
  #protos: { build: (creators: ((p: Polygon) => Tile)[]) => Prototile }[];
  readonly #colors?: { hueSpan?: number; hueOffset?: number };

  constructor(params: { colors?: Colorer.RotationOptions } = {}) {
    this.#colors = params.colors;
    this.#protos = [];
  }

  protoTile<T extends Polygon>(p: Prototile.Builder<T>): this {
    this.#protos.push(p);
    return this;
  }

  build() {
    let builtProtos: Prototile[] = [];
    const creators = this.#protos.map((_, i) => (p: Polygon) =>
      builtProtos[i].create(p)
    );

    builtProtos = this.#protos.map((proto) => proto.build(creators));

    return Rule.create(builtProtos, this.#colors);
  }
}

export default Rule;
