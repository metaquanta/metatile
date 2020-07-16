import { Vec2, Rhomb, Tile, getColorizer, parity, theta } from './Tiles';

const SQRT2 = Math.sqrt(2);

const rotate = (origin: Vec2, v: Vec2) => {
  const u = v.subtract(origin);
  const r = Vec2(-1 * u.x * SQRT2 / 2 - u.y * SQRT2 / 2, u.x * SQRT2 / 2 - u.y * SQRT2 / 2);
  console.log(`rotate(${origin}, ${v}) [${u}] => ${r.add(origin)} [${r}]`)
  return r.add(origin);
}

const squareChildren = (sq: Rhomb): Tile[] => {
  const r = sq.translate(sq.a.invert());
  const unit_d = r.c.scale(1 / (2 + SQRT2));
  const unit_d2 = r.d.subtract(r.b).scale(1 / (2 + SQRT2));
  const inner_sq = Rhomb(
    unit_d.scale(1 + SQRT2),
    unit_d2.scale(1 + SQRT2).add(r.b),
    unit_d,
    unit_d2.add(r.b)).translate(sq.a);
  const a = r.b.scale(1 / (1 + SQRT2)).add(sq.a);
  const b = r.c.subtract(r.b).scale(1 / (1 + SQRT2)).add(r.b).add(sq.a);
  const c = r.c.subtract(r.d).scale(1 / (1 + SQRT2)).add(r.d).add(sq.a);
  const d = r.d.scale(1 / (1 + SQRT2)).add(sq.a);
  console.log(`squareChildren: ${a}, ${b}, ${c}, ${d}`)
  return [
    rhomb(Rhomb(sq.a, a, inner_sq.d, inner_sq.c)),
    rhomb(Rhomb(sq.b, b, inner_sq.a, inner_sq.d)),
    rhomb(Rhomb(sq.d, inner_sq.b, inner_sq.a, c)),
    rhomb(Rhomb(sq.a, inner_sq.c, inner_sq.b, d)),
    square(inner_sq),
     square(Rhomb(sq.b, inner_sq.d, a, sq.b.subtract(unit_d))),
  square(Rhomb(sq.c, inner_sq.a, b, b.add(unit_d))),
      square(Rhomb(sq.c, inner_sq.a, c, c.add(unit_d))),
      square(Rhomb(sq.d, inner_sq.b, d, sq.d.subtract(unit_d)))
  ]
}

const rhombChildren = (rh: Rhomb): Tile[] => {
  const r = rh.translate(rh.a.invert());
  const u = r.b.scale(1 / (1 + SQRT2));
  const v = r.d.scale(1 / (1 + SQRT2));
  const rh1 = Rhomb(r.a, u, u.add(v), v).translate(rh.a);
  const rh2 = Rhomb(r.c, r.c.subtract(u), r.c.subtract(u.add(v)), r.c.subtract(v)).translate(rh.a);
  const rh3 = Rhomb(rh.b, rh1.c, rh.d, rh2.c);
  return [
    square(Rhomb(rh.b, rh1.c, rh1.b, rh.b.subtract(rh1.c).add(rh1.b))),
     square(Rhomb(rh.b, rh2.c, rh2.d, rh.b.subtract(rh2.c).add(rh2.d))),
     square(Rhomb(rh.d, rh1.c, rh1.d, rh1.d.subtract(rh1.c).add(rh.d))),
    square(Rhomb(rh.d, rh2.c, rh2.b, rh2.b.subtract(rh2.c).add(rh.d))),
    rhomb(rh1), rhomb(rh2), rhomb(rh3)
  ];
}

const colorizer = getColorizer(4, 85,50);

const drawSquare = (rh: Rhomb, ctx: CanvasRenderingContext2D, alpha:number): void => draw(rh, 0, ctx, alpha);//, 'hsla(90,100%,50%,0.25)');

const drawRhomb = (rh: Rhomb, ctx: CanvasRenderingContext2D, alpha:number): void => draw(rh, 2, ctx, alpha);//, 'hsla(270,100%,50%,0.25)');

const draw = (rh: Rhomb, part: number, ctx: CanvasRenderingContext2D, alpha:number, color?:string) => {
  rh.polygon().draw(
    color ||
    colorizer(part + parity(rh.b.subtract(rh.a), rh.c.subtract(rh.a)), theta(rh.b.subtract(rh.a)), alpha), 
    ctx);
}

const square = (rh: Rhomb): Tile => ({
  parent: () => square(Rhomb(
    rotate(rh.b, rh.a),
    rotate(rh.c, rh.b),
    rotate(rh.d, rh.c),
    rotate(rh.a, rh.d))),
  children: () => squareChildren(rh),
  draw: (ctx, alpha=1) => drawSquare(rh, ctx, alpha),
  contains: (p) => rh.polygon().contains(p),
  intersectsRect: (p) => rh.polygon().intersectsRect(p)
})

const rhomb = (rh: Rhomb): Tile => ({
  children: () => rhombChildren(rh),
  draw: (ctx, alpha=1) => drawRhomb(rh, ctx, alpha),
  contains: (p) => rh.polygon().contains(p),
  intersectsRect: (p) => rh.polygon().intersectsRect(p)
})

const root = (p: Vec2, o:Vec2) => {
  const q = p.perp();
  return square(Rhomb(Vec2(0, 0), p, q.add(p), q).translate(o));
}

export const testTileSet = (ctx: CanvasRenderingContext2D) => {
  const sq = square(Rhomb(Vec2(0, 0), Vec2(400, 0), Vec2(400, 400), Vec2(0, 400)).translate(Vec2(1000,700)));
  sq.draw(ctx, 0.5);
  if (sq.parent) {
    const p = sq.parent();
    p.draw(ctx, 0.5);
    const children = p.children();
    children.forEach(c => {
      c.draw(ctx, 0.5)
    });
    children[0].children().forEach(c => c.draw(ctx, 0.5))
  }
}

export default (seed: Vec2, origin=Vec2(0,0)) => root(seed, origin);