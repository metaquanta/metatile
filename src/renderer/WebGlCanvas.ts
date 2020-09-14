export type WebGlCanvas = {
  readonly clear: () => void;
  readonly render: () => void;
  readonly triangles: (a: Float32Array) => WebGlCanvas;
  readonly edges: (a: Float32Array) => WebGlCanvas;
  readonly colors: (c: Uint8Array) => WebGlCanvas;
};

export function WebGlCanvas(gl: WebGL2RenderingContext): WebGlCanvas {
  const fillProgram = gl.createProgram();
  if (fillProgram === null) throw new Error();
  const strokeProgram = gl.createProgram();
  if (strokeProgram === null) throw new Error();
  const canvas = gl.canvas as HTMLCanvasElement;

  clear(gl);

  gl.attachShader(
    fillProgram,
    vert`#version 300 es
      in vec2 position;
      in vec3 color;
      out vec4 vColor;

      void main() {
        // hsl to rgb from https://www.shadertoy.com/view/XljGzV
        vec3 rgb = clamp(abs(mod(float(color.x)/255.0*6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
        vColor = vec4(float(color.z)/255.0 + float(color.y)/255.0 * (rgb - 0.5)*(1.0 - abs(2.0*float(color.z)/255.0 - 1.0)), 1.0);
        
        vec2 scale = vec2(${canvas.clientWidth / window.devicePixelRatio}, ${
      (-1 * canvas.clientHeight) / window.devicePixelRatio
    });
        gl_Position = vec4((position)/scale-vec2(1.0,-1.0), 0.0, 1.0);
      }

    `(gl)
  );

  gl.attachShader(
    strokeProgram,
    vert`#version 300 es
      in vec2 position;
      
      void main() {
        vec2 scale = vec2(${canvas.clientWidth / window.devicePixelRatio}, ${
      (-1 * canvas.clientHeight) / window.devicePixelRatio
    });
        gl_Position = vec4((position)/scale-vec2(1, -1), 0.0, 1.0);
      }

    `(gl)
  );

  gl.attachShader(
    fillProgram,
    frag`#version 300 es
      precision mediump float;
      in vec4 vColor;
      out vec4 color;

      void main() {
        color = vColor;
      }

    `(gl)
  );

  gl.attachShader(
    strokeProgram,
    frag`#version 300 es
      precision mediump float;
      out vec4 color;
      
      void main() {
        color = vec4(0.0, 0.0, 0.0, 0.5);
      }

    `(gl)
  );

  gl.linkProgram(fillProgram);
  const fillVertexPointer = gl.getAttribLocation(fillProgram, "position");
  const colorPointer = gl.getAttribLocation(fillProgram, "color");
  gl.validateProgram(fillProgram);
  if (!gl.getProgramParameter(fillProgram, gl.LINK_STATUS)) throw new Error();

  gl.linkProgram(strokeProgram);
  const strokeVertexPointer = gl.getAttribLocation(strokeProgram, "position");
  gl.validateProgram(strokeProgram);
  if (!gl.getProgramParameter(strokeProgram, gl.LINK_STATUS)) throw new Error();

  let triangleVertexCount: number;
  let strokeVertexCount: number;
  let fillVertexBuffer: WebGLBuffer;
  let strokeVertexBuffer: WebGLBuffer;
  let colorBuffer: WebGLBuffer;

  const glc: WebGlCanvas = {
    triangles: (arr: Float32Array): WebGlCanvas => {
      triangleVertexCount = arr.length / 2;
      fillVertexBuffer = loadBuffer(gl, arr);
      return glc;
    },
    edges: (arr: Float32Array): WebGlCanvas => {
      strokeVertexCount = arr.length / 2;
      strokeVertexBuffer = loadBuffer(gl, arr);
      return glc;
    },
    colors: (arr: Uint8Array): WebGlCanvas => {
      colorBuffer = loadBuffer(gl, arr);
      return glc;
    },
    clear: (): void => {
      clear(gl);
    },
    render: (): void => {
      console.log("WebGlCanvas.render()");
      bindBuffer(gl, fillVertexBuffer, fillVertexPointer, 2, gl.FLOAT);
      bindBuffer(gl, colorBuffer, colorPointer, 3, gl.UNSIGNED_BYTE);
      gl.useProgram(fillProgram);
      gl.drawArrays(gl.TRIANGLES, 0, triangleVertexCount);
      bindBuffer(gl, strokeVertexBuffer, strokeVertexPointer, 2, gl.FLOAT);
      gl.useProgram(strokeProgram);
      gl.drawArrays(gl.LINES, 0, strokeVertexCount);
    }
  };
  return glc;
}

function loadBuffer(
  gl: WebGL2RenderingContext,
  array: Float32Array | Uint8Array
): WebGLBuffer {
  const buffer = gl.createBuffer();
  if (buffer === null) throw new Error();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
  return buffer;
}

function bindBuffer(
  gl: WebGL2RenderingContext,
  buffer: WebGLBuffer,
  pointer: number,
  size: number,
  type:
    | WebGLRenderingContextBase["FLOAT"]
    | WebGLRenderingContextBase["UNSIGNED_BYTE"]
): void {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(pointer, size, type, false, 0, 0);
  gl.enableVertexAttribArray(pointer);
}

function clear(gl: WebGL2RenderingContext): void {
  console.log("WebGlCanvas.clear()");
  gl.clearColor(0.5, 0.5, 0.5, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function vert(s: TemplateStringsArray, w: number, h: number) {
  return (gl: WebGL2RenderingContext) =>
    _shader(gl, gl.VERTEX_SHADER, `${s[0]}${w}${s[1]}${h}${s[2]}`);
}

function frag(x: TemplateStringsArray) {
  return (gl: WebGL2RenderingContext) =>
    _shader(gl, gl.FRAGMENT_SHADER, x.join());
}

function _shader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (shader === null) throw new Error();
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  //console.log(gl.getShaderInfoLog(shader));
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "");
  }
  return shader;
}
