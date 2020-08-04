import { Polygon } from "./Polygon";

export interface Prototile {
  rotationalSymmetryOrder: number;
  reflectionSymmetry: boolean;
  coveringGenerations?: number; // See N.V.H. below
  parent?: (t: Tile) => Tile;
  children: (t: Tile) => Tile[];
  create: (polygon: Polygon, parent?: Tile) => Tile;
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
  reflect: () => Tile;
  reflected: boolean;
}

export function singlePrototile<P extends Polygon>(
  parent: (t: P) => P,
  children: (t: P) => P[],
  rotationalSymmetryOrder: number
): Prototile {
  return {
    rotationalSymmetryOrder: rotationalSymmetryOrder,
    reflectionSymmetry: true,
    parent(t) {
      return this.create(parent(t.polygon() as P));
    },
    children(t) {
      return children(t.polygon() as P).map((p) => this.create(p, t));
    },
    create(p, t?): Tile {
      return new _Tile(p, this, t);
    }
  };
}

export function Prototile<P extends Polygon>(
  parent: (t: P) => Tile,
  children: (t: P) => Tile[],
  rotationalSymmetryOrder: number,
  reflectionSymmetry: boolean
): Prototile {
  return {
    rotationalSymmetryOrder: rotationalSymmetryOrder,
    reflectionSymmetry: reflectionSymmetry,
    parent(t) {
      return parent(t.polygon() as P);
    },
    children(t) {
      return children(t.polygon() as P).map((c) => c.setParent(t));
    },
    create(p): Tile {
      return new _Tile(p, this);
    }
  };
}

export function oneWayPrototile<P extends Polygon>(
  children: (t: P) => Tile[],
  rotationalSymmetryOrder: number,
  reflectionSymmetry: boolean
): Prototile {
  return {
    rotationalSymmetryOrder: rotationalSymmetryOrder,
    reflectionSymmetry: reflectionSymmetry,
    children(t) {
      return children(t.polygon() as P).map((c) => c.setParent(t));
    },
    create(p): Tile {
      return new _Tile(p, this);
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

export function reflect(t: Tile): Tile {
  return t.reflect();
}

class _Tile implements Tile {
  _polygon: Polygon;
  _parent?: Tile;
  proto: Prototile;
  reflected: boolean;
  constructor(
    p: Polygon,
    proto: Prototile,
    parent?: Tile,
    reflected?: boolean
  ) {
    this._polygon = p;
    this._parent = parent;
    this.proto = proto;
    // If reflected is set, assume it's meant. Otherwise, inherit from parent.
    this.reflected =
      reflected === undefined
        ? parent !== undefined && parent.reflected
        : reflected;
  }

  reflect(): Tile {
    // Flip reflected if relevant.
    // This may unreflect it if it was already reflected due to parent.
    return new _Tile(this._polygon, this.proto, this._parent, !this.reflected);
  }

  setParent(p: Tile): Tile {
    return new _Tile(this._polygon, this.proto, p, this.reflected);
  }

  parent(): Tile {
    if (this._parent !== undefined) return this._parent;
    if (this.proto.parent !== undefined) return this.proto.parent(this);
    console.trace("!!!Unreachable reached!!!");
    throw new Error(`tile.paren() not supported on ${this}`);
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
    parent?: Tile,
    reflected?: boolean
  ) {
    super(p, proto, parent, reflected);
    this.intersectingGenerations = intersectingGenerations;
    this.intersectsMemo = [];
    if (parent) this._parent = parent;
  }

  setParent(p: Tile): Tile {
    return new _NvhTile(
      this._polygon,
      this.proto,
      this.intersectingGenerations,
      p,
      this.reflected
    );
  }

  reflect(): Tile {
    // Flip reflected if relevant.
    // This may unreflect it if it was already reflected due to parent.
    return new _NvhTile(
      this._polygon,
      this.proto,
      this.intersectingGenerations,
      this._parent,
      !this.reflected
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
