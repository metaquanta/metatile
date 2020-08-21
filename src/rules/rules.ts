import ammannBeenker from "./ammann-beenker.js";
import fibonacci from "./fibonacci.js";
import minitangram from "./minitangram.js";
import penroseKiteDart from "./penrose-kite-dart.js";
import penroseRhomb from "./penrose-rhomb.js";
import pinwheel from "./pinwheel.js";
import pinwheel10 from "./pinwheel10.js";
import pinwheel13 from "./pinwheel13.js";
import viper from "./viper.js";

export default {
  "Ammann-Beenker": ammannBeenker,
  Fibonacci: fibonacci,
  MiniTangram: minitangram,
  "Penrose-Kite-Dart": penroseKiteDart,
  "Penrose-Rhomb": penroseRhomb,
  Pinwheel: pinwheel,
  Pinwheel10: pinwheel10,
  Pinwheel13: pinwheel13,
  Viper: viper
};

export interface RuleOptions {
  pinwheel?: { p: number; q: number };
}
