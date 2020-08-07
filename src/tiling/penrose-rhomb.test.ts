import { Rhomb } from "../classes/Polygon";
import { V } from "../classes/V";
import penrose from "./penrose-rhomb";
import {
  similarChildren,
  inflationFactor,
  canCoverArbitraryVp,
  isVolumeHeirarchical
} from "./rule-sanity-check";

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

test("penrose romb sanity", () => {
  const phi = (1 + 5 ** (1 / 2)) / 2;
  const t = penrose.tile();
  const simChildren = similarChildren(t);
  expect(simChildren.length).toEqual(2);
  // 1.618033988749895 ~= 1.6180339887498956;
  expect(Math.abs(inflationFactor(t, simChildren[0]) - phi)).toBeLessThan(
    0.0000001
  );
  expect(Math.abs(inflationFactor(t, simChildren[1]) - phi)).toBeLessThan(
    0.0000001
  );

  expect(canCoverArbitraryVp(penrose)).toBeTruthy;
  expect(isVolumeHeirarchical(penrose)).toBeFalsy;
});
