export type WebGlCanvas = {
  readonly clear: () => void;
  readonly render: () => void;
  readonly triangles: (a: Float32Array) => WebGlCanvas;
  readonly edges: (a: Float32Array) => WebGlCanvas;
  readonly colors: (c: Uint8Array) => WebGlCanvas;
};

export function WebGlCanvas(gl: WebGL2RenderingContext): WebGlCanvas {
  const canvas = gl.canvas as HTMLCanvasElement;
  //clear(gl);

  const fillProgram = createProgram(
    gl,
    vert`#version 300 es
      in vec2 position;
      in vec3 color;
      out vec4 vColor;

      void main() {
        // hsl to rgb from https://www.shadertoy.com/view/XljGzV
        vec3 rgb = clamp(abs(mod(
          float(color.x)/255.0*6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 
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
    frag`#version 300 es
      precision mediump float;
      in vec4 vColor;
      out vec4 color;

      void main() {
        color = vColor;
      }
    `
  );

  const strokeProgram = createProgram(
    gl,
    vert`#version 300 es
      in vec2 position;
      
      void main() {
        vec2 scale = vec2(
          ${canvas.clientWidth / window.devicePixelRatio}, 
          ${(-1 * canvas.clientHeight) / window.devicePixelRatio}
        );
        gl_Position = vec4((position)/scale-vec2(1, -1), 0.0, 1.0);
      }
    `,
    frag`#version 300 es
      precision mediump float;
      out vec4 color;

      void main() {
        color = vec4(0.0, 0.0, 0.0, 0.7);
      }
    `
  );

  const glc: WebGlCanvas = {
    triangles: (arr: Float32Array): WebGlCanvas => {
      fillProgram.bindBuffer("position", arr, 2);
      return glc;
    },
    edges: (arr: Float32Array): WebGlCanvas => {
      strokeProgram.bindBuffer("position", arr, 2);
      return glc;
    },
    colors: (arr: Uint8Array): WebGlCanvas => {
      fillProgram.bindBuffer("color", arr, 3);
      return glc;
    },
    clear: (): void => {
      clear(gl);
    },
    render: (): void => {
      console.log("WebGlCanvas.render()");
      fillProgram.draw(gl.TRIANGLES);
      strokeProgram.draw(gl.LINES);
    }
  };
  return glc;
}

function clear(gl: WebGL2RenderingContext): void {
  console.log("WebGlCanvas.clear()");
  gl.clearColor(0.5, 0.5, 0.5, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

export type GlCanvasShader = (gl: WebGL2RenderingContext) => WebGLShader;

export function vert(
  s: TemplateStringsArray,
  w: number,
  h: number
): GlCanvasShader {
  return (gl: WebGL2RenderingContext) =>
    _shader(gl, gl.VERTEX_SHADER, `${s[0]}${w}${s[1]}${h}${s[2]}`);
}

export function frag(x: TemplateStringsArray): GlCanvasShader {
  return (gl: WebGL2RenderingContext) =>
    _shader(gl, gl.FRAGMENT_SHADER, x.join());
}

export type GlCanvasProgram = {
  bindBuffer(
    attrib: string,
    arr: Float32Array | Uint8Array,
    size: number
  ): void;
  draw(mode: WebGLRenderingContextBase["TRIANGLES"], count?: number): void;
};

export function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: (gl: WebGL2RenderingContext) => WebGLShader,
  fragmentShader: (gl: WebGL2RenderingContext) => WebGLShader
): GlCanvasProgram {
  const program = gl.createProgram();
  if (program === null) throw new Error();

  gl.attachShader(program, vertexShader(gl));
  gl.attachShader(program, fragmentShader(gl));
  gl.linkProgram(program);
  gl.validateProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(program) ?? undefined);

  const buffers: {
    attrib: number;
    buffer: WebGLBuffer;
    size: number;
    type: BufferType;
  }[] = [];

  const uniforms: (() => void)[] = [];

  let length: number | undefined;

  return {
    bindBuffer(attrib: string, arr: TypedArray, size: number) {
      length = arr.length / size;
      buffers.push({
        attrib: gl.getAttribLocation(program, attrib),
        buffer: loadBuffer(gl, arr),
        size,
        type: typedArrayBufferType(arr)
      });
    },
    draw(mode: WebGLRenderingContextBase["TRIANGLES"], count = 0) {
      buffers.forEach((b) =>
        bindBuffer(gl, b.buffer, b.attrib, b.size, b.type)
      );
      uniforms.forEach((u) => u());
      gl.useProgram(program);
      gl.drawArrays(mode, 0, length ?? count);
    }
  };
}

function _shader(
  gl: WebGL2RenderingContext,
  type:
    | WebGLRenderingContextBase["VERTEX_SHADER"]
    | WebGLRenderingContextBase["FRAGMENT_SHADER"],
  source: string
) {
  const shader = gl.createShader(type);
  if (shader === null) throw new Error();
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "");
  }
  return shader;
}

function loadBuffer(
  gl: WebGL2RenderingContext,
  array: TypedArray
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
  type: BufferType
): void {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(pointer, size, type, false, 0, 0);
  gl.enableVertexAttribArray(pointer);
}

type BufferType =
  | WebGLRenderingContextBase["FLOAT"]
  | WebGLRenderingContextBase["BYTE"]
  | WebGLRenderingContextBase["UNSIGNED_BYTE"]
  | WebGLRenderingContextBase["SHORT"]
  | WebGLRenderingContextBase["UNSIGNED_SHORT"];

type TypedArray =
  | Float32Array
  | Int8Array
  | Uint8Array
  | Int16Array
  | Uint16Array;

function typedArrayBufferType(arr: TypedArray): number {
  switch (arr.constructor) {
    case Float32Array:
      return WebGL2RenderingContext.FLOAT;
    case Int8Array:
      return WebGL2RenderingContext.BYTE;
    case Uint8Array:
      return WebGL2RenderingContext.UNSIGNED_BYTE;
    case Int16Array:
      return WebGL2RenderingContext.SHORT;
    case Uint16Array:
      return WebGL2RenderingContext.UNSIGNED_SHORT;
  }
  throw new Error("Unsupported Type");
}
