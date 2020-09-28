import { isArray } from "../util";

export type GlProgram = {
  setAttrib(loc: string, arr: GlProgram.TypedArray, size: number): void;
  setUniformInt(loc: string, val1: number): void;
  setUniformInt(loc: string, val1: number, val2: number): void;
  setUniformInt(loc: string, val1: number, val2: number, val3: number): void;
  setUniformInt(
    l: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number
  ): void;
  setUniformFloat(
    loc: string,
    ...values: (number | [number, number] | [number, number, number])[]
  ): void;
  setUniformMat(
    loc: string,
    values: (GlProgram.Mat2 | GlProgram.Mat3 | GlProgram.Mat4)[]
  ): void;
  draw(
    mode:
      | WebGLRenderingContextBase["TRIANGLES"]
      | WebGLRenderingContextBase["LINES"],
    count: number
  ): void;
};

export namespace GlProgram {
  export type Shader = (gl: WebGL2RenderingContext) => WebGLShader;

  export function vert(
    a: TemplateStringsArray,
    ...p: (number | string | { toString: () => string })[]
  ): Shader {
    return (gl: WebGL2RenderingContext) => {
      return shader(
        gl,
        gl.VERTEX_SHADER,
        p.map((p, i) => `${a[i]}${p}`).join("") + a[a.length - 1]
      );
    };
  }

  export function frag(
    a: TemplateStringsArray,
    ...p: (number | string | { toString: () => string })[]
  ): Shader {
    return (gl: WebGL2RenderingContext) =>
      shader(
        gl,
        gl.FRAGMENT_SHADER,
        p.map((p, i) => `${a[i]}${p}`).join("") + a[a.length - 1]
      );
  }

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

  export function create(
    gl: WebGL2RenderingContext,
    vertexShader: Shader,
    fragmentShader: Shader
  ): GlProgram {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
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

    const uniforms = new Map<
      WebGLUniformLocation,
      (loc: WebGLUniformLocation) => void
    >();

    return {
      setAttrib(attrib: string, arr: TypedArray, size: number) {
        buffers.push({
          attrib: gl.getAttribLocation(program, attrib),
          buffer: loadBuffer(gl, arr),
          size,
          type: typedArrayBufferType(arr)
        });
        if (gl.getError() !== 0)
          throw new Error(`WebGL error:${gl.getError()}`);
      },

      setUniformInt(attrib: string, ...values: number[]) {
        const loc = gl.getUniformLocation(program, attrib);
        if (loc === null) throw new Error();
        switch (values.length) {
          case 1:
            uniforms.set(loc, (loc) => gl.uniform1i(loc, values[0]));
            if (gl.getError() !== 0)
              throw new Error(`WebGL error:${gl.getError()}`);
            return;
        }
        throw new Error("Not supported yet!");
      },

      setUniformFloat(
        attrib: string,
        ...values: (number | [number, number] | [number, number, number])[]
      ) {
        const loc = gl.getUniformLocation(program, attrib);
        if (loc === null) throw new Error();
        if (values.length === 0) throw new Error();
        if (isArray(values[0])) {
          uniforms.set(loc, (loc) =>
            _setUniformfv(gl, loc, values as number[][])
          );
        } else {
          uniforms.set(loc, (loc) => _setUniformf(gl, loc, values as number[]));
        }
        if (gl.getError() !== 0)
          throw new Error(`WebGL error:${gl.getError()}`);
      },

      setUniformMat(attrib: string, values: number[][]) {
        const loc = gl.getUniformLocation(program, attrib);
        if (loc === null) throw new Error();
        if (values.length === 0) throw new Error();
        if (values[0].length === 9) {
          uniforms.set(loc, (loc) =>
            gl.uniformMatrix3fv(
              loc,
              false,
              values.flatMap((v) => v)
            )
          );
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
        count
      ) {
        if (loadedProgram !== this) {
          buffers.forEach(({ buffer, attrib, size, type }) =>
            bindBuffer(gl, buffer, attrib, size, type)
          );
          gl.useProgram(program);
          loadedProgram = this;
        }

        uniforms.forEach((f, l) => f(l));
        console.debug(`GlProgram.draw() - drawing ${count} vertices.`);
        gl.drawArrays(mode, 0, count);
      }
    };
  }
}

function shader(
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
  array: GlProgram.TypedArray
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

function typedArrayBufferType(arr: GlProgram.TypedArray): number {
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

function _setUniformf(
  gl: WebGL2RenderingContext,
  loc: WebGLUniformLocation,
  values: number[]
) {
  switch (values.length) {
    case 1:
      return gl.uniform1f(loc, values[0]);
    case 2:
      return gl.uniform2f(loc, values[0], values[1]);
    case 3:
      return gl.uniform3f(loc, values[0], values[1], values[2]);
    case 4:
      return gl.uniform4f(loc, values[0], values[1], values[2], values[3]);
  }
  throw new Error(`unsupported vector size! [${values.length}]`);
}

function _setUniformfv(
  gl: WebGL2RenderingContext,
  loc: WebGLUniformLocation,
  values: number[][]
) {
  const a = values.flat();
  switch (values[0].length) {
    case 1:
      return gl.uniform1fv(loc, a);
    case 2:
      return gl.uniform2fv(loc, a);
    case 3:
      return gl.uniform3fv(loc, a);
    case 4:
      return gl.uniform4fv(loc, a);
  }
  throw new Error(`unsupported vector size! [${values[0].length}]`);
}

let loadedProgram: GlProgram | undefined = undefined;

export default GlProgram;
