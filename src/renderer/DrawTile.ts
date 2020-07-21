import { Tile } from "../classes/Tile";

export default function draw(tile: Tile, context: CanvasRenderingContext2D) {
  const p = tile.polygon.getPath();
  context.stroke(p);
  context.fill(p);
}
