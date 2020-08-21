import { Polygon } from "../lib/math/2d/Polygon.js";
import { V } from "../lib/math/2d/V.js";
import { Tile } from "./Tile.js";

export interface Prototile {
  readonly rotationalSymmetryOrder: number;
  readonly reflectionSymmetry: boolean;
  readonly coveringGenerations?: number; // See N.V.H. below
  readonly parent?: (t: Tile) => Tile;
  readonly children: (t: Tile) => Tile[];
  readonly tile?: (v: V, p: V) => Tile;
  readonly create: (polygon: Polygon, parent?: Tile) => Tile;
  readonly name?: string;
  readonly toString: () => string;
}

export type PrototileParameters<P extends Polygon> = {
  parent?: (t: P) => Tile;
  children: (t: P) => Tile[];
  tile?: (v: V, p: V) => Polygon;
  rotationalSymmetryOrder: number;
  reflectionSymmetry: boolean;
  name: string;
  volumeHierarchic: boolean;
  // Non-volume-hierarchical. A.K.A. N.V.H.
  // NVH implies t's descendents don't cover t, coveringGenerations is the min.
  // levels above t with leaves that cover t.
  // Once a covering tile is found, apply .parent() this many more times.
  coveringGenerations?: number;
  // NVH implies t doesn't cover t's descendents, intersectingGenerations is
  // the min.levels about t that covers all of t's leaves.
  // If t intersects the viewport, t', t'', ...t^n are assumed to also.
  intersectingGenerations?: number;
};

export function Prototile<P extends Polygon>(
  params: PrototileParameters<P>
): Prototile {
  const proto: Prototile = {
    rotationalSymmetryOrder: params.rotationalSymmetryOrder,
    reflectionSymmetry: params.reflectionSymmetry,
    name: params.name,
    parent(t) {
      if (params.parent) return params.parent(t.polygon() as P);
      throw new Error(`Prototile.parent() - unsupported by ${this}!!`);
    },
    children(t) {
      return params.children(t.polygon() as P);
    },
    create(p): Tile {
      return Tile(
        p,
        this,
        params.volumeHierarchic,
        params.intersectingGenerations
      );
    },
    toString() {
      return `Prototile(□,□,${this.rotationalSymmetryOrder},${this.reflectionSymmetry},${this.name})`;
    }
  };

  if (params.tile === undefined) return proto;
  return {
    ...proto,
    tile(u, v) {
      return this.create((params.tile as (v: V, p: V) => Polygon)(u, v));
    }
  };
}
