import {Polygon, Tile, TileWithParent, Vec2} from './Tile';

export type Tiling = {
  getTile: (edge: Vec2, pos?: Vec2) => TileWithParent;
  tileGenerator: (
    tile: TileWithParent,
    includeAncestors?: boolean,
    viewport?: ViewPort
  ) => Generator<Tile>;
  numVariants: number;
};

export type ViewPort = {
  x0: number;
  xf: number;
  y0: number;
  yf: number;
  vertices: () => Vec2[];
  toString: () => string;
};

export const ViewPort = (size: Vec2, origin: Vec2): ViewPort => ({
  x0: origin.x,
  xf: origin.x + size.x,
  y0: origin.y,
  yf: origin.y + size.y,
  vertices: () => [
    origin,
    Vec2(size.x, 0).add(origin),
    origin.add(size),
    Vec2(0, size.y).add(origin),
  ],
  toString: () =>
    `⦗↤${origin.x}, ↥${origin.y}, ↦${origin.x + size.x}, ↧${
      origin.y + size.y
    }⦘`,
});

export const getColorizer = (numParts: number, s: number, l: number) => (
  theta: number,
  part = 0,
  alpha = 1
) => {
  const a =
    (theta * 360 / numParts / Math.PI / 2 + part * 360 / numParts) % 360;
  const color = `hsla(${a}, ${s}%, ${l}%, ${alpha})`;
  return color;
};

export const colorStream: (
  n: number,
  s: number,
  l: number,
  alpha?: number,
  i?: number
) => Generator<string> = function* (n, s, l, alpha = 1.0, i = 0) {
  for (; i < 360; i = i + 360 / n) {
    yield `hsla(${i}, ${s}%, ${l}%, ${alpha})`;
  }
  yield* colorStream(n, s, l);
};

export const theta = (a: Vec2) => {
  return Math.atan(a.y/a.x)+(a.x>0 ? Math.PI:0);
}

export const cover = (t: TileWithParent, p: Vec2): Tile => {
  if (t.contains(p)) return t;
  if (t.parent) return cover(t.parent(), p);
  throw Error('Seed tile missing parent()!');
};

export const tileGenerator = function* (
  root: TileWithParent,
  depth: number,
  includeAncestors = false,
  viewport?: ViewPort
): Generator<Tile> {
  function* descend(tile: Tile, d: number): Generator<Tile> {
    for (const t of tile.children()) {
      if (viewport === undefined || t.intersectsViewport(viewport)) {
        if (d === depth) yield t;
        else if (d > depth) {
          if (includeAncestors) yield t;
          yield* descend(t, d - 1);
        }
      }
    }
  }

  function* ascend(tile: TileWithParent): Generator<Tile> {
    console.log(`ascend(${tile.polygon})`);
    const p = tile.parent(); //p.d=+1, tile.d=0

    if (p.depth <= tile.depth) {
      console.log('!!!!!');
      return;
    }
    for (const t of p.children().slice(1)) {
      //p.d=0
      if (viewport === undefined || t.intersectsViewport(viewport)) {
        if (tile.depth === depth) yield t;
        else if (tile.depth > depth) {
          if (includeAncestors) yield t;
          yield* descend(t, tile.depth - 1); // d=-1
        }
      }
    }
    if (
      viewport === undefined ||
      viewport
        .vertices()
        .map(v => p.contains(v))
        .some(b => !b)
    ) {
      yield* ascend(p);
    }
  }

  console.log(`tileGenerator() d=${root.depth} df=${depth}`);

  if (root.depth === depth) yield root;
  yield* ascend(root);
};

function drawPath(context: CanvasRenderingContext2D, polygon: Polygon) {
  const p = polygon.getPath();

  //context.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  context.stroke(p);

  //context.fillStyle = 'rgba(0, 0, 0, 0.05)';
  context.fill(p);
}

function labelVerts(context: CanvasRenderingContext2D, polygon: Polygon) {
  const p = [
    polygon.vertices[1],
    polygon.vertices[polygon.vertices.length - 1],
    polygon.vertices[0].scale(4),
  ]
    .reduce((a, b) => a.add(b))
    .scale(1 / 6);

  context.strokeStyle = 'red';
  context.beginPath();
  context.arc(p.x, p.y, 3, 0, Math.PI * 2);
  context.stroke();

  const q = [
    polygon.vertices[2],
    polygon.vertices[1].scale(4),
    polygon.vertices[0],
  ]
    .reduce((a, b) => a.add(b))
    .scale(1 / 6);

  context.strokeStyle = 'black';
  context.beginPath();
  context.arc(q.x, q.y, 3, 0, Math.PI * 2);
  context.stroke();
}

export function tileViewport(
  context: CanvasRenderingContext2D,
  tile: TileWithParent,
  tiling: Tiling,
  viewPort: ViewPort
) {
  console.log(`tileViewport(${tile.polygon}, ${tiling}, ${viewPort})`);

  const generator: Generator<Tile,Tile> = tiling.tileGenerator(
    tile,
    false,
    viewPort
  );
  const colorer = getColorizer(4, 50, 50);

  const intervalId = window.setInterval(() => {
    for (let i = 0; i < 10; i++) {
      const {done, value} = generator.next();
      if (!done && value) {
        const verts = value.polygon.vertices;
        context.fillStyle = colorer(
          theta(verts[1].subtract(verts[0])),
          2*(value.variant||0)
        );
        drawPath(context, value.polygon);
      }
      if (done) {
        window.clearInterval(intervalId);
        console.log('DONE');
      }
    }
  }, 0);
}
