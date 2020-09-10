export type WebGlCanvas = {
  clear: () => void;
  render: (
    mode: WebGLRenderingContext["TRIANGLES"] | WebGLRenderingContext["LINES"]
  ) => void;
  vertices: (a: Float32Array) => WebGlCanvas;
  colors: (c: Float32Array) => WebGlCanvas;
};

export type WebGlCanvasBuilder = {
  clear: () => void;
  vertices: (a: Float32Array) => WebGlCanvasBuilder1;
  colors: (c: Float32Array) => WebGlCanvasBuilder2;
};

type WebGlCanvasBuilder1 = {
  clear: () => void;
  vertices: (a: Float32Array) => WebGlCanvasBuilder1;
  colors: (c: Float32Array) => WebGlCanvas;
};

type WebGlCanvasBuilder2 = {
  clear: () => void;
  vertices: (a: Float32Array) => WebGlCanvas;
  colors: (c: Float32Array) => WebGlCanvasBuilder2;
};

export function WebGlCanvas(gl: WebGLRenderingContext): WebGlCanvasBuilder {
  const program = gl.createProgram();
  if (program === null) throw new Error();
  const canvas = gl.canvas as HTMLCanvasElement;

  gl.attachShader(
    program,
    vert`
      attribute vec2 position;
      attribute vec4 color;
      varying vec4 vColor;

      void main() {
        // hsl to rgb from https://www.shadertoy.com/view/XljGzV
        vec3 rgb = clamp( abs(mod(color.x/360.0*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
        vColor = vec4(color.z/100.0 + color.y/100.0 * (rgb-0.5)*(1.0-abs(2.0*color.z/100.0-1.0)), color.w);
        
        vec2 scale = vec2(${canvas.clientWidth}, ${canvas.clientHeight});
        gl_Position = vec4((position)/scale-vec2(1.0,1.0), 0.0, 1.0);
      }

    `(gl)
  );

  gl.attachShader(
    program,
    frag`
      precision mediump float;
      varying vec4 vColor;

      void main() {
        gl_FragColor = vColor;
      }

    `(gl)
  );

  gl.linkProgram(program);
  //console.log(gl.getProgramInfoLog(program));
  const numAttribs = gl.getProgramParameter(
    program,
    gl.ACTIVE_ATTRIBUTES
  ) as number;
  for (let i = 0; i < numAttribs; ++i) {
    const info = gl.getActiveAttrib(program, i);
    if (info)
      console.log("name:", info.name, "type:", info.type, "size:", info.size);
  }
  const positionsLocation = gl.getAttribLocation(program, "position");
  const colorsLocation = gl.getAttribLocation(program, "color");
  gl.validateProgram(program);
  //console.log(gl.getProgramInfoLog(program));
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error();

  let vertexCount: number;

  const glc = {
    vertices: (arr: Float32Array): WebGlCanvas => {
      console.log("WebGlCanvas.vertices()");
      //console.log(arr);
      vertexCount = arr.length / 2;
      buffer(gl, arr);
      gl.vertexAttribPointer(positionsLocation, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(positionsLocation);
      return glc;
    },
    colors: (arr: Float32Array): WebGlCanvas => {
      console.log("WebGlCanvas.colors()");
      buffer(gl, arr);
      gl.vertexAttribPointer(colorsLocation, 4, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(colorsLocation);
      return glc;
    },
    clear: (): void => {
      clear(gl);
    },
    render: (
      mode: WebGLRenderingContext["TRIANGLES"] | WebGLRenderingContext["LINES"]
    ): void => {
      console.log("WebGlCanvas.render()");
      //console.log(gl.getProgramInfoLog(program));
      gl.useProgram(program);
      //console.log(gl.getProgramInfoLog(program));
      gl.drawArrays(mode, 0, vertexCount);
      //console.log(gl.getProgramInfoLog(program));
    }
  };

  const needVertices = {
    vertices: (arr: Float32Array): WebGlCanvas => {
      glc.vertices(arr);
      return glc;
    },
    colors: (arr: Float32Array) => {
      glc.colors(arr);
      return needVertices;
    },
    clear: (): void => {
      clear(gl);
    }
  };

  const needColors = {
    vertices: (arr: Float32Array) => {
      glc.vertices(arr);
      return needColors;
    },
    colors: (arr: Float32Array): WebGlCanvas => {
      glc.colors(arr);
      return glc;
    },
    clear: (): void => {
      clear(gl);
    }
  };

  return {
    vertices: (arr: Float32Array) => {
      glc.vertices(arr);
      return needColors;
    },
    colors: (arr: Float32Array) => {
      glc.colors(arr);
      return needVertices;
    },
    clear: (): void => {
      clear(gl);
    }
  };
}

function buffer(gl: WebGLRenderingContext, array: Float32Array): WebGLBuffer {
  const buffer = gl.createBuffer();
  if (buffer === null) throw new Error();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
  return buffer;
}

function clear(gl: WebGLRenderingContext): void {
  console.log("WebGlCanvas.clear()");
  gl.clearColor(0.5, 0.5, 0.5, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function vert(s: TemplateStringsArray, w: number, h: number) {
  return (gl: WebGLRenderingContext) =>
    _shader(gl, gl.VERTEX_SHADER, `${s[0]}${w}${s[1]}${h}${s[2]}`);
}

function frag(x: TemplateStringsArray) {
  return (gl: WebGLRenderingContext) =>
    _shader(gl, gl.FRAGMENT_SHADER, x.join());
}

function _shader(gl: WebGLRenderingContext, type: number, source: string) {
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
