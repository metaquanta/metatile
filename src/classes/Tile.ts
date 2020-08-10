import { Polygon, chirality } from "./Polygon";

export interface Prototile {
  rotationalSymmetryOrder: number;
  reflectionSymmetry: boolean;
  coveringGenerations?: number; // See N.V.H. below
  parent?: (t: Tile) => Tile;
  children: (t: Tile) => Tile[];
  create: (polygon: Polygon, parent?: Tile) => Tile;
  name?: string;
  toString: () => string;
}

export interface Tile {
  proto: Prototile;
  parent: () => Tile;
  setParent: (p: Tile) => Tile;
  children: () => Tile[];
  intersects: (p: Polygon, depth?: number) => boolean;
  contains: (p: Polygon, depth?: number) => boolean;
  polygon: () => Polygon;
  equals: (t: this) => boolean;
  reflected: () => boolean;
}

export function Prototile<P extends Polygon>(
  parent: (t: P) => Tile,
  children: (t: P) => Tile[],
  rotationalSymmetryOrder: number,
  reflectionSymmetry: boolean,
  name?: string
): Prototile {
  return {
    rotationalSymmetryOrder: rotationalSymmetryOrder,
    reflectionSymmetry: reflectionSymmetry,
    name,
    parent(t) {
      return parent(t.polygon() as P);
    },
    children(t) {
      return children(t.polygon() as P).map((c) => c.setParent(t));
    },
    create(p): Tile {
      return new _Tile(p, this);
    },
    toString() {
      return `Prototile(□,□,${rotationalSymmetryOrder},${reflectionSymmetry},${name})`;
    }
  };
}

export function oneWayPrototile<P extends Polygon>(
  children: (t: P) => Tile[],
  rotationalSymmetryOrder: number,
  reflectionSymmetry: boolean,
  name?: string
): Prototile {
  return {
    rotationalSymmetryOrder: rotationalSymmetryOrder,
    reflectionSymmetry: reflectionSymmetry,
    name,
    children(t) {
      return children(t.polygon() as P).map((c) => c.setParent(t));
    },
    create(p): Tile {
      return new _Tile(p, this);
    },
    toString() {
      return `Prototile(□,□,${rotationalSymmetryOrder},${reflectionSymmetry},${name})`;
    }
  };
}

// Non-volume-hierarchical. A.K.A. N.V.H.
export function nonVolumeHierarchical(
  proto: Prototile,
  // NVH implies t's descendents don't cover t, coveringGenerations is the min.
  // levels above t with leaves that cover t.
  // Once a covering tile is found, apply .parent() this many more times.
  // 4 for Penrose Rhombs.
  coveringGenerations: number,
  // NVH implies t doesn't cover t's descendents, intersectingGenerations is
  // the min.levels about t that covers all of t's leaves.
  // If t intersects the viewport, t', t'', ...t^n are assumed to also.
  intersectingGenerations: number
): Prototile {
  return {
    ...proto,
    coveringGenerations,
    create(p): Tile {
      return new _NvhTile(p, this, intersectingGenerations);
    }
  };
}

class _Tile implements Tile {
  _polygon: Polygon;
  _parent?: Tile;
  proto: Prototile;
  constructor(p: Polygon, proto: Prototile, parent?: Tile) {
    this._polygon = p;
    this._parent = parent;
    this.proto = proto;
  }

  setParent(p: Tile): Tile {
    return new _Tile(this._polygon, this.proto, p);
  }

  parent(): Tile {
    if (this._parent !== undefined) return this._parent;
    if (this.proto.parent !== undefined) return this.proto.parent(this);
    console.trace("!!!Unreachable reached!!!");
    throw new Error(`tile.paren() not supported on ${this}`);
  }

  reflected(): boolean {
    return !this.proto.reflectionSymmetry && chirality(this.polygon());
  }

  children(): Tile[] {
    return this.proto.children(this);
  }

  polygon() {
    return this._polygon;
  }

  intersects(p: Polygon) {
    return this._polygon.intersects(p);
  }

  contains(p: Polygon) {
    return this._polygon.contains(p);
  }

  equals(t: Tile) {
    return t.proto === this.proto && this._polygon.equals(t.polygon());
  }

  toString() {
    return `Tile(${this._polygon}) [${this.proto}]`;
  }
}

class _NvhTile extends _Tile {
  intersectingGenerations: number;

  intersectsMemo: boolean[];

  constructor(
    p: Polygon,
    proto: Prototile,
    intersectingGenerations: number,
    parent?: Tile
  ) {
    super(p, proto, parent);
    this.intersectingGenerations = intersectingGenerations;
    this.intersectsMemo = [];
    if (parent) this._parent = parent;
  }

  setParent(p: Tile): Tile {
    return new _NvhTile(
      this._polygon,
      this.proto,
      this.intersectingGenerations,
      p
    );
  }

  _intersects(p: Polygon, depth: number): boolean {
    if (depth === 0) return this._polygon.intersects(p);
    if (this._parent === undefined) return true;
    return this._polygon.intersects(p) || this._parent.intersects(p, depth - 1);
  }

  intersects(p: Polygon, depth?: number): boolean {
    if (depth === undefined)
      return this.intersects(p, this.intersectingGenerations);
    //TODO/fixme - assume p is always the one viewport.
    if (this.intersectsMemo[depth] === undefined) {
      this.intersectsMemo[depth] = this._intersects(p, depth);
    }
    return this.intersectsMemo[depth];
  }
}
