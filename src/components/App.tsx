import React, { useEffect, useState } from "react";
import Canvas from "./Canvas";
import Sidebar from "./Sidebar";
import penrose from "../tiling/penrose";
import pinwheel10 from "../tiling/pinwheel10";
import pinwheel13 from "../tiling/pinwheel13";
import pinwheel5 from "../tiling/pinwheel5";
import viper from "../tiling/viper";
import { colorAngles, colorStreamer } from "../renderer/Colorer";
import renderer, { Renderer } from "../renderer/Renderer";
import draw from "../renderer/DrawTile";
import { Vec2 } from "../classes/Vec2";
import { Tiling } from "../classes/Tiling";

class App extends React.Component<
  {},
  { selectedTiling: number; renderer: Renderer }
> {
  tilings: Tiling[];
  constructor(props: {}) {
    super(props);
    this.state = {
      selectedTiling: 0,
      renderer: renderer({
        strokeColorer: false,
        fillColorer: false,
        viewPort: true,
        speed: 1,
      }),
    };
    const v = Vec2(20, 30);
    const u = Vec2(1000, 500);

    //this.state.renderer.setfillColorer(colorStreamer(colorAngles(4, 2, 50, 50))());
    this.state.renderer.setDrawTiles(draw);
    this.tilings = [
      pinwheel5(),
      pinwheel10(),
      pinwheel13(),
      penrose(),
      viper(),
    ];
  }

  setTiling(n: number) {
    const v = Vec2(20, 30);
    const u = Vec2(1000, 500);

    this.setState((state) => ({ selectedTiling: n }));
    this.state.renderer.setTileStream(
      this.tilings[n].tileGenerator(this.tilings[n].getTile(v, u), false)
    );
    /*const r = this.state.renderer;
    r.setfillColorer(colorStreamer(colorAngles(4, 2, 50, 50))());
    r.setDrawTiles(draw);
    r.setTileStream(
      this.tilings[this.state.selectedTiling].tileGenerator(
        this.tilings[this.state.selectedTiling].getTile(v, u),
        false
      )
    );*/
  }

  render() {
    return (
      <div className="app">
        <Sidebar
          selectedTiling={this.state.selectedTiling}
          tilings={[
            "pinwheel5",
            "pinwheel10",
            "pinwheel13",
            "penrose",
            "viper",
          ]}
          setTiling={(n: number) => this.setTiling(n)}
        />
        <Canvas
          renderer={this.state.renderer}
          tiling={this.tilings[this.state.selectedTiling]}
        />
      </div>
    );
  }
}

export default App;
