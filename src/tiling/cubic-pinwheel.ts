// Reference: https://tilings.math.uni-bielefeld.de/substitution/cubic-pinwheel/
import { Triangle } from "../classes/Polygon";
import { oneWayPrototile, Prototile, reflect } from "../classes/Tile";
import { V } from "../classes/V";
import { Rule } from "../classes/Rule";

// real positive root of -x^8 + x^4 + x^2 + 1
//const c = 1.21060779440609;
const c =
  1 /
  (3 /
    (1 +
      (29 / 2 - (3 / 2) * 93 ** (1 / 2)) ** (1 / 3) +
      ((29 + 3 * 93 ** (1 / 2)) / 2) ** (1 / 3))) **
    (1 / 2);
const isoSide = c ** 6;
const scaSides = [c ** 2, c ** 6];
//TODO!!! This is wrong. The children aren't this tall.
const isoHeight = (1 / 4 + c ** 6) ** (1 / 2);

const iso1: Prototile = Prototile<Triangle>(
  (t) =>
    iso3.create(
      Triangle(
        t.b,
        t.c
          .subtract(t.a)
          .scale(c ** 6)
          .add(t.a),
        t.a
      )
    ),
  (t) => [iso2.create(t)],
  1,
  true
);

const iso2: Prototile = Prototile<Triangle>(
  (t) => iso1.create(t),
  (t) => [iso3.create(t)],
  1,
  true
);

const iso3: Prototile = Prototile<Triangle>(
  (t) => iso2.create(t),
  (t) => {
    const p = t.b
      .subtract(t.c)
      .scale(1 / isoSide)
      .add(t.c);
    return [
      iso1.create(Triangle(t.c, t.a, p)),
      reflect(sca2.create(Triangle(t.a, p, t.b)))
    ];
  },
  1,
  true
);

const sca1: Prototile = oneWayPrototile<Triangle>(
  (t: Triangle) => [sca2.create(t)],
  1,
  false
);

const sca2: Prototile = oneWayPrototile(
  (t: Triangle) => [sca3.create(t)],
  1,
  false
);

const sca3: Prototile = oneWayPrototile(
  (t: Triangle) => {
    const p1 = t.c
      .subtract(t.a)
      .scale(1 / scaSides[1])
      .add(t.a);
    const p2 = t.a
      .subtract(t.c)
      .scale(scaSides[0] / scaSides[1])
      .add(t.c);
    return [
      reflect(sca1.create(Triangle(t.a, p1, t.b))),
      iso1.create(Triangle(p1, t.b, p2)),
      reflect(sca2.create(Triangle(t.b, p2, t.c)))
    ];
  },
  1,
  false
);

export default Rule(
  (l, v) =>
    iso1.create(
      Triangle(
        V(0, 0),
        l
          .perp()
          .scale(isoHeight)
          .add(l.scale(1 / 2)),
        l
      ).translate(v)
    ),
  [iso1, iso2, iso3, sca1, sca2, sca3]
);
