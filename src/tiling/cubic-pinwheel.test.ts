import { RhombTile } from "../classes/Tile";
import { V } from "../classes/V";
import { vsEqual } from "../util";
import cubic from "./cubic-pinwheel";

test("parent inverts children", () => {
  const u = V(400, 0);
  const v = V(900, 200);
  const r = <RhombTile>cubic.tileFromEdge(u, v);
  const s = r.parent().children()[0];
  expect(vsEqual(r.a, s.a)).toBeTruthy();
  expect(vsEqual(r.b, s.b)).toBeTruthy();
  console.log(r.c, s.c);
  expect(vsEqual(r.c, s.c)).toBeTruthy();
  expect(vsEqual(r.d, s.d)).toBeTruthy();
});
