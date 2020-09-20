import M from "../lib/math/2d/M";
import { Triangle } from "../lib/math/2d/Polygon";
import V from "../lib/math/2d/V";
import Tile from "../tiles/Tile";
import pinwheel from "./pinwheel";

test("pinwheel", () => {
  const t = pinwheel.tileFromEdge(V.create(100, 0));
  const children = t.children();
  const p = t.polygon() as Triangle;
  const pm = getMatrix(t).invert() as M;
  console.log(`parent: ${p}, m^-1: ${pm}`);
  for (const child of children) {
    const m = getMatrix(child).dot(pm);
    const cp = child.polygon() as Triangle;
    const a = m.dot(p.a);
    const b = m.dot(p.b);
    const c = m.dot(p.c);
    console.log(`child: ${child}, m: ${m} --> ${a}, ${b}, ${c}`);
    expect(a.equals(cp.a)).toBeTruthy();
    expect(b.equals(cp.b)).toBeTruthy();
    expect(c.equals(cp.c)).toBeTruthy();
  }
});

function getMatrix(c: Tile) {
  const p = c.polygon() as Triangle;
  return M.of(p.a.subtract(p.b), p.c.subtract(p.b)).dot(M.translation(p.b));
}
