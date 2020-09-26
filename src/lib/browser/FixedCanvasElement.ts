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
      #wrapper {
        position: fixed;
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
  readonly #canvas: HTMLCanvasElement = document.createElement("canvas");
  readonly #viewPort: HTMLDivElement = document.createElement("div");
  readonly #wrapper: HTMLDivElement = document.createElement("div");
  #pixelRatio: number = window.devicePixelRatio;

  // Drawable width of the canvas in CSS "pixels".
  get width(): number {
    return this.#wrapper.clientWidth;
  }

  // Drawable height of the canvas in CSS "pixels".
  get height(): number {
    return this.#wrapper.clientHeight;
  }

  get pixelRatio(): number {
    return this.#pixelRatio;
  }

  // View port in real physical pixels;
  get canvasViewPort(): DOMRect {
    const scale = this.#pixelRatio;
    const w = this.#viewPort.clientWidth * scale;
    const h = this.#viewPort.clientHeight * scale;
    return new DOMRect(
      (this.width * scale - w) / 2,
      (this.height * scale - h) / 2,
      w,
      h
    );
  }

  // View port in CSS "pixels";
  get viewPort(): DOMRect {
    const w = this.#viewPort.clientWidth;
    const h = this.#viewPort.clientHeight;
    return new DOMRect((this.width - w) / 2, (this.height - h) / 2, w, h);
  }

  updateGeometry(): void {
    if (!this.isConnected) return;
    // Center the canvas element in the viewport.
    this.#wrapper.style.left = `${-this.viewPort.left}px`;
    this.#wrapper.style.top = `${-this.viewPort.top}px`;
    this.#pixelRatio = window.devicePixelRatio;

    console.debug(
      `FixedCanvas.updateGeometry() ${rectToString(this.viewPort)} @ ${
        this.#pixelRatio
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
    this.#wrapper.id = "wrapper";
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
    this.#canvas.height = this.height * this.#pixelRatio;
    this.#canvas.width = this.width * this.#pixelRatio;

    window.addEventListener("resize", () => this.updateGeometry());

    this.updateGeometry();
  }
}

customElements.define("mq-fixed-canvas", FixedCanvasElement);

export default FixedCanvasElement;
