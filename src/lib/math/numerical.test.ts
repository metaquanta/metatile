import { invertFunction } from "./numerical";
import { gcd } from "./util";

test("invert() inverts trivial", () => {
  const eps = 0.000001;
  const f = (x: number) => x;
  const g = invertFunction(f, [-10, 10], eps);
  expect(g(0)).toBeLessThan(eps);
  expect(g(1)).toBeGreaterThan(1 - eps);
});

test("invert() inverts non-trivial", () => {
  const domain: [number, number] = [0, Math.PI / 2];
  const g = invertFunction(
    (theta: number) =>
      Math.log(Math.sin(theta)) / Math.log(Math.cos(theta) / 2),
    domain
  );
  // T(2): a = sqrt(5) - 2, b = 2(sqrt(5) - 2)^(1/2), c = 1, theta ~= 0.238317
  expect(g(2) - 0.238317).toBeLessThan(0.000001);
  // T(1/2): a = (2(17^(1/2) - 1))^(1/2), b = 17^(1/2) - 1, c = 4,
  // theta ~= 0.674889
  expect(g(1 / 2) - 0.674889).toBeLessThan(0.000001);
  expect(Math.abs(g(1 / 3) - Math.PI / 4)).toBeLessThan(0.00000001);
});

test("gcd", () => {
  expect(gcd(13, 20)).toEqual(1);
  expect(gcd(5, 1000)).toEqual(5);
  expect(gcd(128, 4352323) === 2).toBeFalsy();
});
