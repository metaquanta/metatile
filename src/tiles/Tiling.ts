import { Polygon } from "../lib/math/2d/Polygon";
import { Tile } from "./Tile";

export interface Tiling {
  cover(mask: Polygon): Generator<Tile>;
}

export namespace Tiling {
  export interface Options {
    includeAncestors?: boolean;
    maxStackDepth?: number;
    progressive?: boolean;
  }

  export function create(tile: Tile, options?: Options): Tiling {
    return {
      cover: (mask) => coverWith(tile, mask, options)
    };
  }
}

function* coverWith(
  tile: Tile,
  mask: Polygon,
  options?: Tiling.Options
): Generator<Tile> {
  const opts = { ...defaultOptions, ...options };
  console.debug(`Tiling:coverWith(${mask}, ${options?.progressive})`);
  function* descend(tile: Tile, d: number): Generator<Tile> {
    if (d < 0) {
      console.trace(`!!!Unreachable reached!!! [d: ${d}]`);
      throw new Error(
        "Tiling::cover::descend() doesn't support depth less than 0."
      );
    }
    for (const t of tile.children()) {
      if (t.intersects(mask)) {
        if (d === 1) {
          yield t;
        } else {
          if (opts.includeAncestors) yield t;
          yield* descend(t, d - 1);
        }
      }
    }
  }

  function* ascend(tile: Tile, d: number, nvhExtra?: number): Generator<Tile> {
    console.debug(
      `Tiling:cover:ascend(Tile, ${d}, ${nvhExtra}) ${
        tile.proto
      } [${tile.polygon().area()}]`
    );
    if (d > opts.maxStackDepth) {
      console.trace(`!!!maximum depth/height exceeded!!! d: ${d}`);
      throw new Error(`!!!maximum depth/height exceeded!!! d: ${d}`);
    }
    const parent = tile.parent();
    for (const t of parent.children()) {
      if (!tile.equals(t) && t.intersects(mask)) {
        if (d === 0 || opts.includeAncestors) {
          yield t;
        }
        if (d > 0) yield* descend(t, d);
      }
    }
    // keep going to be sure.
    if (nvhExtra !== undefined && nvhExtra > 0) {
      yield* ascend(parent, d + 1, nvhExtra - 1);
    } else if (!parent.contains(mask)) {
      yield* ascend(parent, d + 1);
      // contains() isn't enough for N.V.H. tiles
    } else if (
      nvhExtra === undefined &&
      parent.proto.coveringGenerations !== undefined
    ) {
      yield* ascend(parent, d + 1, parent.proto.coveringGenerations);
    } // else we're done
  }

  if (options?.progressive) {
    yield tile;
    yield* ascend(tile, 0, 0);
  } else {
    let d;
    let root = tile;
    for (d = 0; !root.contains(mask); d++) {
      //yield root;
      root = root.parent();
    }
    console.debug(`tiling root d: ${d}, t: ${root.polygon()}`);
    //todo: NVH
    yield* descend(root, d);
  }
}

const defaultOptions = {
  includeAncestors: false,
  maxStackDepth: 500,
  progressive: true
};

export default Tiling;
