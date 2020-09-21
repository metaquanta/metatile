import M from "./M";
import V from "./V";

const I = M.of(V.create(1, 0), V.create(0, 1));
const v = V.create(Math.random(), Math.random());
const m = M.of(
  V.create(Math.random(), Math.random()),
  V.create(Math.random(), Math.random()),
  v
);
const ZERO = V.create(0, 0);

test("m.invert()", () => {
  expect(I.invert()?.equals(I)).toBeTruthy();
  const n = M.of(
    V.create(Math.random(), Math.random()),
    V.create(Math.random(), Math.random())
  );
  const nInv = n.invert() as M;
  expect(n.equals(nInv)).toBeFalsy();
  expect(n.dot(nInv).equals(I)).toBeTruthy();
  expect(nInv.dot(n).equals(I)).toBeTruthy();
  //console.log(`invert(): ${m}, ${m.dot(nInv)}, ${m.dot(nInv).dot(n)}`);
  expect(m.dot(nInv).dot(n).equals(m)).toBeTruthy();
  expect(m.dot(n).equals(n)).toBeFalsy();
  expect(m.dot(n).dot(nInv).equals(m)).toBeTruthy();

  const mInv = m.invert() as M;
  expect(m.dot(v).equals(mInv.dot(v))).toBeFalsy();
  expect(m.dot(mInv.dot(v)).equals(v)).toBeTruthy();
  expect(mInv.dot(m.dot(v)).equals(v)).toBeTruthy();
});

test("m.dot()", () => {
  //expect(m.dot(ZERO).equals(ZERO)).toBeTruthy();
  // ZERO isn't really zero, it's <0,0,1>
  expect(m.dot(ZERO).equals(v)).toBeTruthy();
  expect(m.dot(1).equals(m)).toBeTruthy();
  expect(I.dot(v).equals(v)).toBeTruthy();
  expect(m.dot(v).equals(v)).toBeFalsy();
  expect(I.dot(m).equals(m)).toBeTruthy();
  //console.log(`dot(): ${m}, ${m.dot(I)}`);
  expect(m.dot(I).equals(m)).toBeTruthy();
});

test("m.toArray()", () => {
  const a = [Math.random(), Math.random(), Math.random(), Math.random()];
  const m = M.of(V.create(a[0], a[1]), V.create(a[2], a[3]));
  const b = [a[0], a[1], 0, a[2], a[3], 0, 0, 0, 1];
  expect(m.toArray()).toEqual(b);
});

test("M:of", () => {
  const u = V.create(Math.random(), Math.random());
  const m = M.of(v, u);
  expect(m.dot(V.create(1, 0)).equals(v)).toBeTruthy();
  expect(m.dot(V.create(0, 1)).equals(u)).toBeTruthy();
  expect(m.dot(V.create(1, 1)).equals(u.add(v))).toBeTruthy();
  const mInv = m.invert();
  expect(mInv?.dot(u).equals(V.create(0, 1))).toBeTruthy();
  expect(mInv?.dot(v).equals(V.create(1, 0))).toBeTruthy();
});

test("M:rotation", () => {
  expect(M.rotation(Math.PI).dot(v).equals(v.invert())).toBeTruthy();
  expect(
    M.rotation((3 * Math.PI) / 2)
      .dot(v)
      .equals(v.perp())
  ).toBeTruthy();
  expect(
    M.rotation(2 * Math.PI)
      .dot(v)
      .equals(v)
  ).toBeTruthy();
});

test("M:scaling", () => {
  const s = Math.random();
  expect(M.scaling(1).equals(I)).toBeTruthy();
  expect(M.scaling(s).dot(v).equals(v.scale(s)));
});

test("M:translation", () => {
  expect(M.translation(v).equals(I)).toBeFalsy();
  expect(M.translation(ZERO).equals(I)).toBeTruthy();
  expect(M.translation(ZERO).dot(v).equals(v)).toBeTruthy();
  expect(M.translation(v).dot(ZERO).equals(v)).toBeTruthy();
  const u = V.create(Math.random(), Math.random());
  expect(M.translation(u).dot(v).equals(u.add(v))).toBeTruthy();
  expect(M.translation(u).dot(m).dot(v).equals(m.dot(v).add(u))).toBeTruthy();
  expect(
    m
      .dot(M.translation(u))
      .dot(v)
      .equals(m.dot(v.add(u)))
  ).toBeTruthy();
  expect(M.translation(u).invert()?.dot(v).equals(v.subtract(u))).toBeTruthy();
  expect(
    M.of(V.create(1, 0), V.create(0, 1), V.create(u.x, u.y)).equals(
      M.translation(u)
    )
  ).toBeTruthy();
});
