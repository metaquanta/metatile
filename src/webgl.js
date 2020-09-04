import { V } from "./lib/math/2d/V";
import { Rect } from "./lib/math/2d/Polygon";
import { range } from "./lib/util";
import rule from "./rules/pinwheel";

const tile = rule.tileFromEdge(V(0.05, 0.05), V(0.1, 0.1));
const tilesArray = Array.from(rule.tiling(tile).cover(Rect(-1, -1, 1, 1)));
console.log(tilesArray);
const pBuf = Float32Array.from(
  tilesArray.flatMap((t) => t.polygon().vertices()).flatMap((v) => [v.x, v.y])
  //[-0.25, 0, 0.25, 0.5, 0.25, -0.5]
);
console.log(pBuf);
const cBuf = Float32Array.from(
  range(tilesArray.length)
    .map((_) => [Math.random(), Math.random(), Math.random()])
    .flatMap(([r, g, b]) => [r, g, b, r, g, b, r, g, b])
);
console.log(cBuf);
//console.log(pBuf.slice(0, 10));

const canvas = document.getElementsByTagName("canvas")[0];
const gl = canvas.getContext("webgl");

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
precision mediump float;

      varying vec3 vColor;

      void main() {
        gl_FragColor = vec4(vColor, 1.0);
      }
    `;

const shaderProgram = initShaderProgram(gl, vs, fs);
const programInfo = {
  program: shaderProgram,
  attribLocations: {
    vertexPosition: gl.getAttribLocation(shaderProgram, "position"),
    vertexColor: gl.getAttribLocation(shaderProgram, "color")
  }
};
const buffers = initBuffers(gl, pBuf, cBuf);

// Draw the scene
drawScene(gl, programInfo, buffers, tilesArray.length * 3);

function initBuffers(gl, pos, col) {
  // Create a buffer for the square's positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, col, gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    color: colorBuffer
  };
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, buffers, cnt) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexColor,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
  }

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  {
    const offset = 0;
    const vertexCount = cnt;
    gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
  }
}
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.log(
      "Unable to initialize the shader program: " +
        gl.getProgramInfoLog(shaderProgram)
    );
    return null;
  }

  return shaderProgram;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(
      "An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader)
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
