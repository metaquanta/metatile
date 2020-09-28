import GlProgram from "../lib/browser/GlProgram";
import Tile from "../tiles/Tile";
import Colorer from "./Colorer";
import Renderer from "./Renderer";

export default function createWebGlRenderer(
  gl: WebGL2RenderingContext,
  fillColorer: Colorer,
  tiles: Iterable<Tile>
): Renderer {
  const canvas = gl.canvas as HTMLCanvasElement;
  clear(gl);

  const fillProgram = GlProgram.create(
    gl,
    GlProgram.vert`#version 300 es
      in vec2 position;
      in vec3 color;
      out vec4 vColor;

      void main() {
        // hsl to rgb from https://www.shadertoy.com/view/XljGzV
        vec3 rgb = clamp(
          abs(mod(float(color.x)/255.0*6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 
          0.0, 1.0
        );
        vColor = vec4(
          float(color.z)/255.0 + float(color.y)/255.0 * (rgb - 0.5) * (1.0 - abs(2.0*float(color.z)/255.0 - 1.0)), 
          1.0
        );        
        vec2 scale = vec2(
          ${canvas.clientWidth / window.devicePixelRatio},
          ${(-1 * canvas.clientHeight) / window.devicePixelRatio}
        );
        gl_Position = vec4((position)/scale-vec2(1.0,-1.0), 0.0, 1.0);
      }
    `,
    GlProgram.frag`#version 300 es
      precision mediump float;
      in vec4 vColor;
      out vec4 color;

      void main() {
        color = vColor;
      }
    `
  );

  const strokeProgram = GlProgram.create(
    gl,
    GlProgram.vert`#version 300 es
      in vec2 position;
      
      void main() {
        vec2 scale = vec2(
          ${canvas.clientWidth / window.devicePixelRatio},
          ${(-1 * canvas.clientHeight) / window.devicePixelRatio}
        );
        gl_Position = vec4((position)/scale-vec2(1, -1), 0.0, 1.0);
      }
    `,
    GlProgram.frag`#version 300 es
      precision mediump float;
      out vec4 color;

      void main() {
        color = vec4(0.0, 0.0, 0.0, 0.7);
      }
    `
  );

  return {
    render: () => {
      return new Promise((resolve) => {
        window.requestAnimationFrame(() => {
          let i = 0;
          let j = 0;
          // ~14MiB
          // triangle: 3 fill, 6 stroke vertices
          // rhomb: 6 fill, 8 stroke vertices
          const fillverts = new Float32Array(2 ** 20);
          const strokeverts = new Float32Array(2 ** 21);
          const colors = new Uint8Array(2 ** 21);
          for (const t of tiles) {
            const color = fillColorer(t);
            for (const v of t
              .polygon()
              .triangles()
              .flatMap((t) => t.vertices())) {
              fillverts[2 * i] = v.x;
              fillverts[2 * i + 1] = v.y;
              colors[3 * i] = Math.round((color.h / 360) * 255);
              colors[3 * i + 1] = Math.round((color.s / 100) * 255);
              colors[3 * i + 2] = Math.round((color.v / 100) * 255);
              i = i + 1;
            }
            for (const v of t
              .polygon()
              .edges()
              .flatMap((e) => [e[0], e[1]])) {
              strokeverts[2 * j] = v.x;
              strokeverts[2 * j + 1] = v.y;
              j = j + 1;
            }
          }
          window.requestAnimationFrame(() => {
            fillProgram.setAttrib("position", fillverts, 2);
            fillProgram.setAttrib("color", colors, 3);
            fillProgram.draw(gl.TRIANGLES, i);
            strokeProgram.setAttrib("position", strokeverts, 2);
            strokeProgram.draw(gl.LINES, j);
            resolve(canvas);
          });
        });
      });
    }
  };
}

function clear(gl: WebGL2RenderingContext): void {
  console.log("WebGlCanvas.clear()");
  gl.clearColor(0.5, 0.5, 0.5, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
