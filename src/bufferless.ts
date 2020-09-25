import FixedCanvasElement from "./lib/browser/FixedCanvasElement";
import GlProgram from "./lib/browser/GlProgram";
import M from "./lib/math/2d/M";
import { Triangle } from "./lib/math/2d/Polygon";
import V from "./lib/math/2d/V";
import pinwheel from "./rules/pinwheel";
import Tile from "./tiles/Tile";

const tile = pinwheel.tileFromEdge(V.create(0, 10));
const mat = getMatrix(tile).invert();

function getMatrix(c: Tile) {
  const p = c.polygon() as Triangle;
  return M.of(p.a.subtract(p.b), p.c.subtract(p.b), p.b);
}

const children = tile.children().map((c) => getMatrix(c).dot(mat as M));
const tag = new FixedCanvasElement();
document.getElementsByTagName("div")[0].appendChild(tag);

const gl = tag.getContext("webgl2", {
  premultipliedAlpha: false
}) as WebGL2RenderingContext;

const program = GlProgram.create(
  gl,
  GlProgram.vert`#version 300 es
uniform vec3 tile[3];
uniform mat3 children[5];
uniform int d;
uniform int mode;
uniform int totalTiles;
uniform float alpha;
uniform vec2 scale;

out vec4 vColor;

void main() {
  int j = totalTiles / 5;
  int tid = gl_VertexID / (3 * mode);
  int vid2 = gl_VertexID % (3 * mode) + 1; 
  int vid = (vid2/mode) % 3;
  vec3 pos = tile[vid];
  for(int i = d; i >= 0; i--) {
    pos = children[(tid / j) % 5] * pos;
    j = j / 5;
  }
  gl_Position = (vec4(pos.xy*scale, -alpha, 1) - vec4(1, 1, 0, 0));
  if(mode == 1) 
    vColor = vec4(float((tid+1)%2), float((tid+1)%3)/2.0, float((tid+1)%5)/4.0, alpha);
  if(mode == 2) vColor = vec4(0.0, 0.0, 0.0, alpha);
}
`,
  GlProgram.frag`#version 300 es
precision highp float;
out vec4 outColor;
in vec4 vColor;
void main() {
  outColor = vColor;
}
`
);

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
let vp = tag.canvasViewPort;
const w = vp.width;
gl.viewport(vp.x, vp.y, vp.width, vp.height);
program.setUniformFloat("scale", [1, vp.width / vp.height]);
const t0 = Date.now();
const int = 5000; // 5 seconds
program.draw(gl.TRIANGLES, children.length ** 2 * 3);
function draw() {
  const vp2 = tag.canvasViewPort;
  if (
    vp2.x !== vp.x ||
    vp2.y !== vp.y ||
    vp2.width !== vp.width ||
    vp2.height !== vp.height
  ) {
    vp = vp2;
    gl.viewport(vp.x, vp.y, vp.width, vp.height);
    program.setUniformFloat("scale", [
      w / vp.width,
      ((w / vp.width) * vp.width) / vp.height
    ]);
  }
  const t = Date.now() - t0;
  const d = (2 + Math.floor(t / int)) % 9;
  const alpha = ((t % int) / int) ** 2;

  program.setUniformInt("mode", 1);
  program.setUniformInt("totalTiles", children.length ** d);
  program.setUniformInt("d", d - 1);
  program.setUniformFloat("alpha", 1);
  program.drawAgain(gl.TRIANGLES, children.length ** d * 3);
  program.setUniformInt("mode", 2);
  program.drawAgain(gl.LINES, children.length ** (d + 1) * 6);

  program.setUniformInt("mode", 1);
  program.setUniformInt("totalTiles", children.length ** (d + 1));
  program.setUniformInt("d", d);
  program.setUniformFloat("alpha", alpha);
  program.drawAgain(gl.TRIANGLES, children.length ** (d + 1) * 3);
  program.setUniformInt("mode", 2);
  program.drawAgain(gl.LINES, children.length ** (d + 1) * 6);

  requestAnimationFrame(() => draw());
}
requestAnimationFrame(() => draw());
