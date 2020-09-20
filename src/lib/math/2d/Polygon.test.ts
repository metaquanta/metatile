import { Rect, Tetragon, Triangle } from "./Polygon";
import V from "./V";

test("Rect.translate()", () => {
  const v = V.create(23, 75);
  const p = Rect.create(5, 5, 136, 36);
  const q = p.translate(v);
  const [a, b, c, d] = q.vertices();
  const i = V.create(5 + 23, 5 + 75);
  const j = V.create(136 + 23, 5 + 75);
  const k = V.create(136 + 23, 36 + 75);
  const l = V.create(5 + 23, 36 + 75);
  expect(a.equals(i)).toBeTruthy();
  expect(b.equals(j)).toBeTruthy();
  expect(c.equals(k)).toBeTruthy();
  expect(d.equals(l)).toBeTruthy();
});

test("Rect.vertices()", () => {
  const q = Rect.create(5, 5, 136, 36);
  const [a, b, c, d] = q.vertices();
  const i = V.create(5, 5);
  const j = V.create(136, 5);
  const k = V.create(136, 36);
  const l = V.create(5, 36);
  expect(a.equals(i)).toBeTruthy();
  expect(b.equals(j)).toBeTruthy();
  expect(c.equals(k)).toBeTruthy();
  expect(d.equals(l)).toBeTruthy();
});

test("Rect.covers()", () => {
  const q = Rect.create(5, 5, 136, 36);
  const t = Triangle.create(
    V.create(6, 6),
    V.create(135, 27),
    V.create(100, 35)
  );
  const s = Triangle.create(
    V.create(6, 6),
    V.create(135, 37),
    V.create(100, 35)
  );
  expect(q.contains(t)).toBeTruthy();
  expect(q.contains(s)).toBeFalsy();
});

test("Triangle.covers()", () => {
  const t = Triangle.create(V.create(5, 5), V.create(55, 7), V.create(30, 30));
  const r = Rect.create(4, 4, 56, 31);
  const s = Rect.create(25, 10, 35, 20);
  expect(t.contains(r)).toBeFalsy();
  expect(t.contains(s)).toBeTruthy();
});

test("Triangle.contains()", () => {
  const t1 = Triangle.create(
    V.create(650, 134),
    V.create(656, 364),
    V.create(-25, 364)
  );
  const t2 = Triangle.create(
    V.create(650, 134),
    V.create(-25, 134),
    V.create(-25, 364)
  );
  for (let i = 0; i < 1000; i++) {
    const v = V.create(Math.random() * 675, Math.random() * 230).add(
      V.create(-25, 134)
    );
    expect(t1.contains(v) || t2.contains(v)).toBeTruthy();
    expect(t1.contains(v) && t2.contains(v)).toBeFalsy();
  }
});

test("Triangle.intersects()", () => {
  const t1 = Triangle.create(
    V.create(650, 134),
    V.create(656, 364),
    V.create(-25, 364)
  );
  const t2 = Triangle.create(
    V.create(650, 134),
    V.create(-25, 134),
    V.create(-25, 364)
  );
  for (let i = 0; i < 1000; i++) {
    const v = V.create(Math.random() * 675, Math.random() * 230).add(
      V.create(-25, 134)
    );
    const u = V.create(Math.random() * 675, Math.random() * 230).add(
      V.create(-25, 134)
    );
    const w = V.create(Math.random() * 675, Math.random() * 230).add(
      V.create(-25, 134)
    );
    const tp = Triangle.create(v, u, w);
    const c = V.create(Math.random() * 675, Math.random() * 230).add(
      V.create(-25, 134)
    );
    const b = V.create(Math.random() * 675, Math.random() * 230).add(
      V.create(-25, 134)
    );
    const a = V.create(Math.random() * 675, Math.random() * 230).add(
      V.create(-25, 134)
    );
    const sp = Triangle.create(c, b, a);
    expect(tp.intersects(t1) || t2.intersects(tp)).toBeTruthy();
    expect(sp.intersects(tp) == tp.intersects(sp)).toBeTruthy();
    expect(tp.intersects(t1) == t1.intersects(tp)).toBeTruthy();
    expect(sp.intersects(t2) == t2.intersects(sp)).toBeTruthy();
  }
  expect(
    Triangle.create(
      V.create(231.33628675421036, 799.5215543539744),
      V.create(178.66371324578964, 1522.4784456460256),
      V.create(-125.2477849343422, 864.3911657654808)
    ).intersects(
      Tetragon.create(
        V.create(200, 1000),
        V.create(2500, 1000),
        V.create(2500, 2000),
        V.create(200, 2000)
      )
    )
  ).toBeTruthy();
  expect(
    Triangle.create(
      V.create(231.33628675421036, 799.5215543539744),
      V.create(178.66371324578964, 1522.4784456460256),
      V.create(-125.2477849343422, 864.3911657654808)
    ).intersects(Rect.create(200, 1000, 2500, 2000))
  ).toBeTruthy();
});
