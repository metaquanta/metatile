import { ViewPort } from "./classes/ViewPort";
import { Renderer } from "./renderer/Renderer";
import { V } from "./classes/V";
import penrose from "./tiling/penrose";
import viper from "./tiling/viper";
import pinwheel5 from "./tiling/pinwheel5";
import pinwheel10 from "./tiling/pinwheel10";
import pinwheel13 from "./tiling/pinwheel13";
import ammbee from "./tiling/ammann-beenker";
import { colorAngles } from "./renderer/Colorer";

const tileSets = [penrose, viper, pinwheel5, pinwheel10, pinwheel13, ammbee];

let MqTilingRenderer: Renderer | undefined = undefined;
window.requestAnimationFrame(() => {
  const el = <HTMLDivElement>document.getElementById("mq-tiling-outer");
  const vp = ViewPort(el);
  if (vp)
    MqTilingRenderer = Renderer(
      <HTMLCanvasElement>el.getElementsByTagName("canvas")[0],
      vp
    );
  if (MqTilingRenderer) {
    const tileSet = tileSets[2];
    const tile = tileSet.tileFromEdge(V(50, 10), V(1500, 1500));
    MqTilingRenderer.setFillColorer(colorAngles(50, 50, 1.0, tileSet.kinds, 2));
    MqTilingRenderer.setTileStream(
      tileSet.tiling(tile).cover
      //tile
      //.parent()
      //.parent()
      //.children()
      //.flatMap((t) => t.children())
      //.flatMap((t) => t.children())
      //.flatMap((t) => t.children())
    );
  }
});
