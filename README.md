# Metatile

<img align="right" src="https://tilings.metaquanta.com/sample/penrose_cropped.png" width=400 alt="Penrose-Rhomb"/>
<img align="right" src="https://tilings.metaquanta.com/sample/pinwheel_cropped.png" width=400 alt="Pinwheel"/>
<img align="right" src="https://tilings.metaquanta.com/sample/fibonacci_cropped.png" width=400 alt="Fibonacci Variant"/>
<img align="right" src="https://tilings.metaquanta.com/sample/ammann_cropped.png" width=400 alt="Ammann-Beenker"/>

Render substitution tilings live in your browser.

Some Demos:

- [Penrose Rhomb](https://tilings.metaquanta.com/?rule=Penrose-Rhomb&v=37,12&u=2924,1773&colorSaturation=0.77&colorLightness=0.53&colorHueSpan=0.24&colorHueOffset=0.69) [(source)](https://github.com/metaquanta/metatile/blob/master/src/rules/penrose-rhomb.ts)[*](https://tilings.math.uni-bielefeld.de/substitution/penrose-rhomb/)
- [Penrose Kite-Dart](https://tilings.metaquanta.com/?rule=Penrose-Kite-Dart&v=45,19&u=1685,1179&colorSaturation=0.35&colorLightness=0.51&colorHueSpan=0.24&colorHueOffset=0.63) [(source)](https://github.com/metaquanta/metatile/blob/master/src/rules/penrose-rhomb.ts)

- [Fibonacci](https://tilings.metaquanta.com/?rule=Fibonacci&tilingIncludeAncestors=y&colorAlpha=0.2&v=11,3&u=1500,1500&colorSaturation=0.4&colorLightness=0.4&colorHueSpan=0.2&colorHueOffset=0.4) [(source)](https://github.com/metaquanta/metatile/blob/master/src/rules/fibonacci.ts)[*](https://tilings.math.uni-bielefeld.de/substitution/fibonacci-times-fibonacci-variant/) with ancestor tiles also drawn.

- [Sadun's T(9/20)](https://tilings.metaquanta.com/?rule=Pinwheel&pinwheelP=9&pinwheelQ=20&v=30,0&u=1500,1500&colorSaturation=0.79&colorLightness=0.65&colorHueSpan=0.17&colorHueOffset=0.4) [(source)](https://github.com/metaquanta/metatile/blob/master/src/rules/pinwheel.ts)[*](https://arxiv.org/abs/math/9712263)
- [A grid](https://tilings.metaquanta.com/sadun_pinwheel.html?rule=Pinwheel&v=10,10&u=1019,1779&colorSaturation=0.49&colorLightness=0.75&colorHueSpan=0.23&colorHueOffset=0) of 50 consecutive examples of Sadun's family.

- [Animated Pinwheel](https://tilings.metaquanta.com/bufferless.html) demonstrating an experimental WebGL renderer without any vertex attribute buffers. (This works much better in Firefox than Chrome)

- [Random](https://tilings.metaquanta.com/)

For a list of implemented rules, see [src/rules](https://github.com/metaquanta/metatile/tree/master/src/rules). While most files in `rules` are individual substitution rules, [pinwheel.ts](https://github.com/metaquanta/metatile/blob/master/src/rules/pinwheel.ts) can generate any of the countably infinite family of pinwheel-like tilings [described by Sadun](https://arxiv.org/abs/math/9712263).

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

Alternatively, most of the knobs can be adjusted via the GET string of the demo URL.

A PNG can be saved via the canvas' context menu in Firefox and Chrome. Instructions for the SVG and WebGL renderers are forthcoming.

New rules are easy to add and pull requests are welcome.

Pictured right:

- [Penrose Rhombs](https://github.com/metaquanta/metatile/blob/master/src/rules/penrose-rhomb.ts)[*](https://tilings.math.uni-bielefeld.de/substitution/penrose-rhomb/)
- [Radin's Pinwheel](https://github.com/metaquanta/metatile/blob/master/src/rules/pinwheel.ts)[*](https://tilings.math.uni-bielefeld.de/substitution/pinwheel/)
- [Fibonacci Variant](https://github.com/metaquanta/metatile/blob/master/src/rules/fibonacci.ts)[*](https://tilings.math.uni-bielefeld.de/substitution/fibonacci-times-fibonacci-variant/)
- [Ammann-Beenker](https://github.com/metaquanta/metatile/blob/master/src/rules/ammann-beenker.ts)[*](https://tilings.math.uni-bielefeld.de/substitution/ammann-beenker/)
