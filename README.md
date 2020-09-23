# Metatile

<img align="right" src="https://tilings.metaquanta.com/sample/penrose_cropped.png" width=400 alt="Penrose-Rhomb"/>
<img align="right" src="https://tilings.metaquanta.com/sample/pinwheel_cropped.png" width=400 alt="Pinwheel"/>
<img align="right" src="https://tilings.metaquanta.com/sample/fibonacci_cropped.png" width=400 alt="Fibonacci Variant"/>
<img align="right" src="https://tilings.metaquanta.com/sample/ammann_cropped.png" width=400 alt="Ammann-Beenker"/>

Render substitution tilings live in your browser.

Some Demos:

- [Sadun's T(9/20)](https://tilings.metaquanta.com/?rule=Pinwheel&pinwheelP=9&pinwheelQ=20&v=30,0&u=1500,1500&colorSaturation=0.79&colorLightness=0.65&colorHueSpan=0.17&colorHueOffset=0.4)
- [Fibonacci with ancestors included](https://tilings.metaquanta.com/?rule=Fibonacci&tilingIncludeAncestors=y&colorAlpha=0.2&v=11,3&u=1500,1500&colorSaturation=0.4&colorLightness=0.4&colorHueSpan=0.2&colorHueOffset=0.4)
- [Penrose Rhomb](https://tilings.metaquanta.com/?rule=Penrose-Rhomb&v=25,35&u=1500,1400&colorSaturation=0.55&colorLightness=0.45&colorHueSpan=0.33&colorHueOffset=0.33)
- [Random](https://tilings.metaquanta.com/)

For a list of implimented rules, see [src/rules](https://github.com/metaquanta/metatile/tree/master/src/rules). While most files in `rules` are individual substitution rules, [pinwheel.ts](https://github.com/metaquanta/metatile/blob/master/src/rules/pinwheel.ts) can generate any of the countably infinite family of pinwheel-like tilings [described by Sadun](https://arxiv.org/abs/math/9712263).

[TilingElement.ts](https://github.com/metaquanta/metatile/blob/master/src/TilingElement.ts) is the Web Component interface to **metatile**.
As a web-component, most knobs are exposed via HTML attributes.

```
<mq-tiling
    rule="Ammann-Beenker"
    v="100,5"
    u="1500,1500"
></mq-tiling>

```

See [params.ts](https://github.com/metaquanta/metatile/blob/master/src/params.ts) for a complete list.

There is also an SVG generator and a Vertex-buffer-free WebGL renderer is in progress.

New rules are easy to add and pull requests are welcome.

Pictured at right:

[Penrose Rhombs](https://tilings.math.uni-bielefeld.de/substitution/penrose-rhomb/)

[Radin's Pinwheel](https://tilings.math.uni-bielefeld.de/substitution/pinwheel/)

[Fibonacci Variant](https://tilings.math.uni-bielefeld.de/substitution/fibonacci-times-fibonacci-variant/)

[Ammann-Beenker](https://tilings.math.uni-bielefeld.de/substitution/ammann-beenker/)
