import { V } from "./classes/V";
import { ViewPort } from "./classes/ViewPort";
import { colorRotation, colorSet } from "./renderer/Colorer";
import { Renderer } from "./renderer/Renderer";
import rules from "./tiling/rules";
import { mapOf } from "./util";

function getRenderer(root: Element): Renderer {
  root.innerHTML = `<style>
      :host {
        display: block;
        contain: content;
        margin: 0;
        width: 100%;
        height: 100%;
      }
      svg {
        width:1600px;
        height:1600px;
      }
    </style>`;
  const outerDiv = document.createElement("div");

  outerDiv.style.margin = "0px";
  outerDiv.style.width = "100%";
  outerDiv.style.height = "100%";
  const innerDiv = document.createElement("div");
  const canvas = <SVGElement>(
    document.createElementNS("https://www.w3.org/2000/svg", "svg")
  );

  innerDiv.style.position = "fixed";

  //canvas.setAttribute("style", "position:fixed;display:block;");

  //canvas.setAttribute("width", "100%");
  //canvas.setAttribute("height", "100%");
  //canvas.setAttribute("viewBox", `0 0 1600px 1600px`);
  innerDiv.appendChild(canvas);
  outerDiv.appendChild(innerDiv);

  root.appendChild(outerDiv);

  const vp = ViewPort(outerDiv);

  return Renderer(canvas as SVGElement, vp);
}

class WebComponent extends HTMLElement {
  viewPort: ViewPort | undefined = undefined;
  renderer: Renderer | undefined = undefined;

  constructor() {
    super();
  }

  connectedCallback(): void {
    //const shadowRoot = this.attachShadow({ mode: "open" });
    const root = document.getElementById("mqTiling") || undefined;
    if (root !== undefined) {
      this.renderer = getRenderer(root);

      const tileSet = rules["Penrose-Rhomb"];
      this.renderer.setFillColorer(
        colorSet(
          mapOf([tileSet.kinds[0], "aqua"], [tileSet.kinds[1], "aquamarine"]),
          "black"
        )
        /*colorRotation({
        protos: tileSet.kinds,
        protoSeparation: 3,
        hueOffset: 0.35,
        lightness: 7
      })*/
      );
      const tile = tileSet.tileFromEdge(V(25, 5), V(1500, 1500));
      this.renderer.setTileStream(tileSet.tiling(tile).cover);
    }
  }
}

customElements.define("mq-tiling", WebComponent);

export default WebComponent;
