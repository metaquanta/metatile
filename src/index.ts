import { ViewPort } from "./classes/ViewPort";
import { Renderer } from "./renderer/Renderer";
import { V } from "./classes/V";
import { colorAngles } from "./renderer/Colorer";
import rules from "./tiling/rules";

const tileSet = rules["Penrose-Rhomb"];
const el = <HTMLDivElement>document.getElementById("mq-tiling-outer");
const canvas = <HTMLCanvasElement>el.getElementsByTagName("canvas")[0];

const vp = ViewPort(el);
const MqTilingRenderer = Renderer(canvas, vp);
MqTilingRenderer.setFillColorer(colorAngles(50, 80, 1.0, tileSet.kinds, 2));

const tile = tileSet.tileFromEdge(V(50, 10), V(1500, 1500));
MqTilingRenderer.setTileStream(tileSet.tiling(tile).cover);
