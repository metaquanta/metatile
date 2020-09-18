import { Polygon } from "./lib/math/2d/Polygon";
import { Prototile } from "./tiles/Prototile";
import { Rule } from "./tiles/Rule";
import { Tile } from "./tiles/Tile";

export function similarChildren(parent: Tile): Tile[] {
  const memoedProtos: Prototile[] = [];
  const f = (parent: Tile, proto: Prototile): Tile[] => {
    const children = parent.children();
    const filteredChildren = children.filter((c) => c.proto === proto);
    if (filteredChildren.length > 0) {
      return filteredChildren;
    }
    memoedProtos.push(parent.proto);
    return children
      .filter((c) => memoedProtos.indexOf(c.proto) == -1)
      .flatMap((c) => f(c, proto));
  };
  return f(parent, parent.proto);
}

export function permutedVertices(p: Polygon, q: Polygon): Map<number, number> {
  const map = new Map<number, number>();
  for (let i = 0; i < p.vertices().length; i++) {
    const v = p.vertices()[i];
    for (let j = 0; j < q.vertices().length; j++) {
      const u = q.vertices()[j];
      if (u.equals(v)) {
        console.debug(`p${i + 1} => q${j + 1}`);
        map.set(i, j);
      }
    }
  }
  return map;
}

export function inflationFactor(parent: Tile, child: Tile): number {
  const p = parent.polygon().translate(parent.polygon().vertices()[0].invert());
  const q = child.polygon().translate(child.polygon().vertices()[0].invert());
  return p.vertices()[1].norm() / q.vertices()[1].norm();
}

export function canCoverArbitraryVp(r: Rule): boolean {
  const growthThreshold = 0.05;
  const t = r.tile();
  // This is an arbitrary number of substitutions and many, many more could
  // reasonably be necessary.
  const ancestor = t.parent().parent().parent().parent().parent();
  const inner = t.polygon().boundingBox();
  const w = inner.right - inner.left;
  const h = inner.top - inner.bottom;
  const outer = ancestor.polygon().boundingBox();
  return (
    inner.left - outer.left > w * growthThreshold &&
    outer.right - inner.right > w * growthThreshold &&
    inner.bottom - outer.bottom > h * growthThreshold &&
    outer.top - inner.top > h * growthThreshold
  );
}

const EPS = 0.0001;

export function isVolumeHierarchic(r: Rule): boolean {
  const t = r.tile();
  const p = t.polygon();
  const children = t.children().map((c) => c.polygon());
  if (
    Math.abs(p.area() - children.map((c) => c.area()).reduce((l, r) => l + r)) >
    EPS
  ) {
    // Areas differ.
    return false;
  }

  if (
    children
      .flatMap((c) => c.vertices())
      // TODO
      // remove points on the parent poly. (what about new points?)
      .filter((v) => p.vertices().indexOf(v) === -1)
      // and points contained within the parent poly.
      .filter((v) => !p.contains(v)).length > 0
  ) {
    return false;
  }

  return true;
}
