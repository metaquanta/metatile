import ammannBeenker from "./ammann-beenker";
import fibonacci from "./fibonacci";
import minitangram from "./minitangram";
import penroseKiteDart from "./penrose-kite-dart";
import penroseRhomb from "./penrose-rhomb";
import pinwheel from "./pinwheel";
import pinwheel10 from "./pinwheel10";
import pinwheel13 from "./pinwheel13";
import pythagoras from "./pythagoras";
import pythia from "./pythia";
import viper from "./viper";

export default {
  "Ammann-Beenker": ammannBeenker,
  Fibonacci: fibonacci,
  MiniTangram: minitangram,
  "Penrose-Kite-Dart": penroseKiteDart,
  "Penrose-Rhomb": penroseRhomb,
  Pinwheel: pinwheel,
  Pinwheel10: pinwheel10,
  Pinwheel13: pinwheel13,
  Pythagoras: pythagoras,
  Pythia: pythia,
  Viper: viper
};

export interface RuleOptions {
  pinwheel?: { p: number; q: number };
  pythagoras?: { m: number; j: number };
  pythia?: { m: number; j: number };
}
