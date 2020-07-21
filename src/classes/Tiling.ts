import { Tile, TileWithParent } from "../classes/Tile";
import { Vec2 } from "../classes/Vec2";
import { ViewPort } from "../classes/ViewPort";

export type Tiling = {
  getTile: (edge: Vec2, pos?: Vec2) => TileWithParent;
  tileGenerator: (
    tile: TileWithParent,
    includeAncestors?: boolean,
    viewport?: ViewPort
  ) => Generator<Tile>;
  numVariants: number;
};

export const cover = (t: TileWithParent, p: Vec2): Tile => {
  if (t.contains(p)) return t;
  if (t.parent) return cover(t.parent(), p);
  throw Error("Seed tile missing parent()!");
};

export const tileGenerator = function* (
  root: TileWithParent,
  depth: number,
  includeAncestors = false,
  viewport?: ViewPort
): Generator<Tile> {
  function* descend(tile: Tile, d: number): Generator<Tile> {
    for (const t of tile.children()) {
      if (viewport === undefined || t.intersectsViewport(viewport)) {
        if (d === depth) yield t;
        else if (d > depth) {
          if (includeAncestors) yield t;
          yield* descend(t, d - 1);
        }
      }
    }
  }

  function* ascend(tile: TileWithParent): Generator<Tile> {
    console.log(`ascend(${tile.polygon})`);
    const p = tile.parent(); //p.d=+1, tile.d=0

    if (p.depth <= tile.depth) {
      console.log("!!!!!");
      return;
    }
    for (const t of p.children().slice(1)) {
      //p.d=0
      if (viewport === undefined || t.intersectsViewport(viewport)) {
        if (tile.depth === depth) yield t;
        else if (tile.depth > depth) {
          if (includeAncestors) yield t;
          yield* descend(t, tile.depth - 1); // d=-1
        }
      }
    }
    if (
      viewport === undefined ||
      viewport
        .vertices()
        .map((v) => p.contains(v))
        .some((b) => !b)
    ) {
      yield* ascend(p);
    }
  }

  console.log(`tileGenerator() d=${root.depth} df=${depth}`);

  if (root.depth === depth) yield root;
  yield* ascend(root);
};
