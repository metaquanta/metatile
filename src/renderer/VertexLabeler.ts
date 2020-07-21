import { Tile } from "../classes/Tile";

export default function labelVerts(tile: Tile, context: CanvasRenderingContext2D) {
  const vertices = tile.polygon.vertices;
  const p = [
    vertices[1],
    vertices[vertices.length - 1],
    vertices[0].scale(4),
  ]
    .reduce((a, b) => a.add(b))
    .scale(1 / 6);

  context.strokeStyle = "red";
  context.beginPath();
  context.arc(p.x, p.y, 3, 0, Math.PI * 2);
  context.stroke();

  const q = [
    vertices[2],
    vertices[1].scale(4),
    vertices[0],
  ]
    .reduce((a, b) => a.add(b))
    .scale(1 / 6);

  context.strokeStyle = "black";
  context.beginPath();
  context.arc(q.x, q.y, 3, 0, Math.PI * 2);
  context.stroke();
}