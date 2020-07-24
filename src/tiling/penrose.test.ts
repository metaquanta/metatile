import { V } from "../classes/V";
import { penrose } from "./penrose";

/*const children1 = (r1: Rhomb) => {
  const r = r1.translate(r1.c.invert());
  const u = r.b.scale(DF);
  const v = r.d.scale(DF);
  return [
    tile1(Rhomb(r.c, v, u.add(v), u)),
    tile1(Rhomb(r.b, u.add(v), r.a, r.a.subtract(u.add(v)).add(r.b))),
    tile1(Rhomb(r.d, r.a.subtract(u.add(v)).add(r.d), r.a, u.add(v))),
    tile2(Rhomb(r.b, r.b.add(v.invert()), u, u.add(v))),
    tile2(Rhomb(r.d, u.add(v), v, r.d.add(u.invert())))
  ].map(r => r.translate(r1.c));
}

const children2 = (r2: Rhomb): Tile[] => {
  const r = r2.translate(r2.a.invert());
  const u = r.b.scale(DF);
  const v = r.d.scale(DF);
  return [
    tile1(Rhomb(r.a, v.invert(), r.b, r.b.add(v))),
    tile1(Rhomb(r.a, r.d.add(u), r.d, u.invert())),
    tile2(Rhomb(r.c, r.a, v.add(r.b), r.c.add(v).add(r.b))),
    tile2(Rhomb(r.c, r.c.add(u).add(r.d), u.add(r.d), r.a))
  ].map(r => r.translate(r2.a))
}*/

test("penrose parent inverts children", () => {
  const u = V(400, 0);
  const v = V(900, 200);
  const r = penrose.tileFromEdge(u, v);
  const s = r.parent().children()[0];
  vecsEqual(r.vertices()[0], s.vertices()[0]);
  vecsEqual(r.vertices()[1], s.vertices()[1]);
  vecsEqual(r.vertices()[2], s.vertices()[2]);
  vecsEqual(r.vertices()[3], s.vertices()[3]);
});

test("penrose romb1 children", () => {
  const r = penrose.tileFromEdge(V(400, 0), V(900, 200));
  const c = r.children();
  vecsEqual(r.vertices()[2], c[0].vertices()[0]);
  vecsEqual(r.vertices()[1], c[1].vertices()[0]);
  vecsEqual(r.vertices()[0], c[1].vertices()[2]);
  vecsEqual(r.vertices()[3], c[2].vertices()[0]);
  vecsEqual(r.vertices()[0], c[2].vertices()[2]);
  vecsEqual(r.vertices()[1], c[3].vertices()[0]);
  vecsEqual(r.vertices()[3], c[4].vertices()[0]);
});

test("penrose romb1 grand-children", () => {
  const r = penrose.tileFromEdge(V(400, 0), V(900, 200)).children()[0];
  const c = r.children();
  vecsEqual(r.vertices()[2], c[0].vertices()[0]);
  vecsEqual(r.vertices()[1], c[1].vertices()[0]);
  vecsEqual(r.vertices()[0], c[1].vertices()[2]);
  vecsEqual(r.vertices()[3], c[2].vertices()[0]);
  vecsEqual(r.vertices()[0], c[2].vertices()[2]);
  vecsEqual(r.vertices()[1], c[3].vertices()[0]);
  vecsEqual(r.vertices()[3], c[4].vertices()[0]);
});

test("penrose romb2 children", () => {
  const r = penrose.tileFromEdge(V(400, 0), V(900, 200)).children()[3];
  const c = r.children();
  vecsEqual(r.vertices()[0], c[0].vertices()[0]);
  vecsEqual(r.vertices()[1], c[0].vertices()[2]);
  vecsEqual(r.vertices()[0], c[1].vertices()[0]);
  vecsEqual(r.vertices()[3], c[1].vertices()[2]);
  vecsEqual(r.vertices()[2], c[2].vertices()[0]);
  vecsEqual(r.vertices()[0], c[2].vertices()[1]);
  vecsEqual(r.vertices()[2], c[3].vertices()[0]);
  vecsEqual(r.vertices()[0], c[3].vertices()[3]);
});

const vecsEqual = (u: V, v: V) => {
  expect(u.x).toBeCloseTo(v.x);
  expect(u.y).toBeCloseTo(v.y);
};
