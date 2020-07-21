import React, { useState } from "react";
import Canvas from "./Canvas";
import Sidebar from "./Sidebar";
import penrose from "../tiling/penrose";
import pinwheel10 from "../tiling/pinwheel10";
import pinwheel13 from "../tiling/pinwheel13";
import pinwheel5 from "../tiling/pinwheel5";
import viper from "../tiling/viper";
import { colorAngles, colorStreamer } from "../renderer/Colorer";

export default function App() {
  const [state, setState] = useState({ selectedTiling: 0 });

  function setTiling(tiling: number) {
    setState({ selectedTiling: tiling });
  }

  const tilings = [pinwheel5(), pinwheel10(), pinwheel13(), penrose(), viper()];

  const colorer = colorStreamer(colorAngles(4, 2, 50, 50));

  return (
    <div className="app">
      <Sidebar
        selectedTiling={state.selectedTiling}
        tilings={["pinwheel5", "pinwheel10", "pinwheel13", "penrose", "viper"]}
        setTiling={setTiling}
      />
      <Canvas tiling={tilings[state.selectedTiling]} colorer={colorer}} />
    </div>
  );
}
