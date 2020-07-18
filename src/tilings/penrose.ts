import { Rhomb, Vec2, Tile } from "../Tiles";

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

const tile1 = (r: Rhomb): Tile =>
  Tile(r.polygon(), () => children1(r), () => parent(r));

const tile2 = (r: Rhomb): Tile =>
  Tile(r.polygon(), () => children2(r));

/*const rhomb2 = (u: Vec2) => {
  const v = rotate(u);
  return Rhomb(Vec2(0, 0), u, u.add(v), v);
};*/

const parent = (r1: Rhomb): Tile => {
  const r = r1.translate(r1.a.invert());
  const u = r.b.scale(IF);
  const v = r.d.scale(IF);
  return tile1(Rhomb(u.add(v), v, r.a, u).translate(r1.a));
}

const children1 = (r1: Rhomb) => {
  const r = r1.translate(r1.c.invert());
  const u = r.b.scale(DF);
  const v = r.d.scale(DF);
  return [
    Rhomb(r.c, v, u.add(v), u),
    //Rhomb(r.b, u.add(v), r.a, r.a.subtract(u.add(v)).add(r.b)),
    Rhomb(r.d, r.a.subtract(u.add(v)).add(r.d), r.a, u.add(v))
  ].map(r => r.translate(r1.c)).map(r => tile1(r)).concat(
    [
      Rhomb(r.b, r.b.add(v.invert()), u, u.add(v)),
      //Rhomb(r.d, u.add(v), v, r.d.add(u.invert()))
    ].map(r => r.translate(r1.c)).map(r => tile2(r)));
}

const children2 = (r2: Rhomb): Tile[] => {
  const r = r2.translate(r2.a.invert());
  const u = r.b.scale(DF);
  //const v = r.d.scale(DF);
  return [
    //tile1(Rhomb(r.b, r.b.add(v), r.a, v.invert()).translate(r2.a)),
    tile1(Rhomb(r.d, u.invert(), r.a, r.d.add(u)).translate(r2.a)),
    //tile2(Rhomb(r.c, r.a, v.add(r.b), r.c.add(v).add(r.b)).translate(r2.a)),
    tile2(Rhomb(r.c, r.c.add(u).add(r.d), u.add(r.d), r.a).translate(r2.a))
  ]
}

export const test = (ctx: CanvasRenderingContext2D) => {
  const r = tile1(rhomb1(Vec2(400, 0)).translate(Vec2(900, 500)));
  //r.draw(ctx);
  //r.children().map(g => g.draw(ctx))
  //r.children()[4].children().map(g => g.draw(ctx))
  //r.children().map(c => c.children().map(g => g.draw(ctx)))
  r.children().map(c => c.children().map(d => d.children().map(g => g.getPath())))
}

export default (seed: Vec2, origin = Vec2(0, 0)) => ({
  tile: tile1(rhomb1(seed).translate(origin)),

});