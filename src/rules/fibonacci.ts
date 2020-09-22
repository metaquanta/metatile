import Polygon, { Tetragon } from "../lib/math/2d/Polygon";
import V from "../lib/math/2d/V";
import Prototile from "../tiles/Prototile";
import Rule from "../tiles/Rule";

const PHI = (1 + 5 ** (1 / 2)) / 2;
const PHI_INV = 1 / PHI;
const CHI = 1 / (PHI - 1) + 1;

export default Rule.builder()
  .protoTile(
    Prototile.builder({
      name: "square1",
      rotationalSymmetryOrder: 4,
      reflectionSymmetry: true
    }).substitution((t: Polygon, sq1, sq2) => sq2(t))
  )
  .protoTile(
    Prototile.builder<Tetragon>({
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
      sq1(Tetragon.create(g, e, r.c, f).translate(t.a));
      sq2(Tetragon.create(r.a, l, g, k).translate(t.a));
      rect(Tetragon.create(l, r.b, e, g).translate(t.a));
      rect(Tetragon.create(g, f, r.d, k).translate(t.a));
    })
  )
  .protoTile(
    Prototile.builder<Tetragon>({
      name: "rectangle",
      rotationalSymmetryOrder: 2,
      reflectionSymmetry: true
    })
      .parent((t, _1, _2, rect) => {
        const l = t.a.subtract(t.b).scale(CHI);
        rect(Tetragon.create(l.add(t.c), l.add(t.b), t.b, t.c));
      })
      .substitution((r, _, sq2, rect) => {
        const e = r.c.subtract(r.b).scale(PHI_INV).add(r.b);
        const f = r.d.subtract(r.a).scale(PHI_INV).add(r.a);

        rect(Tetragon.create(e, r.c, r.d, f));
        sq2(Tetragon.create(r.a, r.b, e, f));
      })
      .tile(
        (i: V, j: V, p: V): Tetragon =>
          Tetragon.create(
            V.origin,
            i,
            j.scale(PHI).add(i),
            j.scale(PHI)
          ).translate(p)
      )
  )
  .build();
