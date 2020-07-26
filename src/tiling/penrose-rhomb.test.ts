import { V } from "../classes/V";
import penrose from "./penrose";

test("penrose parent inverts children", () => {
  const u = V(400, 0);
  const v = V(900, 200);
  const r = penrose.tileFromEdge(u, v);
  const s = r.parent().children()[0];
  vecsEqual(r.a, s.a);
  vecsEqual(r.b, s.b);
  vecsEqual(r.c, s.c);
  vecsEqual(r.d, s.d);
});

test("penrose romb1 children", () => {
  const r = penrose.tileFromEdge(V(400, 0), V(900, 200));
  const c = r.children();
  vecsEqual(r.c, c[0].a);
  vecsEqual(r.d, c[1].a);
  vecsEqual(r.a, c[1].c);
  vecsEqual(r.b, c[2].a);
});

/*test("penrose romb1 grand-children", () => {
  const r = penrose.tileFromEdge(V(400, 0), V(900, 200)).children()[0];
  const c = r.children();
  vecsEqual(r.c, c[0].a);
  vecsEqual(r.b, c[1].a);
  vecsEqual(r.a, c[1].c);
  vecsEqual(r.d, c[2].a);
  vecsEqual(r.a, c[2].c);
  vecsEqual(r.b, c[3].a);
  vecsEqual(r.d, c[4].a);
});*/

test("penrose romb2 children", () => {
  const r = penrose.tileFromEdge(V(400, 0), V(900, 200)).children()[2];
  const c = r.children();
  vecsEqual(r.a, c[0].c);
  vecsEqual(r.d, c[0].a);
  vecsEqual(r.c, c[1].a);
});

const vecsEqual = (u: V, v: V) => {
  expect(u.x).toBeCloseTo(v.x);
  expect(u.y).toBeCloseTo(v.y);
};
