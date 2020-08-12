import { Polygon } from "../lib/math/2d/Polygon";
import { Tile } from "./Tile";

export function Tiling(tile: Tile, options?: TilingOptions): Tiling {
  return {
    cover: (mask) => coverWith(tile, mask, options)
  };
}

export interface Tiling {
  readonly cover: (mask: Polygon) => Generator<Tile>;
}

export interface TilingOptions {
  includeAncestors?: boolean;
  maxStackDepth?: number;
}

const defaultOptions = { includeAncestors: false, maxStackDepth: 500 };

export function* coverWith(
  tile: Tile,
  mask: Polygon,
  options?: TilingOptions
): Generator<Tile> {
  const opts = { ...defaultOptions, ...options };
  function* descend(tile: Tile, d: number): Generator<Tile> {
    /*console.debug(
      `Tiling:cover:descend(Tile, ${d}) ${
        tile.proto
      } [${tile.polygon().area()}]`
    );*/
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
    /*console.debug(
      `Tiling:cover:ascend(Tile, ${d}) ${tile.proto} [${tile.polygon().area()}]`
    );*/
    if (d > opts.maxStackDepth) {
      console.trace(`!!!maximum depth/height exceeded!!! d: ${d} [${tile}]`);
      throw new Error(`!!!maximum depth/height exceeded!!! d: ${d} [${tile}]`);
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

  yield tile;
  yield* ascend(tile, 0);
}
