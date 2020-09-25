const CANVAS_MAX_SIZE = 5000;

const style = `<style>
      :host {
        display: block;
        contain: content;
      }
      :host, div, canvas {
        overflow: hidden;
        margin: 0;
        width: 100%;
        height: 100%;
      }
    </style>`;

function getMaxSize(viewPort: HTMLDivElement): number {
  return Math.min(
    Math.max(window.screen.height, window.screen.width),
    Math.max(viewPort.clientHeight, viewPort.clientWidth) * 3,
    CANVAS_MAX_SIZE / window.devicePixelRatio
  );
}

function rectToString(r: {
  height: number;
  width: number;
  x: number;
  y: number;
}) {
  return `⦍${r.width}, ${r.height}⦎+⧼${r.x}, ${r.y}⧽`;
}

class FixedCanvasElement extends HTMLElement implements HTMLCanvasElement {
  static get observedAttributes(): string[] {
    return ["canvas-pixel-ratio"];
  }

  readonly #canvas: HTMLCanvasElement = document.createElement("canvas");
  readonly #viewPort: HTMLDivElement = document.createElement("div");
  readonly #wrapper: HTMLDivElement = document.createElement("div");
  #context: CanvasRenderingContext2D | undefined = undefined;

  // Drawable width of the canvas in pixels.
  get width(): number {
    return this.#wrapper.clientWidth;
  }

  // Drawable height of the canvas in pixels.
  get height(): number {
    return this.#wrapper.clientHeight;
  }

  get canvasPixelRatio(): number {
    const defaultScale = parseFloat(
      this.getAttribute("canvas-pixel-ratio") ?? "1"
    );
    return isFinite(defaultScale) ? defaultScale : 1;
  }

  get canvasViewPort(): DOMRect {
    const scale = window.devicePixelRatio / this.canvasPixelRatio;
    const w = this.#viewPort.clientWidth * scale;
    const h = this.#viewPort.clientHeight * scale;
    return new DOMRect(
      (this.width * scale - w) / 2,
      (this.height * scale - h) / 2,
      w,
      h
    );
  }

  get viewPort(): DOMRect {
    const w = this.#viewPort.clientWidth;
    const h = this.#viewPort.clientHeight;
    return new DOMRect(
      (this.width - w) / 2,
      (this.height - h) / 2,
      w,
      h
    );
  }

  updateGeometry(): void {
    if (!this.isConnected) return;
    // Center the canvas element in the viewport.
    this.#wrapper.style.left = `${-this.viewPort.left}px`;
    this.#wrapper.style.top = `${-this.viewPort.top}px`;

    console.debug(
      `FixedCanvas.updateGeometry() ${rectToString(this.viewPort)} @ ${
        window.devicePixelRatio
      }  ⦗${rectToString(this.canvasViewPort)}⦘`
    );
  }

  getContext(
    contextId: "2d",
    options?: CanvasRenderingContext2DSettings
  ): CanvasRenderingContext2D | null;
  getContext(
    contextId: "bitmaprenderer",
    options?: ImageBitmapRenderingContextSettings
  ): ImageBitmapRenderingContext | null;
  getContext(
    contextId: "webgl",
    options?: WebGLContextAttributes
  ): WebGLRenderingContext | null;
  getContext(
    contextId: "webgl2",
    options?: WebGLContextAttributes
  ): WebGL2RenderingContext | null;
  getContext(
    contextId: string,
    options?:
      | CanvasRenderingContext2DSettings
      | ImageBitmapRenderingContextSettings
      | WebGLContextAttributes
  ):
    | CanvasRenderingContext2D
    | ImageBitmapRenderingContext
    | WebGLRenderingContext
    | WebGL2RenderingContext
    | null {
    if (contextId === "2d") {
      if (this.#context !== undefined) return this.#context;
      this.#context = (this.#canvas.getContext("2d", options) ?? undefined) as
        | CanvasRenderingContext2D
        | undefined;
      if (this.#context === undefined) return null;
      const scale = this.canvasPixelRatio;
      this.#context.scale(
        window.devicePixelRatio / scale,
        window.devicePixelRatio / scale
      );
      console.debug(
        `FixedCanvas.getContext() (${window.devicePixelRatio}) ⭬ ` +
          `${this.#context.getTransform()}`
      );
      return this.#context;
    }
    return this.#canvas.getContext(contextId, options);
  }

  toBlob(callback: BlobCallback, type?: string, quality?: unknown): void {
    return this.#canvas.toBlob(callback, type, quality);
  }
  toDataURL(type?: string, quality?: unknown): string {
    return this.#canvas.toDataURL(type, quality);
  }
  transferControlToOffscreen(): OffscreenCanvas {
    return this.#canvas.transferControlToOffscreen();
  }

  adoptedCallback(): void {
    this.updateGeometry();
  }

  attributeChangedCallback(): void {
    this.updateGeometry();
  }

  connectedCallback(): void {
    // TODO: Does some of this belong in the constructor?
    // Set up DOM nodes.
    const shadowRoot = this.attachShadow({
      mode: "open"
    });
    shadowRoot.innerHTML = style;
    this.#wrapper.style.position = "fixed";
    this.#wrapper.appendChild(this.#canvas);
    this.#viewPort.appendChild(this.#wrapper);
    shadowRoot.appendChild(this.#viewPort);
    // The height==width of the canvas' wrapper div. This will also be the
    // width/height of the canvas element and the maximum size the FixedCanvas
    // can be resized to.
    const maxSize = getMaxSize(this.#viewPort);
    console.debug(`FixedCanvas: [${maxSize}⨯${maxSize}]`);
    this.#wrapper.style.height = `${maxSize}px`;
    this.#wrapper.style.width = `${maxSize}px`;

    // Set up canvas.
    this.#canvas.height = this.height * window.devicePixelRatio;
    this.#canvas.width = this.width * window.devicePixelRatio;

    window.addEventListener("resize", () => this.updateGeometry());

    this.updateGeometry();
  }
}

customElements.define("mq-fixed-canvas", FixedCanvasElement);

export default FixedCanvasElement;
