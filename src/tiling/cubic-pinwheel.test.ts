import { Triangle } from "../classes/Polygon";
import { V } from "../classes/V";
import cubic from "./cubic-pinwheel";

test("parent inverts children", () => {
  const u = V(400, 0);
  const v = V(900, 200);
  const r = cubic.tileFromEdge(u, v);
  {
    const p = r.polygon() as Triangle;
    const t = r.parent().children()[0];
    const s = t.polygon() as Triangle;
    expect(p.a.equals(s.a)).toBeTruthy();
    expect(p.b.equals(s.b)).toBeTruthy();
    expect(p.c.equals(s.c)).toBeTruthy();

    expect(t.equals(r)).toBeTruthy();
  }

  {
    const p = r.polygon() as Triangle;
    const t = r.parent().parent().children()[0].children()[0];
    const s = t.polygon() as Triangle;
    expect(p.a.equals(s.a)).toBeTruthy();
    expect(p.b.equals(s.b)).toBeTruthy();
    expect(p.c.equals(s.c)).toBeTruthy();

    expect(t.equals(r)).toBeTruthy();
  }

  {
    const p = r.polygon() as Triangle;
    const t = r
      .parent()
      .parent()
      .parent()
      .children()[0]
      .children()[0]
      .children()[0];
    const s = t.polygon() as Triangle;
    expect(p.a.equals(s.a)).toBeTruthy();
    expect(p.b.equals(s.b)).toBeTruthy();
    expect(p.c.equals(s.c)).toBeTruthy();

    expect(t.equals(r)).toBeTruthy();
  }

  {
    const p = r.polygon() as Triangle;
    const t = r
      .parent()
      .parent()
      .parent()
      .parent()
      .children()[0]
      .children()[0]
      .children()[0]
      .children()[0];
    const s = t.polygon() as Triangle;
    expect(p.a.equals(s.a)).toBeTruthy();
    expect(p.b.equals(s.b)).toBeTruthy();
    expect(p.c.equals(s.c)).toBeTruthy();

    expect(t.equals(r)).toBeTruthy();
  }
});
