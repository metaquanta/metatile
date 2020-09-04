import { AnimationLoop, Model } from "@luma.gl/engine";
import { Buffer, clear } from "@luma.gl/webgl";
import { V } from "./lib/math/2d/V";
import { Rect } from "./lib/math/2d/Polygon";
import { range } from "./lib/util";
import rule from "./rules/pinwheel";

const tile = rule.tileFromEdge(V(0.05, 0.05), V(0.1, 0.1));
const tilesArray = Array.from(rule.tiling(tile).cover(Rect(-1, -1, 1, 1)));
console.log(tilesArray);
const pBuf = Float32Array.from(
  tilesArray.flatMap((t) => t.polygon().vertices()).flatMap((v) => [v.x, v.y])
);
console.log(pBuf);
const cBuf = Float32Array.from(
  range(tilesArray.length)
    .map((_) => [Math.random(), Math.random(), Math.random()])
    .flatMap(([r, g, b]) => [r, g, b, r, g, b, r, g, b])
);
console.log(cBuf);
//console.log(pBuf.slice(0, 10));

/* eslint-env browser */
const loop = new AnimationLoop({
  onInitialize({ gl }) {
    const positionBuffer = new Buffer(gl, pBuf);

    const colorBuffer = new Buffer(gl, cBuf);

    const vs = `
      attribute vec2 position;
      attribute vec3 color;

      varying vec3 vColor;

      void main() {
        vColor = color;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fs = `
      varying vec3 vColor;

      void main() {
        gl_FragColor = vec4(vColor, 1.0);
      }
    `;

    const model = new Model(gl, {
      vs,
      fs,
      attributes: {
        position: positionBuffer,
        color: colorBuffer
      },
      vertexCount: pBuf.length / 2
    });

    return { model };
  },

  onRender({ gl, model }) {
    clear(gl, { color: [0, 0, 0, 1] });
    model.draw();
  }
});

loop.start();
