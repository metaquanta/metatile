(() => {
    const BORDER = 5;
    const ELEMENT_WIDTH = 10;

    const context = (document) => {
        const canvas = document.getElementsByTagName('canvas')[0];
        canvas.height = canvas.clientHeight;
        canvas.width = canvas.clientWidth;
        const context = canvas.getContext('2d');

        context.beginPath();
        context.moveTo(canvas.width - BORDER - ELEMENT_WIDTH, canvas.height - BORDER - ELEMENT_WIDTH/2);
        context.lineTo(canvas.width - BORDER - ELEMENT_WIDTH/2, canvas.height - BORDER);
        context.lineTo(canvas.width - BORDER, canvas.height - BORDER - ELEMENT_WIDTH/2);
        context.lineTo(canvas.width - BORDER - ELEMENT_WIDTH/2, canvas.height - BORDER - ELEMENT_WIDTH);
        context.lineTo(canvas.width - BORDER - ELEMENT_WIDTH, canvas.height - BORDER - ELEMENT_WIDTH/2);
        context.stroke();

        return context;
    }

    /*const Triangle = (a, b, c) => ({
      a, b, c,
      draw: (context) => {
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.lineTo(c.x, c.y);
        context.lineTo(a.x, a.y);
        context.stroke();
        console.log('QQ');
      },

      translate: (v) => Triangle(a.add(v), b.add(v), c.add(v))
    })

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

    const origin = Vec2(0, 0);
    const l = Vec2(20,0);
    //console.log(origin.subtract(l));

    // A
    // |  \
    // B----C
    //const A = (l) => Triangle(origin, Vec2(5, -l), Vec2(-2*l+5, -l-10));
    const A = (l) => Triangle(origin, l.scale(2).perp(), l.scale(4).add(l.scale(2).perp())).translate(Vec2(500,500));
    //const Al = (l) => Triangle(origin, l.scale(2).perp().scale(1/25), l.scale(4).add(l.scale(2).perp()).scale(1/25)).translate(Vec2(500,500));
    //      A
    //   /  |
    // C----B
    const B = (A,a) => {
        const c = A.b.add(A.b.subtract(A.c));
        Triangle(a.a, a.b, A.b.add(A.b.subtract(A.c)));    
    }
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

    const shrink = (t) => {
        return Triangle(t.b.subtract(t.c).scale(0.5).add(t.c), t.a.subtract(t.c).scale(2/5).add(t.c), t.c);
    }

    const PinwheelTile = (t) => {
        const tb = B(t);
        const tc = C(tb);
        const td = D(tc);
        const te = E(td);
        return { a:te.a, b:te.c, c:t.c, 
            draw: (context) => {
                t.draw(context); tb.draw(context); tc.draw(context); td.draw(context); te.draw(context);
            },
            translate: (v) => PinwheelTile(t.add(v))
        };
    } 

    const subdivide = (t) => {
        const ta = shrink(t);
        const tb = B(t);
        const tc = C(tb);
        const td = D(tc);
        const te = E(td);
        
    }

    //console.log(origin,A);
    */
    const ctx = context(document);
    /*let a = A(l);
    a.draw(ctx);
    let b = B(a);
    b.draw(ctx);
    let c = C(b);
    c.draw(ctx);
    let d = D(c);
    d.draw(ctx);
    let e = E(d);
    e.draw(ctx);

    const t = PinwheelTile(PinwheelTile(PinwheelTile(a)));
    t.draw(ctx);

    //console.log(t);*/

    
    createPinwheelTilingViewport(Vec2(1600,900), ctx, Vec2(Math.random()*2000+800,Math.random()*2000+450), Vec2(Math.random()*200,Math.random()*200));
    //t = fromSSide(Vec2(50,50)).translate(Vec2(500,500));
    //t.draw(ctx);
})();

/*
+,+
+,-
-,-
-,+
+,+


*/