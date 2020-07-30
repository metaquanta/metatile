import { isRect, Polygon, Rect, Rhomb, Triangle } from "./Polygon";
import { V } from "./V";

const s = V(31, 17);
const t = V(97, 109);

const VP_FUDGE = 100;

export interface Tile extends Polygon {
  kind: string;
  rotationalSymmetry: number;
  parent: () => this;
  children: () => this[];
  intersects: (p: Polygon, depth?: number) => boolean;
  contains: (p: Polygon | V, depth?: number) => boolean;
}

export interface TileSet {
  kinds: string[];
  tile: () => Tile;
  tileFromEdge: (edge: V, pos?: V) => Tile;
  tiling: (tile: Tile) => Tiling;
}

export interface Tiling {
  cover: (mask: Polygon) => Generator<Tile>;
}

export type TriangleTile = Tile & Triangle;

export type RhombTile = Tile & Rhomb;

export function TileSet(
  f: (edge: V) => Tile,
  kinds: string[] | string
): TileSet {
  return {
    kinds: typeof kinds == "string" ? [kinds] : kinds,
    tile: () => f(s).translate(t),
    tileFromEdge: (u: V, v?: V) => f(u).translate(v || V(0, 0)),
    tiling: (tile) => Tiling(tile)
  };
}

export function Tiling<T extends Tile>(tile: T): Tiling {
  return {
    cover: (mask) => coverWith(tile, mask)
  };
}

export function TriangleTile(
  triangle: Triangle,
  parent: (t: TriangleTile) => Triangle & { kind: string },
  children: (t: TriangleTile) => (Triangle & { kind: string })[],
  kind = "triangle"
): TriangleTile {
  return {
    ...triangle,
    kind,
    rotationalSymmetry: 1,
    parent() {
      const p = parent(this);
      return TriangleTile(p, parent, children, p.kind);
    },
    children() {
      return children(this).map((c) =>
        TriangleTile(c, parent, children, c.kind)
      );
    },
    translate(v) {
      return TriangleTile(triangle.translate(v), parent, children);
    }
  };
}

export function* coverWith<T extends Tile>(
  tile: T,
  mask: Polygon
): Generator<T> {
  const bufferedMask = isRect(mask) ? (mask as Rect).pad(VP_FUDGE) : mask;
  function* descend(tile: T, d: number): Generator<T> {
    if (d < 0) {
      console.error(`!!!unreachable!!! d: ${d}`);
      return;
    }
    for (const t of tile.children()) {
      if (t.intersects(bufferedMask, d)) {
        if (d === 1) yield t;
        else yield* descend(t, d - 1);
      }
    }
  }

  function* ascend(tile: T, d: number): Generator<T> {
    if (d > 15) {
      console.error(`!!!maximum depth exceeded!!! d: ${d}`);
      return;
    }
    const parent = tile.parent();
    for (const t of parent.children()) {
      if (!tile.equals(t) && t.intersects(bufferedMask, d)) {
        if (d === 0) yield t;
        else yield* descend(t, d);
      }
    }
    if (!parent.contains(bufferedMask, d + 1)) {
      yield* ascend(parent, d + 1);
    }
  }

  if (tile.intersects(bufferedMask, 0)) yield tile;
  yield* ascend(tile, 0);
}
