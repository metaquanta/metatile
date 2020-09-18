import { isArray } from "../util";

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
  setUniformInt(attrib: string, ...values: number[]): void;
  setUniformFloat(
    attrib: string,
    ...values: (number | [number, number])[]
  ): void;
  setUniformMat(attrib: string, values: (Mat2 | Mat3 | Mat4)[]): void;
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

export type Mat2 = [number, number, number, number];
export type Mat3 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];
export type Mat4 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

export function GlProgram(
  gl: WebGL2RenderingContext,
  vertexShader: GlProgramShader,
  fragmentShader: GlProgramShader
): GlProgram {
  const program = gl.createProgram();
  if (program === null) throw new Error(`WebGL error:${gl.getError()}`);
  gl.attachShader(program, vertexShader(gl));
  gl.attachShader(program, fragmentShader(gl));
  gl.linkProgram(program);
  gl.validateProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw new Error(
      `WebGL ProgramInfoLog:${
        gl.getProgramInfoLog(program) ?? undefined
      }\nWebGL error:${gl.getError()}`
    );

  if (gl.getError() !== 0) throw new Error(`WebGL error:${gl.getError()}`);

  const buffers: {
    attrib: number;
    buffer: WebGLBuffer;
    size: number;
    type: BufferType;
  }[] = [];

  const uniforms: [
    (loc: WebGLUniformLocation) => void,
    WebGLUniformLocation
  ][] = [];

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
      if (gl.getError() !== 0) throw new Error(`WebGL error:${gl.getError()}`);
    },

    setUniformInt(attrib: string, ...values: number[]) {
      const loc = gl.getUniformLocation(program, attrib);
      if (loc === null) throw new Error();
      switch (values.length) {
        case 1:
          uniforms.push([(loc) => gl.uniform1i(loc, values[0]), loc]);
          if (gl.getError() !== 0)
            throw new Error(`WebGL error:${gl.getError()}`);
          return;
      }
      throw new Error("Not supported yet!");
    },

    setUniformFloat(attrib: string, ...values: (number | [number, number])[]) {
      const loc = gl.getUniformLocation(program, attrib);
      if (loc === null) throw new Error();
      if (values.length === 0) throw new Error();
      if (isArray(values[0])) {
        uniforms.push([
          (loc) =>
            gl.uniform2fv(
              loc,
              values.flatMap((v) => v)
            ),
          loc
        ]);
        if (gl.getError() !== 0)
          throw new Error(`WebGL error:${gl.getError()}`);
      } else {
        throw new Error("Not supported yet!");
      }
    },

    setUniformMat(attrib: string, values: number[][]) {
      const loc = gl.getUniformLocation(program, attrib);
      if (loc === null) throw new Error();
      if (values.length === 0) throw new Error();
      if (values[0].length === 9) {
        uniforms.push([
          (loc) =>
            gl.uniformMatrix3fv(
              loc,
              false,
              values.flatMap((v) => v)
            ),
          loc
        ]);
        if (gl.getError() !== 0)
          throw new Error(`WebGL error:${gl.getError()}`);
      } else {
        throw new Error("Not supported yet!");
      }
    },

    draw(
      mode:
        | WebGLRenderingContextBase["TRIANGLES"]
        | WebGLRenderingContextBase["LINES"],
      count = 0
    ) {
      buffers.forEach(({ buffer, attrib, size, type }) =>
        bindBuffer(gl, buffer, attrib, size, type)
      );

      gl.useProgram(program);

      uniforms.forEach(([f, loc]) => f(loc));

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
  //console.debug(`compiling: ${source}`);
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
