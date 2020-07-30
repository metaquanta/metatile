import { Polygon, Triangle } from "../classes/Polygon";
import { TileSet, TriangleTile } from "../classes/Tile";
import { V } from "../classes/V";

// Ref: https://tilings.math.uni-bielefeld.de/substitution/cubic-pinwheel/

// real positive root of -x^8 + x^4 + x^2 + 1
//const c = 1.21060779440609;
const c =
  1 /
  (3 /
    (1 +
      (29 / 2 - (3 / 2) * 93 ** (1 / 2)) ** (1 / 3) +
      ((29 + 3 * 93 ** (1 / 2)) / 2) ** (1 / 3))) **
    (1 / 2);
const isoSides = [1, c ** 3, c ** 3];
const scaSides = [1, c, c ** 3];
const isoHeight = (1 / 4 + c ** 6) ** (1 / 2);

function TileFactory(
  kind: string,
  parent: ((t: TriangleTile) => TriangleTile) | undefined,
  children: (t: TriangleTile) => TriangleTile[]
): {
  fromTriangle: (t: Triangle, p?: TriangleTile) => TriangleTile;
  fromEdge: (l: V, p?: V) => TriangleTile;
} {
  return {
    fromTriangle(t: Triangle, p?: TriangleTile) {
      return {
        ...t,
        kind,
        rotationalSymmetry: 1,
        parent() {
          if (p !== undefined) return p;
          if (parent !== undefined) return parent(this);
          // TODO!!
          console.error("!!!Unreachable!!");
          return this;
        },
        children() {
          return children(this);
        },
        translate: (v: V) =>
          this.fromTriangle(t.translate(v), (p as TriangleTile).translate(v)),
        equals(p: Polygon) {
          if ((p as TriangleTile).kind === undefined) return false;
          if ((p as TriangleTile).kind === kind) return t.equals(p);
          return false;
        }
      };
    },
    fromEdge(l, p = V(0, 0)) {
      const t = Triangle(
        V(0, 0),
        l
          .perp()
          .scale(isoHeight)
          .add(l.scale(1 / 2)),
        l
      ).translate(p);
      return {
        ...t,
        kind,
        rotationalSymmetry: 1,
        parent() {
          // TODO
          if (parent === undefined) {
            return this;
          }
          return parent(this);
        },
        children() {
          return children(this);
        },
        translate: (v: V) => this.fromEdge(l, p.add(v)),
        equals(p: Polygon) {
          if ((p as TriangleTile).kind === undefined) return false;
          if ((p as TriangleTile).kind === kind) return t.equals(p);
          return false;
        }
      };
    }
  };
}

/*function rootIso1(l: V, p: V = V(0, 0)): TriangleTile {
  const t = Triangle(
    V(0, 0),
    l
      .perp()
      .scale(isoHeight)
      .add(l.scale(1 / 2)),
    l
  ).translate(p);
  return {
    ...t,
    kind: "Iso1",
    rotationalSymmetry: 1,
    parent() {
      return rootIso3(this.a.subtract(this.b), this.b);
    },
    children() {
      return [Iso2(this, this)];
    },
    translate(v: V) {
      return rootIso1(l, p.add(v));
    },
    equals(p: Polygon) {
      if ((p as TriangleTile).kind === undefined) return false;
      if ((p as TriangleTile).kind === "Iso1") return t.equals(p);
      return false;
    }
  };

}

function rootIso2(l: V, p: V = V(0, 0)): TriangleTile {
  const t = Triangle(
    V(0, 0),
    l
      .perp()
      .scale(isoHeight)
      .add(l.scale(1 / 2)),
    l
  ).translate(p);
  return {
    ...t,
    kind: "Iso1",
    rotationalSymmetry: 1,
    parent() {
      return rootIso1(this.c.subtract(this.a), this.a);
    },
    children() {
      return [Iso3(this, this)];
    },
    translate(v: V) {
      return rootIso1(l, p.add(v));
    },
    equals(p: Polygon) {
      return false;
    }
  };
}

function rootIso3(l: V, p: V = V(0, 0)): TriangleTile {
  return {
    ...Triangle(
      V(0, 0),
      l
        .perp()
        .scale(isoHeight)
        .add(l.scale(1 / 2)),
      l
    ).translate(p),
    kind: "Iso1",
    rotationalSymmetry: 1,
    parent() {
      return rootIso2(this.c.subtract(this.a), this.a);
    },
    children() {
      const p = this.b
        .subtract(this.c)
        .scale(1 / isoSides[1] ** 2)
        .add(this.c);
      return [
        Iso1(Triangle(this.c, this.a, p), this),
        mSca2(Triangle(this.a, p, this.b), this)
      ];
    },
    translate(v: V) {
      return rootIso1(l, p.add(v));
    },
    equals(p: Polygon) {
      return false;
    }
  };
}*/

const iso1Factory = TileFactory(
  "Iso1",
  (t) =>
    iso3Factory.fromTriangle(
      Triangle(
        t.b,
        t.c
          .subtract(t.a)
          .scale(c ** 6)
          .add(t.a),
        t.a
      )
    ),
  (t) => [Iso2(t, t)]
);
const Iso1 = (t: Triangle, p: TriangleTile) => iso1Factory.fromTriangle(t, p);

const iso2Factory = TileFactory(
  "Iso2",
  (t) => iso1Factory.fromTriangle(t),
  (t) => [Iso3(t, t)]
);
const Iso2 = (t: Triangle, p: TriangleTile) => iso2Factory.fromTriangle(t, p);

const iso3Factory = TileFactory(
  "Iso3",
  (t) => iso2Factory.fromTriangle(t),
  (t) => {
    const p = t.b
      .subtract(t.c)
      .scale(1 / isoSides[1] ** 2)
      .add(t.c);
    return [Iso1(Triangle(t.c, t.a, p), t), mSca2(Triangle(t.a, p, t.b), t)];
  }
);
const Iso3 = (t: Triangle, p: TriangleTile) => iso3Factory.fromTriangle(t, p);

const sca1Factory = TileFactory("Sca1", undefined, (t: TriangleTile) => [
  Sca2(t, t)
]);
const Sca1 = (t: Triangle, p: TriangleTile) => sca1Factory.fromTriangle(t, p);

const mSca1Factory = TileFactory("mSca1", undefined, (t: TriangleTile) => [
  mSca2(t, t)
]);
const mSca1 = (t: Triangle, p: TriangleTile) => mSca1Factory.fromTriangle(t, p);

const sca2Factory = TileFactory("Sca2", undefined, (t: TriangleTile) => [
  Sca3(t, t)
]);
const Sca2 = (t: Triangle, p: TriangleTile) => sca2Factory.fromTriangle(t, p);

const mSca2Factory = TileFactory("mSca2", undefined, (t: TriangleTile) => [
  mSca3(t, t)
]);
const mSca2 = (t: Triangle, p: TriangleTile) => mSca2Factory.fromTriangle(t, p);

const sca3Factory = TileFactory("Sca3", undefined, (t: TriangleTile) => {
  const p1 = t.c
    .subtract(t.a)
    .scale(1 / scaSides[2] ** 2)
    .add(t.a);
  const p2 = t.a
    .subtract(t.c)
    .scale(scaSides[1] ** 2 / scaSides[2] ** 2)
    .add(t.c);
  return [
    mSca1(Triangle(t.a, p1, t.b), t),
    Iso1(Triangle(p1, t.b, p2), t),
    mSca2(Triangle(t.b, p2, t.c), t)
  ];
});
const Sca3 = (t: Triangle, p: TriangleTile) => sca3Factory.fromTriangle(t, p);

const mSca3Factory = TileFactory("mSca3", undefined, (t: TriangleTile) => {
  const p1 = t.c
    .subtract(t.a)
    .scale(1 / scaSides[2] ** 2)
    .add(t.a);
  const p2 = t.a
    .subtract(t.c)
    .scale(scaSides[1] ** 2 / scaSides[2] ** 2)
    .add(t.c);
  return [
    Sca1(Triangle(t.a, p1, t.b), t),
    Iso1(Triangle(p2, t.b, p1), t),
    Sca2(Triangle(t.b, p2, t.c), t)
  ];
});
const mSca3 = (t: Triangle, p: TriangleTile) => mSca3Factory.fromTriangle(t, p);

export default TileSet((u) => iso1Factory.fromEdge(u, V(0, 0)), [
  "Iso1",
  "Iso2",
  "Iso3",
  "Sca1",
  "Sca2",
  "Sca3",
  "mSca1",
  "mSca2",
  "mSca3"
]);
