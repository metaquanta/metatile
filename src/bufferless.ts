import GlProgram from "./lib/browser/GlProgram";
import M from "./lib/math/2d/M";
import { Triangle } from "./lib/math/2d/Polygon";
import V from "./lib/math/2d/V";
import pinwheel from "./rules/pinwheel";
import Tile from "./tiles/Tile";

const tile = pinwheel.tileFromEdge(V.create(0, 10));
const d = 5;
const mat = getMatrix(tile).invert();

function getMatrix(c: Tile) {
  const p = c.polygon() as Triangle;
  return M.of(p.a.subtract(p.b), p.c.subtract(p.b)).dot(M.translation(p.b));
}

const children = tile.children().map((c) =>
  getMatrix(c)
    .dot(mat as M)
    .transpose()
);

const vs = GlProgram.vert`#version 300 es
uniform vec3 tile[3];
uniform mat3 children[5];
out vec4 vColor;

int j = ${5 ** (d - 1)};

void main() {
  int tid = gl_VertexID / 3;
  int vid = gl_VertexID % 3;
  vec3 pos = tile[vid];
  for(int i = ${d - 1}; i >= 0; i--) {
    pos = children[(tid / j) % 5] * pos;
    j = j / 5;
  }
  gl_Position = vec4(pos.xy, 0, 1) - vec4(1, 1, 0, 0);
  vColor = vec4(float((tid+1)%2), float((tid+1)%3)/2.0, float((tid+1)%5)/4.0, float(vid)/4.0+0.25);
}
`;

const fs = GlProgram.frag`#version 300 es
precision highp float;
out vec4 outColor;
in vec4 vColor;
void main() {
  outColor = vColor;
}
`;

const gl = (document.getElementsByTagName("div")[0]
  .lastElementChild as HTMLCanvasElement).getContext(
  "webgl2"
) as WebGL2RenderingContext;
const canvas = gl.canvas;
canvas.width = window.screen.width;
canvas.height = window.screen.height;

// setup GLSL program
const program = GlProgram.create(gl, vs, fs);
program.setUniformFloat(
  "tile",
  ...tile
    .polygon()
    .vertices()
    .map((v) => [v.x, v.y, 1] as [number, number, number])
);
program.setUniformMat(
  "children",
  children.map((m: M) => m.toArray()) as GlProgram.Mat3[]
);
program.draw(gl.TRIANGLES, children.length ** d * 3);
