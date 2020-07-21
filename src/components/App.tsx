import React, { useEffect, useState } from "react";
import Canvas from "./Canvas";
import Sidebar from "./Sidebar";
import penrose from "../tiling/penrose";
import pinwheel10 from "../tiling/pinwheel10";
import pinwheel13 from "../tiling/pinwheel13";
import pinwheel5 from "../tiling/pinwheel5";
import viper from "../tiling/viper";
import { colorAngles, colorStreamer } from "../renderer/Colorer";
import renderer from "../renderer/Renderer";
import draw from "../renderer/DrawTile";
import { Vec2 } from "../classes/Vec2";

export default function App() {
  console.log("App()");
  const [state, setState] = useState({
    selectedTiling: 0,
    renderer: renderer({
      strokeColorer: false,
      fillColorer: true,
      viewPort: true,
      speed: 100,
    }),
  });

  const tilings = [pinwheel5(), pinwheel10(), pinwheel13(), penrose(), viper()];

  const v = Vec2(20, 30);
  const u = Vec2(1000, 500);

  function setTiling(tiling: number) {
    console.log(`App.setTiling(${tiling})`);
    const r = state.renderer;
    r.setTileStream(
      tilings[tiling].tileGenerator(tilings[tiling].getTile(v, u), false)
    );
    setState({ selectedTiling: tiling, renderer: r });
  }

  useEffect(() => {
    console.log(`App.useEffect()`);
    const r = state.renderer;
    r.setfillColorer(colorStreamer(colorAngles(4, 2, 50, 50))());
    r.setDrawTiles(draw);
    r.setTileStream(
      tilings[state.selectedTiling].tileGenerator(
        tilings[state.selectedTiling].getTile(v, u),
        false
      )
    );
  });

  return (
    <div className="app">
      <Sidebar
        selectedTiling={state.selectedTiling}
        tilings={["pinwheel5", "pinwheel10", "pinwheel13", "penrose", "viper"]}
        setTiling={setTiling}
      />
      <Canvas renderer={state.renderer} />
    </div>
  );
}
