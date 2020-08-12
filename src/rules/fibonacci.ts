import { Tetragon, Polygon } from "../lib/math/2d/Polygon";
import { V } from "../lib/math/2d/V";
import { PrototileBuilder } from "../tiles/PrototileBuilder";
import { RuleBuilder } from "../tiles/RuleBuilder";

const PHI = (1 + 5 ** (1 / 2)) / 2;
const PHI_INV = 1 / PHI;
const CHI = 1 / (PHI - 1) + 1;

export default RuleBuilder()
  .protoTile(
    PrototileBuilder({
      name: "square1",
      rotationalSymmetryOrder: 4,
      reflectionSymmetry: true
    }).substitution((t: Polygon, sq1, sq2) => sq2(t))
  )
  .protoTile(
    PrototileBuilder<Tetragon>({
      name: "square2",
      rotationalSymmetryOrder: 4,
      reflectionSymmetry: true
    }).substitution((t, sq1, sq2, rect) => {
      const r = t.translate(t.a.invert());
      const l = r.b.scale(PHI_INV);
      const k = r.d.scale(PHI_INV);
      const e = k.add(r.b);
      const f = l.add(r.d);
      const g = l.add(k);
      sq1(Tetragon(g, e, r.c, f).translate(t.a));
      sq2(Tetragon(r.a, l, g, k).translate(t.a));
      rect(Tetragon(l, r.b, e, g).translate(t.a));
      rect(Tetragon(g, f, r.d, k).translate(t.a));
    })
  )
  .protoTile(
    PrototileBuilder<Tetragon>({
      name: "rectangle",
      rotationalSymmetryOrder: 2,
      reflectionSymmetry: true
    })
      .parent((t, _1, _2, rect) => {
        const l = t.a.subtract(t.b).scale(CHI);
        rect(Tetragon(l.add(t.c), l.add(t.b), t.b, t.c));
      })
      .substitution((r, _, sq2, rect) => {
        const e = r.c.subtract(r.b).scale(PHI_INV).add(r.b);
        const f = r.d.subtract(r.a).scale(PHI_INV).add(r.a);

        rect(Tetragon(e, r.c, r.d, f));
        sq2(Tetragon(r.a, r.b, e, f));
      })
      .tile(
        (l: V, u: V): Tetragon =>
          Tetragon(
            V(0, 0),
            l,
            l.perp().scale(PHI).add(l),
            l.perp().scale(PHI)
          ).translate(u)
      )
  )
  .build();
