// Reference: https://tilings.math.uni-bielefeld.de/substitution/cubic-pinwheel/
import { Triangle } from "../classes/Polygon";
import { TileSet, TriangleTile, createTile } from "../classes/Tile";
import { V } from "../classes/V";

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
const isoHeight = (1 / 4 + c ** 6) ** (1 / 2);

const iso1Factory = (triangle: Triangle): TriangleTile =>
  createTile(
    "Iso1",
    triangle,
    (t) => [iso2Factory(t)],
    (t) =>
      iso3Factory(
        Triangle(
          t.b,
          t.c
            .subtract(t.a)
            .scale(c ** 6)
            .add(t.a),
          t.a
        )
      )
  );

const iso2Factory = (triangle: Triangle): TriangleTile =>
  createTile(
    "Iso2",
    triangle,
    (t) => [iso3Factory(t)],
    (t) => iso1Factory(t)
  );

const iso3Factory = (triangle: Triangle) =>
  createTile(
    "Iso3",
    triangle,
    (t) => {
      const p = t.b
        .subtract(t.c)
        .scale(1 / isoSide)
        .add(t.c);
      return [
        iso1Factory(Triangle(t.c, t.a, p)),
        mSca2Factory(Triangle(t.a, p, t.b), t)
      ];
    },
    (t) => iso2Factory(t)
  );

const sca1Factory = (triangle: Triangle, parent: TriangleTile): TriangleTile =>
  createTile(
    "Sca1",
    triangle,
    (t: TriangleTile) => [sca2Factory(t, t)],
    parent
  );

const mSca1Factory = (triangle: Triangle, parent: TriangleTile): TriangleTile =>
  createTile(
    "mSca1",
    triangle,
    (t: TriangleTile) => [mSca2Factory(t, t)],
    parent
  );

const sca2Factory = (triangle: Triangle, parent: TriangleTile): TriangleTile =>
  createTile(
    "Sca2",
    triangle,
    (t: TriangleTile) => [sca3Factory(t, t)],
    parent
  );

const mSca2Factory = (triangle: Triangle, parent: TriangleTile) =>
  createTile(
    "mSca2",
    triangle,
    (t: TriangleTile) => [mSca3Factory(t, t)],
    parent
  );

const sca3Factory = (triangle: Triangle, parent: TriangleTile) =>
  createTile(
    "Sca3",
    triangle,
    (t: TriangleTile) => {
      const p1 = t.c
        .subtract(t.a)
        .scale(1 / scaSides[1])
        .add(t.a);
      const p2 = t.a
        .subtract(t.c)
        .scale(scaSides[0] / scaSides[1])
        .add(t.c);
      return [
        mSca1Factory(Triangle(t.a, p1, t.b), t),
        iso1Factory(Triangle(p1, t.b, p2)),
        mSca2Factory(Triangle(t.b, p2, t.c), t)
      ];
    },
    parent
  );

const mSca3Factory = (triangle: Triangle, parent: TriangleTile) =>
  createTile(
    "mSca3",
    triangle,
    (t: TriangleTile) => {
      const p1 = t.c
        .subtract(t.a)
        .scale(1 / scaSides[1])
        .add(t.a);
      const p2 = t.a
        .subtract(t.c)
        .scale(scaSides[0] / scaSides[1])
        .add(t.c);
      return [
        sca1Factory(Triangle(t.a, p1, t.b), t),
        iso1Factory(Triangle(p2, t.b, p1)),
        sca2Factory(Triangle(t.b, p2, t.c), t)
      ];
    },
    parent
  );

export default TileSet(
  (l, v) =>
    iso1Factory(
      Triangle(
        V(0, 0),
        l
          .perp()
          .scale(isoHeight)
          .add(l.scale(1 / 2)),
        l
      ).translate(v)
    ),
  ["Iso1", "Iso2", "Iso3", "Sca1", "Sca2", "Sca3", "mSca1", "mSca2", "mSca3"]
);
