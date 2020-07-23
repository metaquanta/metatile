import penrose from "./tiling/penrose";
import { Vec2 } from "./classes/Vec2";
import { ViewPort } from "./classes/ViewPort";
import { Renderer } from "./renderer/Renderer";

let MqTilingRenderer: Renderer | undefined = undefined;
window.requestAnimationFrame(() => {
  const el = <HTMLDivElement>document.getElementById("mq-tiling-outer");
  const vp = ViewPort(el);
  if (vp)
    MqTilingRenderer = Renderer(
      <HTMLCanvasElement>el.getElementsByTagName("canvas")[0],
      vp
    );
  const t = penrose();
  if (MqTilingRenderer)
    MqTilingRenderer.setTileStream(
      t.tileGenerator(t.getTile(Vec2(35, 15), Vec2(1000, 1000)))()
    );
});
