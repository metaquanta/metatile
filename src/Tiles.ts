export type Tile = {
  parent?: () => Tile,
  children: () => Tile[],
  draw: (ctx: CanvasRenderingContext2D, alpha?: number) => void,
  contains: (p: Vec2) => boolean,
  intersectsRect: (p: Vec2) => boolean
}

export type Polygon = {
  vertices: Vec2[],
  triangles: () => Triangle[],
  contains: (p: Vec2) => boolean,
  intersectsRect: (p: Vec2) => boolean,
  draw: (c: string, ctx: CanvasRenderingContext2D) => void
}

export const Polygon = (vertices: Vec2[]): Polygon => {
  const triangles = () => vertices.slice(2).map((v, i) => Triangle(vertices[0], vertices[i + 1], vertices[i + 2]));
  return ({
    vertices,
    triangles,
    intersectsRect: (viewport: Vec2): boolean => {
      if (
        Math.max(...vertices.map(p => p.x)) > 0 &&
        Math.min(...vertices.map(p => p.x)) < viewport.x &&
        Math.max(...vertices.map(p => p.y)) > 0 &&
        Math.min(...vertices.map(p => p.y)) < viewport.y
      ) {
        return true;
      }
      return false;
    },
    contains: (p) => triangles().map(t => triangleContainsPoint(t, p)).some(b => b),
    draw: (c, context) => {
      let p = new Path2D();
      p.moveTo(vertices[0].x, vertices[0].y);
      vertices.slice(1).forEach(v => p.lineTo(v.x, v.y));
      p.closePath();
      context.fillStyle = c;
      context.fill(p);
    },
  })
}

export type Vec2 = {
  x: number,
  y: number,
  add: (u: Vec2) => Vec2,
  invert: () => Vec2,
  subtract: (u: Vec2) => Vec2,
  scale: (a: number) => Vec2,
  perp: () => Vec2,
  dot: (u: Vec2) => number,
  toString: () => string,
  magnitude: () => number
}

export const Vec2 = (x: number, y: number): Vec2 => ({
  x,
  y,
  add: (u) => Vec2(x + u.x, y + u.y),
  invert: () => Vec2(-x, -y),
  subtract(u) {
    return this.add(u.invert());
  },
  scale: (a) => Vec2(a * x, a * y),
  perp: () => Vec2(y, -x),
  dot: (u) => x * u.x + y * u.y,
  toString: () => `(${x}, ${y})`,
  magnitude: () => Math.sqrt(x * x + y * y)
});

export type Triangle = {
  a: Vec2,
  b: Vec2,
  c: Vec2,
  translate: (v: Vec2) => Triangle,
  polygon: () => Polygon
}

export const Triangle = (a: Vec2, b: Vec2, c: Vec2): Triangle => ({
  a,
  b,
  c,
  translate: (v) => Triangle(a.add(v), b.add(v), c.add(v)),
  polygon: () => Polygon([a, b, c])
});

export type Rhomb = {
  a: Vec2,
  b: Vec2,
  c: Vec2,
  d: Vec2,
  translate: (v: Vec2) => Rhomb,
  //draw(context: CanvasRenderingContext2D, colorizer?: (t: Rhomb) => string): void,
  polygon: () => Polygon
}

export const Rhomb = (a: Vec2, b: Vec2, c: Vec2, d: Vec2): Rhomb => ({
  a,
  b,
  c,
  d,
  translate: (v) => Rhomb(a.add(v), b.add(v), c.add(v), d.add(v)),
  /*draw(context, colorizer = () => "black") {
    let p = new Path2D();
    p.moveTo(this.a.x, this.a.y);
    p.lineTo(this.b.x, this.b.y);
    p.lineTo(this.c.x, this.c.y);
    p.lineTo(this.d.x, this.d.y);
    p.closePath();
    context.fillStyle = colorizer(this);
    context.fill(p);
  },*/
  polygon: () => Polygon([a, b, c, d])
});

const triangleContainsPoint = (t: Triangle, p: Vec2): boolean => {
  const c = t.c.subtract(t.a);
  const b = t.b.subtract(t.a);
  const q = p.subtract(t.a);

  const s0 = c.dot(c);
  const s1 = c.dot(b);
  const s2 = c.dot(q);
  const s3 = b.dot(b);
  const s4 = b.dot(q);

  const x = 1 / (s0 * s3 - s1 * s1);
  const e1 = (s3 * s2 - s1 * s4) * x;
  const e2 = (s0 * s4 - s1 * s2) * x;

  return e1 >= 0 && e2 >= 0 && e1 + e2 < 1;
};

export const getColorizer = (numParts: number, s: number, l: number) => (part: number, theta: number, alpha = 1) => {
  const a = (4 * theta * (360 / numParts) / Math.PI / 2 + part * 360 / numParts) % 360;
  console.log(`color(${part}, ${theta}) [${4 * theta * (1 / numParts) / Math.PI / 2}, ${part * 1 / numParts}]`);
  return `hsla(${a}, ${s}%, ${l}%, ${alpha})`;
}

export const parity = (a: Vec2, b: Vec2) => a.dot(b) > 0 ? 0 : 1;

export const theta = (a: Vec2) => Math.acos(a.dot(Vec2(1, 0)) / a.magnitude());

function tiles(
  viewport: Vec2,
  seed: Tile,
  depth: number
): Generator<Tile> {
  const grow = (t: Tile, p: Vec2): Tile => {
    if (t.contains(p)) return t;
    if (t.parent) return grow(t.parent(), p);
    throw Error("Seed tile missing parent()!");
  };

  const root = grow(
    grow(
      grow(
        grow(seed, viewport), Vec2(0, 0)
      ), Vec2(0, viewport.y)
    ), Vec2(viewport.x, 0)
  );
  //const root = seed;

  console.log(`root: ${root}`)

  function* descend(tile: Tile, d = 1): Generator<Tile> {
    if (d > depth) {
      throw Error(`UNREACHABLE! ${d} > ${depth} `);
    }
    for (let t of tile.children().filter((t) =>
      t.intersectsRect(viewport))) {
      //if (d === depth - 1) yield (t);
      if (d === depth) yield t;
      else yield* descend(t, d + 1);
    }
  }

  return descend(root);
}

function tileViewport(
  context: CanvasRenderingContext2D,
  root: Tile,
  depth: number
) {
  console.log("tileViewport()", depth);

  const generator = (function* () {
    for (let t of tiles(
      Vec2(context.canvas.width, context.canvas.height),
      root,
      depth
    )) {
      yield () => t.draw(context);
    }
  })();

  window.setInterval(() => {
    const { done, value } = generator.next();
    if (!done) console.log(`generator-> ${done}, ${value}`)
    if (!done && value) value();
  }, 1);
}

export { tileViewport };
