import { Rect, Tetragon, Triangle } from "./Polygon";
import { V } from "./V";

test("Rect.translate()", () => {
  const v = V(23, 75);
  const p = Rect(5, 5, 136, 36);
  const q = p.translate(v);
  const a = q.vertices()[0];
  const b = q.vertices()[1];
  const c = q.vertices()[2];
  const d = q.vertices()[3];
  const i = V(5 + 23, 5 + 75);
  const j = V(136 + 23, 5 + 75);
  const k = V(136 + 23, 36 + 75);
  const l = V(5 + 23, 36 + 75);
  expect(a.equals(i)).toBeTruthy;
  expect(b.equals(j)).toBeTruthy;
  expect(c.equals(k)).toBeTruthy;
  expect(d.equals(l)).toBeTruthy;
});

test("Rect.vertices()", () => {
  const q = Rect(5, 5, 136, 36);
  const a = q.vertices()[0];
  const b = q.vertices()[1];
  const c = q.vertices()[2];
  const d = q.vertices()[3];
  const i = V(5, 5);
  const j = V(136, 5);
  const k = V(136, 36);
  const l = V(5, 36);
  expect(a.equals(i)).toBeTruthy;
  expect(b.equals(j)).toBeTruthy;
  expect(c.equals(k)).toBeTruthy;
  expect(d.equals(l)).toBeTruthy;
});

test("Rect.covers()", () => {
  const q = Rect(5, 5, 136, 36);
  const t = Triangle(V(6, 6), V(135, 27), V(100, 35));
  const s = Triangle(V(6, 6), V(135, 37), V(100, 35));
  expect(q.contains(t)).toBeTruthy;
  expect(q.contains(s)).toBeFalsy;
});

test("Triangle.covers()", () => {
  const t = Triangle(V(5, 5), V(55, 7), V(30, 30));
  const r = Rect(4, 4, 56, 31);
  const s = Rect(4, 4, 10, 10);
  expect(t.contains(r)).toBeFalsy;
  expect(t.contains(s)).toBeTruthy;
});

test("Triangle.contains()", () => {
  const t1 = Triangle(V(650, 134), V(656, 364), V(-25, 364));
  const t2 = Triangle(V(650, 134), V(-25, 134), V(-25, 364));
  for (let i = 0; i < 1000; i++) {
    const v = V(Math.random() * 775, Math.random() * 230).add(V(-25, 134));
    expect(t1.contains(v) || t2.contains(v)).toBeTruthy;
    expect(t1.contains(v) && t2.contains(v)).toBeFalsy;
  }
});

test("Triangle.intersects()", () => {
  const t1 = Triangle(V(650, 134), V(656, 364), V(-25, 364));
  const t2 = Triangle(V(650, 134), V(-25, 134), V(-25, 364));
  for (let i = 0; i < 1000; i++) {
    const v = V(Math.random() * 775, Math.random() * 230).add(V(-25, 134));
    const u = V(Math.random() * 775, Math.random() * 230).add(V(-25, 134));
    const w = V(Math.random() * 775, Math.random() * 230).add(V(-25, 134));
    const tp = Triangle(v, u, w);
    const c = V(Math.random() * 775, Math.random() * 230).add(V(-25, 134));
    const b = V(Math.random() * 775, Math.random() * 230).add(V(-25, 134));
    const a = V(Math.random() * 775, Math.random() * 230).add(V(-25, 134));
    const sp = Triangle(c, b, a);
    expect(tp.intersects(t1) || t2.intersects(tp)).toBeTruthy;
    expect(sp.intersects(tp) == tp.intersects(sp)).toBeTruthy;
    expect(tp.intersects(t1) == t1.intersects(tp)).toBeTruthy;
    expect(sp.intersects(t2) == t2.intersects(sp)).toBeTruthy;
  }
  expect(
    Triangle(
      V(231.33628675421036, 799.5215543539744),
      V(178.66371324578964, 1522.4784456460256),
      V(-125.2477849343422, 864.3911657654808)
    ).intersects(
      Tetragon(V(200, 1000), V(2500, 1000), V(2500, 2000), V(200, 2000))
    )
  ).toBeTruthy;
  expect(
    Triangle(
      V(231.33628675421036, 799.5215543539744),
      V(178.66371324578964, 1522.4784456460256),
      V(-125.2477849343422, 864.3911657654808)
    ).intersects(Rect(200, 1000, 2500, 2000))
  ).toBeTruthy;
});
