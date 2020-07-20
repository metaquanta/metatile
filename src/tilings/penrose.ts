import {Rhomb, Vec2, TileWithParent, tileIntersectsViewport} from './Tile';
import {tileGenerator, Tiling} from './Tiling';

const SIN15 = Math.sin(Math.PI / 5);
const COS15 = Math.cos(Math.PI / 5);

const IF = (1 + Math.sqrt(5)) / 2;
const DF = 1 / IF;

const M = [Vec2(COS15, -1 * SIN15), Vec2(SIN15, COS15)];

const rotate = (u: Vec2) => Vec2(M[0].dot(u), M[1].dot(u));

const rhomb1 = (u: Vec2) => {
  const v = rotate(rotate(u));
  return Rhomb(Vec2(0, 0), u, u.add(v), v);
};

const contains = (r: Rhomb, p: Vec2): boolean => {
  const c = firstChild(firstChild(firstChild(firstChild(r))));
  console.log(`contains<penrose>(${r}, ${p}, ${c})`);
  return c.polygon().contains(p);
};

const tile1 = (r: Rhomb, p?: TileWithParent, d = -100): TileWithParent =>
  tile(r, t => children1(r, t, d - 1), 0, p, d);

const tile2 = (r: Rhomb, p: TileWithParent, d = -100): TileWithParent =>
  tile(r, t => children2(r, t, d - 1), 1, p, d);

const tile = (
  r: Rhomb,
  cf: (t: TileWithParent) => TileWithParent[],
  variant: number,
  p?: TileWithParent,
  depth = -100
): TileWithParent => ({
  polygon: r.polygon(),
  children() {
    return cf(this);
  },
  parent: () => p || parent(r, depth + 1),
  depth,
  variant,
  contains: (p: Vec2) => contains(r, p),
  intersectsViewport(vp) {
    return tileIntersectsViewport(this.parent().parent(), vp);
  },
  getPath: () => r.polygon().getPath(),
});

const parent = (r1: Rhomb, d: number): TileWithParent => {
  const r = r1.translate(r1.a.invert());
  const u = r.b.scale(IF);
  const v = r.d.scale(IF);
  return tile1(Rhomb(u.add(v), v, r.a, u).translate(r1.a), undefined, d);
};

const firstChild = (p: Rhomb): Rhomb => {
  const r = p.translate(p.c.invert());
  const u = r.b.scale(DF);
  const v = r.d.scale(DF);
  return Rhomb(r.c, v, u.add(v), u).translate(p.c);
};

const children1 = (
  r1: Rhomb,
  p: TileWithParent,
  d: number
): TileWithParent[] => {
  const r = r1.translate(r1.c.invert());
  const u = r.b.scale(DF);
  const v = r.d.scale(DF);
  //Rhomb(r.d, u.add(v), v, r.d.add(u.invert()))
  //Rhomb(r.b, u.add(v), r.a, r.a.subtract(u.add(v)).add(r.b)),
  return [
    tile1(firstChild(r1), p, d),
    tile2(Rhomb(r.b, r.b.add(v.invert()), u, u.add(v)).translate(r1.c), p, d),
    tile1(
      Rhomb(r.d, r.a.subtract(u.add(v)).add(r.d), r.a, u.add(v)).translate(r1.c)
    ),
  ];
};

const children2 = (
  r2: Rhomb,
  p: TileWithParent,
  d: number
): TileWithParent[] => {
  const r = r2.translate(r2.a.invert());
  const u = r.b.scale(DF);
  //const v = r.d.scale(DF);
  return [
    //tile1(Rhomb(r.b, r.b.add(v), r.a, v.invert()).translate(r2.a)),
    tile1(Rhomb(r.d, u.invert(), r.a, r.d.add(u)).translate(r2.a)),
    //tile2(Rhomb(r.c, r.a, v.add(r.b), r.c.add(v).add(r.b)).translate(r2.a)),
    tile2(
      Rhomb(r.c, r.c.add(u).add(r.d), u.add(r.d), r.a).translate(r2.a),
      p,
      d
    ),
  ];
};

export const test = (ctx: CanvasRenderingContext2D) => {
  const r = tile1(rhomb1(Vec2(400, 0)).translate(Vec2(900, 500)));
  //r.draw(ctx);
  //r.children().map(g => g.draw(ctx))
  //r.children()[4].children().map(g => g.draw(ctx))
  //r.children().map(c => c.children().map(g => g.draw(ctx)))
  r.children().map(c =>
    c.children().map(d => d.children().map(g => g.getPath()))
  );
};

export default (): Tiling => ({
  getTile: (seed, origin) =>
    tile1(rhomb1(seed).translate(origin || Vec2(0, 0)), undefined, 0),
  tileGenerator: (tile, includeAncestors?, viewport?) =>
    tileGenerator(tile, 0, includeAncestors, viewport),
});
