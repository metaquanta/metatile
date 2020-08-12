# Tilings

<img align="right" src="https://tilings.metaquanta.com/sample/penrose_cropped.png" width=400 alt="Penrose-Rhomb"/>
<img align="right" src="https://tilings.metaquanta.com/sample/pinwheel_cropped.png" width=400 alt="Pinwheel"/>
<img align="right" src="https://tilings.metaquanta.com/sample/fibonacci_cropped.png" width=400 alt="Fibonacci Variant"/>
<img align="right" src="https://tilings.metaquanta.com/sample/ammann_cropped.png" width=400 alt="Ammann-Beenker"/>

Draw substitution tilings in a web-component wrapped canvas.

Demos: 
- [Sadun's T(9/20)](https://tilings.metaquanta.com/?rule=Pinwheel&pinwheelP=9&pinwheelQ=20&v=30,0&u=1500,1500&colorSaturation=0.79&colorLightness=0.65&colorHueSpan=0.17&colorHueOffset=0.4)
- [Fibonacci with ancestors included](https://tilings.metaquanta.com/?rule=Fibonacci&tilingIncludeAncestors=y&colorAlpha=0.2&v=11,3&u=1500,1500&colorSaturation=0.4&colorLightness=0.4&colorHueSpan=0.2&colorHueOffset=0.4)

As a web-component, knobs are twisted via attributes on the HTML tag.

```
<mq-tiling
    rule="Ammann-Beenker"
    v="100,5"
    u="1500,1500"
></mq-tiling>

```

`rule` is pretty straight-forward. (see tilings/rules.ts)

`v` sets the orientation and size.

`u` translates.

There are also a few settings on the `colors` attribute that effect color selection.

```
{
  saturation: 0.2,
  lightness: 0.3,
  alpha: 1.0,
  hueSpan: 0.15,
  hueOffset: 0.3
}
```

(see renderer/Colorer.ts)

Sources for the rules pictured in the images right

https://tilings.math.uni-bielefeld.de/substitution/penrose-rhomb/

https://tilings.math.uni-bielefeld.de/substitution/pinwheel/

https://tilings.math.uni-bielefeld.de/substitution/fibonacci-times-fibonacci-variant/

https://tilings.math.uni-bielefeld.de/substitution/ammann-beenker/
