import { Rect } from "../lib/math/2d/Polygon";
import V from "../lib/math/2d/V";
import {
  canCoverArbitraryVp,
  inflationFactor,
  similarChildren
} from "../rule-sanity-check";
import viper from "./viper";

test("viper children intersect", () => {
  const rect = Rect.create(2000, 1000, 2500, 2000);
  const t = viper.tileFromEdge(V.create(700, 51), V.create(905, 1212));
  t.parent()
    .children()
    .slice(7, 9)
    .forEach((t) => expect(t.intersects(rect)).toBeTruthy());
  const rect2 = Rect.create(200, 1000, 2500, 2000);
  expect(
    t.parent().parent().parent().children()[2].intersects(rect2)
  ).toBeTruthy();
  expect(
    t.parent().parent().children()[3].children()[7].intersects(rect2)
  ).toBeTruthy();
  expect(t.parent().parent().children()[4].intersects(rect2)).toBeTruthy();
  expect(
    t.parent().parent().children()[4].children()[2].intersects(rect2)
  ).toBeTruthy();
  expect(
    t
      .parent()
      .parent()
      .children()[4]
      .children()[2]
      .intersects(Rect.create(200, 1000, 2500, 2000))
  ).toBeTruthy();
});

test("viper cover", () => {
  const rect = Rect.create(2000, 1000, 2500, 2000);
  const t = viper.tileFromEdge(V.create(700, 51), V.create(905, 1212));
  expect(t.parent().parent().contains(rect)).toBeFalsy();
  expect(t.parent().parent().parent().contains(rect)).toBeTruthy();
});

test("viper sanity", () => {
  const t = viper.tile();
  const children = similarChildren(t);
  // All children are similar
  expect(children.length).toEqual(9);
  // 3
  expect(Math.abs(inflationFactor(t, children[5]) - 3)).toBeLessThan(0.0000001);

  expect(canCoverArbitraryVp(viper)).toBeTruthy();
});
