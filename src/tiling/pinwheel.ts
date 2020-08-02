// Reference: https://tilings.math.uni-bielefeld.de/substitution/pinwheel/

import { TileSet, createTriangleTile, TriangleTile } from "../classes/Tile";
import { Triangle } from "../classes/Polygon";
import { V } from "../classes/V";

const protos = ["triangle", "mirrored"];

const root = (l: V): TriangleTile =>
  createTriangleTile(
    Triangle(l, V(0, 0), l.perp().scale(2)),
    parentFromC,
    children,
    "triangle"
  );

const children = (t: TriangleTile) => generateFromA(subAFromParent(t));

const protoed = (t: Triangle, k: string) => ({ ...t, proto: k });

// A->B is S side, B->C is M side, C->A is L side.
const parentFromC = (t: TriangleTile): Triangle & { proto: string } => {
  const m = t.b.subtract(t.c);
  const s = t.b.subtract(t.a);
  return protoed(
    Triangle(t.a.add(m.scale(0.5)), t.b.add(s), t.a.subtract(m.scale(2))),
    t.proto
  );
};

const subAFromParent = (t: TriangleTile): Triangle & { proto: string } => {
  const l = t.a.subtract(t.c);
  const m = t.b.subtract(t.c);
  return protoed(
    Triangle(t.c.add(m.scale(0.5)), t.c.add(l.scale(2 / 5)), t.c),
    protos[(protos.indexOf(t.proto) + 1) % 2]
  );
};

const generateFromA = (t: Triangle & { proto: string }) => {
  const i = protos.indexOf(t.proto);
  //      A
  //   /  |
  // C----B
  const B = (a: Triangle) => Triangle(a.a, a.b, a.b.add(a.b.subtract(a.c)));

  // B----C
  // |  /
  // A
  const C = (b: Triangle) => Triangle(b.c, b.c.add(b.a.subtract(b.b)), b.a);
  // A
  // |  \
  // B----C
  const D = (c: Triangle) => Triangle(c.b.add(c.b.subtract(c.a)), c.b, c.c);
  //    C
  //   /|
  //  / |
  // A--B
  const E = (d: Triangle) => {
    const l = d.b.subtract(d.a);
    const eb = d.b.add(l);
    //const ea = eb.add(l.perp().invert());
    const ea = d.b.subtract(d.c).scale(0.5).add(d.b).add(d.b.subtract(d.a));
    return Triangle(ea, eb, d.a);
  };
  const b = B(t);
  const c = C(b);
  const d = D(c);
  return [
    protoed(c, protos[(i + 1) % 2]),
    protoed(t, protos[i]),
    protoed(b, protos[(i + 1) % 2]),
    protoed(d, protos[i]),
    protoed(E(d), protos[i])
  ];
};

export default TileSet(root, protos);
