import { Rhomb } from "../classes/Polygon";
import { V } from "../classes/V";
import penrose from "./penrose-rhomb";

test("penrose parent inverts children", () => {
  const u = V(400, 0);
  const v = V(900, 200);
  const r = penrose.tileFromEdge(u, v);
  const s = r.parent().children()[0];
  expect(r.equals(s)).toBeTruthy();
});

test("penrose romb1 children", () => {
  const r = penrose.tileFromEdge(V(400, 0), V(900, 200));
  const p = r.polygon() as Rhomb;
  const c = r.children().map((c) => c.polygon() as Rhomb);
  expect(p.c.equals(c[0].a)).toBeTruthy();
  expect(p.d.equals(c[1].a)).toBeTruthy();
  expect(p.a.equals(c[1].c)).toBeTruthy();
  expect(p.b.equals(c[2].a)).toBeTruthy();
});

test("penrose romb2 children", () => {
  const r = penrose.tileFromEdge(V(400, 0), V(900, 200)).children()[2];
  const p = r.polygon() as Rhomb;
  const c = r.children().map((c) => c.polygon() as Rhomb);
  expect(p.a.equals(c[0].c)).toBeTruthy();
  expect(p.d.equals(c[0].a)).toBeTruthy();
  expect(p.c.equals(c[1].a)).toBeTruthy();
});
