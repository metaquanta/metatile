import React, { useState } from "react";
import Canvas from "./Canvas";
import Sidebar from "./Sidebar";
import penrose from "./tilings/penrose";
import pinwheel10 from "./tilings/pinwheel10";
import pinwheel13 from "./tilings/pinwheel13";
import pinwheel5 from "./tilings/pinwheel5";
import viper from "./tilings/viper";

export default function App() {
  const [state, setState] = useState({ selectedTiling: 0 });

  function setTiling(tiling: number) {
    setState({ selectedTiling: tiling });
  }

  const tilings = [pinwheel5(), pinwheel10(), pinwheel13(), penrose(), viper()];

  return (
    <div className="app">
      <Sidebar
        selectedTiling={state.selectedTiling}
        tilings={["pinwheel5", "pinwheel10", "pinwheel13", "penrose", "viper"]}
        setTiling={setTiling}
      />
      <Canvas tiling={tilings[state.selectedTiling]} />
    </div>
  );
}
