export type GlProgramShader = (gl: WebGL2RenderingContext) => WebGLShader;

export function vert(
  s: TemplateStringsArray,
  ...p: (number | string | { toString: () => string })[]
): GlProgramShader {
  return (gl: WebGL2RenderingContext) =>
    shader(
      gl,
      gl.VERTEX_SHADER,
      p.map((p, i) => `${s[i]}${p}`).join() + s[s.length - 1]
    );
}

export function frag(x: TemplateStringsArray): GlProgramShader {
  return (gl: WebGL2RenderingContext) =>
    shader(gl, gl.FRAGMENT_SHADER, x.join());
}

export type GlProgram = {
  setAttrib(attrib: string, arr: TypedArray, size: number): void;
  draw(
    mode:
      | WebGLRenderingContextBase["TRIANGLES"]
      | WebGLRenderingContextBase["LINES"],
    count?: number
  ): void;
};

export type TypedArray =
  | Float32Array
  | Int8Array
  | Uint8Array
  | Int16Array
  | Uint16Array;

export function GlProgram(
  gl: WebGL2RenderingContext,
  vertexShader: GlProgramShader,
  fragmentShader: GlProgramShader
): GlProgram {
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
    setAttrib(attrib: string, arr: TypedArray, size: number) {
      length = arr.length / size;
      buffers.push({
        attrib: gl.getAttribLocation(program, attrib),
        buffer: loadBuffer(gl, arr),
        size,
        type: typedArrayBufferType(arr)
      });
    },
    draw(
      mode:
        | WebGLRenderingContextBase["TRIANGLES"]
        | WebGLRenderingContextBase["LINES"],
      count = 0
    ) {
      buffers.forEach((b) =>
        bindBuffer(gl, b.buffer, b.attrib, b.size, b.type)
      );
      uniforms.forEach((u) => u());
      gl.useProgram(program);
      gl.drawArrays(mode, 0, length ?? count);
    }
  };
}

function shader(
  gl: WebGL2RenderingContext,
  type:
    | WebGLRenderingContextBase["VERTEX_SHADER"]
    | WebGLRenderingContextBase["FRAGMENT_SHADER"],
  source: string
) {
  console.debug(`compiling: ${source}`);
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
