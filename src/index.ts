import { penrose } from "./tiling/penrose";
import { ViewPort } from "./classes/ViewPort";
import { Renderer } from "./renderer/Renderer";
import { Rect } from "./classes/Polygon";

let MqTilingRenderer: Renderer | undefined = undefined;
window.requestAnimationFrame(() => {
  const el = <HTMLDivElement>document.getElementById("mq-tiling-outer");
  const vp = ViewPort(el);
  if (vp)
    MqTilingRenderer = Renderer(
      <HTMLCanvasElement>el.getElementsByTagName("canvas")[0],
      Rect(500, 250, 2500, 750)
    );
  const t = penrose.tile();
  if (MqTilingRenderer) MqTilingRenderer.setTileStream(penrose.tiling(t).cover);
});
