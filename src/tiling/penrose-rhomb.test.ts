import { V } from "../classes/V";
import { vsEqual } from "../util";
import penrose from "./penrose-rhomb";

test("penrose parent inverts children", () => {
  const u = V(400, 0);
  const v = V(900, 200);
  const r = penrose.tileFromEdge(u, v);
  const s = r.parent().children()[0];
  expect(vsEqual(r.a, s.a)).toBeTruthy();
  expect(vsEqual(r.b, s.b)).toBeTruthy();
  expect(vsEqual(r.c, s.c)).toBeTruthy();
  expect(vsEqual(r.d, s.d)).toBeTruthy();
});

test("penrose romb1 children", () => {
  const r = penrose.tileFromEdge(V(400, 0), V(900, 200));
  const c = r.children();
  expect(vsEqual(r.c, c[0].a)).toBeTruthy();
  expect(vsEqual(r.d, c[1].a)).toBeTruthy();
  expect(vsEqual(r.a, c[1].c)).toBeTruthy();
  expect(vsEqual(r.b, c[2].a)).toBeTruthy();
});

test("penrose romb2 children", () => {
  const r = penrose.tileFromEdge(V(400, 0), V(900, 200)).children()[2];
  const c = r.children();
  expect(vsEqual(r.a, c[0].c)).toBeTruthy();
  expect(vsEqual(r.d, c[0].a)).toBeTruthy();
  expect(vsEqual(r.c, c[1].a)).toBeTruthy();
});
