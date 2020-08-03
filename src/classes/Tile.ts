import { ColorRotationParameters } from "../renderer/Colorer";
import { isCallable } from "../util";
import { isRect, Polygon, Rect, Rhomb, Triangle } from "./Polygon";
import { V } from "./V";

const s = V(31, 17);
const t = V(97, 109);

const VP_FUDGE = 100;

export interface Tile extends Polygon {
  proto: string;
  rotationalSymmetry: number;
  parent: () => this;
  children: () => this[];
  intersects: (p: Polygon, depth?: number) => boolean;
  contains: (p: Polygon | V, depth?: number) => boolean;
}

export interface TileSet {
  protos: string[];
  tile: () => Tile;
  tileFromEdge: (edge: V, pos?: V) => Tile;
  tiling: (tile: Tile) => Tiling;
  colorOptions?: ColorRotationParameters;
}

export interface Tiling {
  cover: (mask: Polygon) => Generator<Tile>;
}

export type TriangleTile = Tile & Triangle;

export type RhombTile = Tile & Rhomb;

export function TileSet(
  f: (edge: V, origin: V) => Tile,
  protos: string[] | string,
  colorOptions?: ColorRotationParameters
): TileSet {
  return {
    protos: typeof protos == "string" ? [protos] : protos,
    tile: () => f(s, V(0, 0)).translate(t),
    tileFromEdge: (u: V, v: V = V(0, 0)) => f(u, v),
    tiling: (tile) => Tiling(tile),
    colorOptions
  };
}

export function Tiling<T extends Tile>(tile: T): Tiling {
  return {
    cover: (mask) => coverWith(tile, mask)
  };
}

export function createTile<P extends Polygon>(
  proto: string,
  t: P,
  children: (t: Tile & P) => (Tile & P)[],
  parent: (Tile & P) | ((t: Tile & P) => Tile & P),
  rotationalSymmetry = 1
): Tile & P {
  return {
    ...t,
    proto,
    rotationalSymmetry,
    parent() {
      if (isCallable(parent))
        return (parent as (t: Tile & P) => Tile & P)(this as Tile & P);
      return this;
    },
    children() {
      return children(this as Tile & P);
    },
    translate: (v: V) =>
      createTile(
        proto,
        t.translate(v),
        children,
        !isCallable(parent)
          ? (parent as Tile & P).translate(v)
          : (parent as Tile & P)
      ),
    equals(p: Polygon) {
      if ((p as Tile).proto === undefined) return false;
      if ((p as Tile).proto === proto) return t.equals(p);
      return false;
    }
  };
}

export function createTriangleTile(
  triangle: Triangle,
  parent: (t: TriangleTile) => Triangle & { proto: string },
  children: (t: TriangleTile) => (Triangle & { proto: string })[],
  proto = "triangle"
): TriangleTile {
  return {
    ...triangle,
    proto,
    rotationalSymmetry: 1,
    parent() {
      const p = parent(this);
      return createTriangleTile(p, parent, children, p.proto);
    },
    children() {
      return children(this).map((c) =>
        createTriangleTile(c, parent, children, c.proto)
      );
    },
    translate(v) {
      return createTriangleTile(triangle.translate(v), parent, children);
    }
  };
}

export function* coverWith<T extends Tile>(
  tile: T,
  mask: Polygon,
  options = { drawAncestors: false }
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
        else {
          if (options?.drawAncestors) yield t;
          yield* descend(t, d - 1);
        }
      }
    }
  }

  function* ascend(tile: T, d: number): Generator<T> {
    if (d > 30) {
      console.error(`!!!maximum depth exceeded!!! d: ${d} [${tile}]`);
      return;
    }
    const parent = tile.parent();
    for (const t of parent.children()) {
      if (!tile.equals(t) && t.intersects(bufferedMask, d)) {
        if (d === 0) yield t;
        else {
          if (options?.drawAncestors) yield t;
          yield* descend(t, d);
        }
      }
      console.debug(
        `Tile:coverWith:ascend() - [${d}, ${tile.equals(t)}, ${t.intersects(
          bufferedMask,
          d
        )}]`
      );
    }
    if (!parent.contains(bufferedMask, d + 1)) {
      yield* ascend(parent, d + 1);
    }
    console.debug(
      `Tile:coverWith:ascend(${tile}, ${d}) - ${parent.contains(
        bufferedMask,
        d + 1
      )}`
    );
  }

  yield tile;
  yield* ascend(tile, 0);
}
