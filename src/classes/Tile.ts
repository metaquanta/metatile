import { Polygon, Rhomb, Triangle } from "./Polygon";
import { V } from "./V";

const u = V(31, 17);
const v = V(97, 109);

export interface Tile extends Polygon {
  parent: () => this;
  children: () => this[];
}

export interface TileSet<T extends Tile> {
  tile: () => T;
  tileFromEdge: (edge: V, pos?: V) => T;
  tiling: (tile: T) => Tiling<T>;
}

export interface Tiling<T extends Tile> {
  cover: (mask: Polygon) => Generator<T>;
}

export type TriangleTile = Tile & Triangle;

export type RhombTile = Tile & Rhomb;

export function TileSet<T extends Tile>(f: (edge: V) => T): TileSet<T> {
  return {
    tile: () => f(u).translate(v),
    tileFromEdge: (u: V, v?: V) => f(u).translate(v || V(0, 0)),
    tiling: (tile) => Tiling(tile)
  };
}

export function Tiling<T extends Tile>(tile: T): Tiling<T> {
  return {
    cover: (mask) => coverWith(tile, mask)
  };
}

export function TriangleTile(
  triangle: Triangle,
  parent: (t: Triangle) => Triangle,
  children: (t: Triangle) => Triangle[]
): TriangleTile {
  return {
    ...triangle,
    parent: () => TriangleTile(parent(triangle), parent, children),
    children: () =>
      children(triangle).map((c) => TriangleTile(c, parent, children)),
    translate(v) {
      return TriangleTile(triangle.translate(v), parent, children);
    }
  };
}

export function* coverWith<T extends Tile>(
  tile: T,
  mask: Polygon
): Generator<T> {
  function* descend(tile: T, d: number): Generator<T> {
    for (const t of tile.children()) {
      if (t.intersects(mask)) {
        if (d === 1) yield t;
        else yield* descend(t, d - 1);
      }
    }
  }

  function* ascend(tile: T, d: number): Generator<T> {
    const parent = tile.parent();
    for (const t of parent.children()) {
      if (t !== tile && t.intersects(mask)) {
        if (d === 0) yield t;
        else yield* descend(t, d);
      }
    }
    if (!parent.contains(mask)) {
      yield* ascend(parent, d + 1);
    }
  }

  yield tile;
  yield* ascend(tile, 0);
}
