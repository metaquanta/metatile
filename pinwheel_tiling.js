const fromSSide = (l) => Triangle(Vec2(0,0), l.perp(), l.scale(2).add(l.perp()));

// A->B is S side, B->C is M side, C->A is L side.
const parentFromC = (t) => {
    const m = t.b.subtract(t.c);
    const s = t.b.subtract(t.a);
    console.log(m,s)
    return Triangle(
        t.a.add(m.scale(0.5)), 
        t.b.add(s),
        t.a.subtract(m.scale(2)));
}

const subAFromParent = (t) => {
    const l = t.a.subtract(t.c);
    const m = t.b.subtract(t.c);
    return Triangle(        
        t.c.add(m.scale(0.5)),
        t.c.add(l.scale(2/5)),
        t.c
    );
}

const generateFromA = (t) => {
    //      A
    //   /  |
    // C----B
    const B = (a) => 
        Triangle(a.a, a.b, a.b.add(a.b.subtract(a.c)));    
    
    // B----C
    // |  /
    // A
    const C = (b) => Triangle(b.c, b.c.add(b.a.subtract(b.b)),b.a);
    // A
    // |  \
    // B----C
    const D = (c) => Triangle(c.b.add(c.b.subtract(c.a)) ,c.b, c.c);
    //    C
    //   /|
    //  / |
    // A--B
    const E = (d) => {
        const l = d.b.subtract(d.a);
        const eb = d.b.add(l);
        //const ea = eb.add(l.perp().invert());
        const ea = d.b.subtract(d.c).scale(0.5).add(d.b).add(d.b.subtract(d.a));
        //console.log(l, l.perp());
        return Triangle(ea, eb, d.a);
    }
    const b = B(t);
    const c = C(b);
    const d = D(c);
    return [t, b, c, d, E(d)];
}

function createPinwheelTilingViewport(viewport, context, origin, l) {
    const p = new PinwheelTiling(viewport, origin, l);
    p.grow(context);
    p.draw(context);
}

const Triangle = (a, b, c) => new _Triangle(a,b,c);

class _Triangle {
    constructor(a,b,c) {
        this.a=a;this.b=b;this.c=c;
    }
    
    draw(context)  {
        console.log("draw()",this);
      context.beginPath();
      context.moveTo(this.a.x, this.a.y);
      context.lineTo(this.b.x, this.b.y);
      context.lineTo(this.c.x, this.c.y);
      context.lineTo(this.a.x, this.a.y);
      context.stroke();
    }

    translate(v) {
        return Triangle(this.a.add(v), this.b.add(v), this.c.add(v));
    }

    children() {
        const l = this.b.subtract(this.a);
        const len = l.x*l.x+l.y*l.y;
        if(len < 2500) return [];
        if(this._children) {
            return this._children;
        }
        this._children = generateFromA(subAFromParent(this));
        /*this._children.filter(t => this.intersectsViewport(t)).
            forEach(t => t.children());*/
        
        return this._children;
    }

    drawChildren(context, viewport) {
        console.log("drawChildren", this)
        this.children().filter(t => t.intersectsViewport(viewport)).forEach(t => {
            t.draw(context);
            t.drawChildren(context, viewport);
        });
    }

    intersectsViewport(viewport) {
        /*console.log("intersectsViewport()", Math.max(this.a.x,this.b.x,this.c.x),
            (Math.max([this.a.x,this.b.x,this.c.x])), 
            (Math.min([this.a.x,this.b.x,this.c.x])),
            (Math.max([this.a.y,this.b.y,this.c.y])), 
            (Math.min([this.a.y,this.b.y,this.c.y])));*/
        if((Math.max(this.a.x,this.b.x,this.c.x) > 0) && (Math.min(this.a.x,this.b.x,this.c.x) < viewport.x) &&
        (Math.max(this.a.y,this.b.y,this.c.y) > 0) && (Math.min(this.a.y,this.b.y,this.c.y) < viewport.y)) {
            return true;
        }
        console.log("intersectsViewport = false");
        return false;
    }

}


  const Vec2 = (x, y) => ({
      x, y,
      add: (u) => Vec2(x + u.x, y + u.y),
      invert: () => Vec2(-x, -y),
      subtract(u) {
          return this.add(u.invert());
      },
      scale: (a) => Vec2(a*x, a*y),
      perp: () => Vec2(y, -x)
  })


class PinwheelTiling {
    constructor(viewport, origin, l) {
        this.viewport = viewport;
        this.triangle = fromSSide(l).translate(origin);
        console.log(this.triangle);
    }

    grow(context, n = 5) {
        console.log(this.triangle);
        this.triangle = parentFromC(this.triangle);
        this.triangle.draw(context);
        console.log(this.triangle);
        this.triangle.viewport = this.viewport;
        if(this.viewport.x > Math.max(this.triangle.a.x, this.triangle.b.x, this.triangle.c.x)) {
            return this.grow(context);
        }
        if(this.viewport.x < Math.min(this.triangle.a.x, this.triangle.b.x, this.triangle.c.x)) {
            return this.grow(context);
        }
        if(this.viewport.y > Math.max(this.triangle.a.y, this.triangle.b.y, this.triangle.c.y)) {
            return this.grow(context);
        }
        if(this.viewport.y < Math.min(this.triangle.a.y, this.triangle.b.y, this.triangle.c.y)) {
            return this.grow(context);
        }
        if(n <= 0) return;
        this.grow(context, n - 1);
    }
    
    draw(context) {
        this.triangle.draw(context);
        this.triangle.drawChildren(context, this.viewport);
    }
}