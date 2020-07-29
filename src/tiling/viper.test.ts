import { intersects, Rect } from "../classes/Polygon";
import { V } from "../classes/V";
import viper from "./viper";

test("viper children intersect", () => {
  const rect = Rect(2000, 1000, 2500, 2000);
  const t = viper.tileFromEdge(V(700, 51), V(905, 1212));
  t.parent()
    .children()
    .slice(6)
    .forEach((t) => expect(rect.intersects(t)).toBeFalsy);
  t.parent()
    .children()
    .slice(7, 9)
    .forEach((t) => expect(rect.intersects(t)).toBeTruthy);
  t.parent()
    .children()
    .slice(6)
    .forEach((t) => expect(t.intersects(rect)).toBeFalsy);
  t.parent()
    .children()
    .slice(7, 9)
    .forEach((t) => expect(t.intersects(rect)).toBeTruthy);
  const rect2 = Rect(200, 1000, 2500, 2000);
  expect(t.parent().parent().parent().children()[2].intersects(rect2))
    .toBeTruthy;
  expect(rect2.intersects(t.parent().parent().parent().children()[2]))
    .toBeTruthy;
  expect(t.parent().parent().children()[3].children()[7].intersects(rect2))
    .toBeTruthy;
  expect(rect2.intersects(t.parent().parent().children()[3].children()[7]))
    .toBeTruthy;
  expect(t.parent().parent().children()[4].intersects(rect2)).toBeTruthy;
  expect(rect2.intersects(t.parent().parent().children()[4])).toBeTruthy;
  expect(t.parent().parent().children()[4].children()[2].intersects(rect2))
    .toBeTruthy;
  expect(intersects(t.parent().parent().children()[4].children()[2], rect2))
    .toBeTruthy;
  expect(rect2.intersects(t.parent().parent().children()[4].children()[2]))
    .toBeTruthy;
  expect(
    Rect(200, 1000, 2500, 2000).intersects(
      t.parent().parent().children()[4].children()[2]
    )
  ).toBeTruthy;
});

test("viper cover", () => {
  const rect = Rect(2000, 1000, 2500, 2000);
  const t = viper.tileFromEdge(V(700, 51), V(905, 1212));
  expect(t.parent().parent().contains(rect)).toBeFalsy;
  expect(t.parent().parent().parent().contains(rect)).toBeTruthy;
});
