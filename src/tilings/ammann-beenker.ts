import { Tile, TileWithParent } from "../classes/Tile";
import { Rhomb } from "../classes/Polygon";
import { Vec2 } from "../classes/Vec2";
import { tileGenerator, Tiling } from "./Tiling";

const SQRT2 = Math.sqrt(2);

enum TileVariants {
  Square,
  Rhomb,
}

const squareChildren = (sq: Rhomb, depth: number): Tile[] => {
  const r = sq.translate(sq.a.invert());
  const unit_d = r.c.scale(1 / (2 + SQRT2));
  const unit_d2 = r.d.subtract(r.b).scale(1 / (2 + SQRT2));
  const inner_sq = Rhomb(
    unit_d.scale(1 + SQRT2),
    unit_d2.scale(1 + SQRT2).add(r.b),
    unit_d,
    unit_d2.add(r.b)
  ).translate(sq.a);
  const a = r.b.scale(1 / (1 + SQRT2)).add(sq.a);
  const b = r.c
    .subtract(r.b)
    .scale(1 / (1 + SQRT2))
    .add(r.b)
    .add(sq.a);
  const c = r.c
    .subtract(r.d)
    .scale(1 / (1 + SQRT2))
    .add(r.d)
    .add(sq.a);
  const d = r.d.scale(1 / (1 + SQRT2)).add(sq.a);
  return [
    square(inner_sq, depth),
    rhomb(Rhomb(sq.a, a, inner_sq.d, inner_sq.c)),
    rhomb(Rhomb(sq.b, b, inner_sq.a, inner_sq.d)),
    rhomb(Rhomb(sq.d, inner_sq.b, inner_sq.a, c)),
    rhomb(Rhomb(sq.a, inner_sq.c, inner_sq.b, d)),
    square(Rhomb(sq.b, inner_sq.d, a, sq.b.subtract(unit_d)), depth),
    square(Rhomb(sq.c, inner_sq.a, b, b.add(unit_d)), depth),
    //square(Rhomb(sq.c, c.add(unit_d), c, inner_sq.a), depth),
    //square(Rhomb(sq.d, sq.d.subtract(unit_d), d, inner_sq.b), depth),
  ];
};

const rhombChildren = (rh: Rhomb): Tile[] => {
  const r = rh.translate(rh.a.invert());
  const u = r.b.scale(1 / (1 + SQRT2));
  const v = r.d.scale(1 / (1 + SQRT2));
  const rh1 = Rhomb(r.a, u, u.add(v), v).translate(rh.a);
  const rh2 = Rhomb(
    r.c,
    r.c.subtract(u),
    r.c.subtract(u.add(v)),
    r.c.subtract(v)
  ).translate(rh.a);
  const rh3 = Rhomb(rh.b, rh2.c, rh.d, rh1.c);
  return [
    square(Rhomb(rh.d, rh1.d.subtract(rh1.c).add(rh.d), rh1.d, rh1.c)),
    square(Rhomb(rh.b, rh1.c, rh1.b, rh.b.subtract(rh1.c).add(rh1.b))),
    square(Rhomb(rh.b, rh.b.subtract(rh2.c).add(rh2.d), rh2.d, rh2.c)),
    square(Rhomb(rh.d, rh2.c, rh2.b, rh2.b.subtract(rh2.c).add(rh.d))),
    rhomb(rh1),
    rhomb(rh2),
    rhomb(rh3),
  ];
};

const parent = (rh: Rhomb) => {
  const u = rh.c.subtract(rh.a).scale(1 + 1 / SQRT2);
  const v = rh.d.subtract(rh.b).scale(1 + 1 / SQRT2);
  return Rhomb(
    rh.a.add(u),
    rh.b.add(v),
    rh.c.add(u.invert()),
    rh.d.add(v.invert())
  );
};

const square = (rh: Rhomb, depth = -100): TileWithParent =>
  TileWithParent(
    rh.polygon(),
    () => squareChildren(rh, depth - 1),
    () => square(parent(rh), depth + 1),
    depth,
    TileVariants.Square
  );

const rhomb = (rh: Rhomb): Tile =>
  Tile(rh.polygon(), () => rhombChildren(rh), TileVariants.Rhomb);

const root = (p: Vec2, o: Vec2 = Vec2(0, 0)): TileWithParent => {
  const q = p.perp();
  return square(Rhomb(Vec2(0, 0), p, q.add(p), q).translate(o), 0);
};

export const testTileSet = () => {
  const sq = square(
    Rhomb(Vec2(0, 0), Vec2(400, 0), Vec2(400, 400), Vec2(0, 400)).translate(
      Vec2(1000, 700)
    )
  );
  //const colors = colorStream(15, 85, 50);
  sq.getPath();
  if (sq.parent) {
    const p = sq.parent();
    p.getPath();
    const children = p.children();
    children.forEach((c) => {
      c.getPath();
    });
    children[0].children().forEach((c) => c.getPath());
  }
};

export default (): Tiling => ({
  getTile: (seed, origin) => root(seed, origin),
  tileGenerator: (tile, includeAncestors?, viewport?) =>
    tileGenerator(tile, -1, includeAncestors, viewport),
  numVariants: 2,
});
