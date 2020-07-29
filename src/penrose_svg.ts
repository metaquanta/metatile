#!/usr/bin/env node
import rules from "./tiling/rules";
import { V } from "./classes/V";
import { Tiling } from "./classes/Tile";
import { Rect, svgPointsStringFromPolygon } from "./classes/Polygon";
import { colorRotation } from "./renderer/Colorer";
import ArrayLikeIterable from "./classes/ArrayLikeIterable";

const width = 3000;
const height = 2000;

const tileSet = rules["Penrose-Rhomb"];
const tile = tileSet.tileFromEdge(V(25, 5), V(1500, 1500));
const tiles = ArrayLikeIterable(Tiling(tile).cover(Rect(0, 0, 3000, 2000)));
const colorer = colorRotation({
  protos: tileSet.kinds,
  protoSeparation: 3,
  hueOffset: 0.35
});

const enc = new TextEncoder();
process.stdout.write(
  enc.encode(`<svg version="1.1"
     baseProfile="full"
     width="${width}" height="${height}"
     xmlns="http://www.w3.org/2000/svg">`)
);

const polygons = tiles
  .map(
    (t) =>
      `<polygon stroke-linejoin="round"` +
      ` fill="${colorer(t)}" stroke="${"black"}"` +
      ` points="${svgPointsStringFromPolygon(t)}"></polygon>` +
      "\n"
  )
  .map((s) => enc.encode(s));

for (const p of polygons) {
  process.stdout.write(p);
}
process.stdout.write(enc.encode(`</svg>`));
