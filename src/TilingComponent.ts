import { V } from "./classes/V";
import { ViewPort } from "./classes/ViewPort";
import { colorRotation } from "./renderer/Colorer";
import { Renderer } from "./renderer/Renderer";
import rules from "./tiling/rules";

function getRenderer(root: ShadowRoot): Renderer {
  root.innerHTML = `<style>
      :host {
        display: block;
        contain: content;
        margin: 0;
        width: 100%;
        height: 100%;
      }
    </style>`;
  const outerDiv = document.createElement("div");
  outerDiv.style.margin = "0px";
  outerDiv.style.width = "100%";
  outerDiv.style.height = "100%";
  const innerDiv = document.createElement("div");
  innerDiv.style.position = "fixed";
  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  innerDiv.appendChild(canvas);
  outerDiv.appendChild(innerDiv);
  root.appendChild(outerDiv);
  const vp = ViewPort(outerDiv);

  return Renderer(canvas, vp);
}

class WebComponent extends HTMLElement {
  viewPort: ViewPort | undefined = undefined;
  renderer: Renderer | undefined = undefined;

  constructor() {
    super();
  }

  connectedCallback(): void {
    const shadowRoot = this.attachShadow({ mode: "open" });
    this.renderer = getRenderer(shadowRoot);

    const tileSet = rules["Pinwheel"];
    this.renderer.setFillColorer(
      colorRotation({ protos: tileSet.kinds, hueOffset: 0.6 })
    );
    const tile = tileSet.tileFromEdge(V(14, 30), V(1500, 1500));
    this.renderer.drawTile(tile);
    this.renderer.setTileStream(tileSet.tiling(tile).cover);
  }
}

customElements.define("mq-tiling", WebComponent);

export default WebComponent;
