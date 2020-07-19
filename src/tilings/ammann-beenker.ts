import {Vec2, Rhomb, Tile, TileWithParent} from './Tile';
import {tileGenerator, Tiling} from './Tiling';

const SQRT2 = Math.sqrt(2);

enum TileVariants {
  Square,
  Rhomb,
}

const rotate = (origin: Vec2, v: Vec2) => {
  const u = v.subtract(origin);
  const r = Vec2(
    (-1 * u.x * SQRT2) / 2 - (u.y * SQRT2) / 2,
    (u.x * SQRT2) / 2 - (u.y * SQRT2) / 2
  );
  return r.add(origin);
};

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
    rhomb(Rhomb(sq.a, a, inner_sq.d, inner_sq.c)),
    rhomb(Rhomb(sq.b, b, inner_sq.a, inner_sq.d)),
    rhomb(Rhomb(sq.d, inner_sq.b, inner_sq.a, c)),
    rhomb(Rhomb(sq.a, inner_sq.c, inner_sq.b, d)),
    square(inner_sq, depth),
    square(Rhomb(sq.b, inner_sq.d, a, sq.b.subtract(unit_d)), depth),
    square(Rhomb(sq.c, inner_sq.a, b, b.add(unit_d)), depth),
    square(Rhomb(sq.c, inner_sq.a, c, c.add(unit_d)), depth),
    square(Rhomb(sq.d, inner_sq.b, d, sq.d.subtract(unit_d)), depth),
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
  const rh3 = Rhomb(rh.b, rh1.c, rh.d, rh2.c);
  return [
    square(Rhomb(rh.b, rh1.c, rh1.b, rh.b.subtract(rh1.c).add(rh1.b))),
    square(Rhomb(rh.b, rh2.c, rh2.d, rh.b.subtract(rh2.c).add(rh2.d))),
    square(Rhomb(rh.d, rh1.c, rh1.d, rh1.d.subtract(rh1.c).add(rh.d))),
    square(Rhomb(rh.d, rh2.c, rh2.b, rh2.b.subtract(rh2.c).add(rh.d))),
    rhomb(rh1),
    rhomb(rh2),
    rhomb(rh3),
  ];
};

const square = (rh: Rhomb, depth = 0): TileWithParent =>
  TileWithParent(
    rh.polygon(),
    () => squareChildren(rh, depth + 1),
    () =>
      square(
        Rhomb(
          rotate(rh.b, rh.a),
          rotate(rh.c, rh.b),
          rotate(rh.d, rh.c),
          rotate(rh.a, rh.d)
        ),
        depth - 1
      ),
    depth,
    TileVariants.Square
  );

const rhomb = (rh: Rhomb): Tile =>
  Tile(rh.polygon(), () => rhombChildren(rh), TileVariants.Rhomb);

const root = (p: Vec2, o: Vec2 = Vec2(0, 0)): TileWithParent => {
  const q = p.perp();
  return square(Rhomb(Vec2(0, 0), p, q.add(p), q).translate(o));
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
    children.forEach(c => {
      c.getPath();
    });
    children[0].children().forEach(c => c.getPath());
  }
};

export default (): Tiling => ({
  getTile: (seed, origin) => root(seed, origin),
  tileGenerator: (tile, includeAncestors?, viewport?) =>
    tileGenerator(tile, 0, includeAncestors, viewport),
});
