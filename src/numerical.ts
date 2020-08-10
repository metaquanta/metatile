export function invertFunction(
  f: (x: number) => number,
  range: [number, number],
  epsilon = 0.0000000002
): (y: number) => number {
  const left = isFinite(f(range[0])) ? range[0] : range[0] + epsilon;
  const right = isFinite(f(range[1])) ? range[1] : range[1] - epsilon;
  const leftY = f(left);
  const rightY = f(right);
  return function (y: number) {
    const g = (x: number) => Math.abs(f(x) - y);

    if (Math.abs(leftY - y) < epsilon) return range[0];
    if (Math.abs(rightY - y) < epsilon) return range[1];

    const rough = Math.min(g(right), g(left)) / 100;
    const est = bisectionMethod((x) => f(x) - y, left, right, rough);

    return secantMethod(
      (x) => f(x) - y,
      est + rough / 2,
      est - rough / 2,
      epsilon
    );
  };
}

function secantMethod(
  f: (x: number) => number,
  x0: number,
  x1: number,
  epsilon: number,
  y0 = f(x0)
): number {
  if (isNaN(x0) || isNaN(x1) || isNaN(y0))
    throw new Error(
      `secandMethod(f, ${x0}, ${x1}, ${epsilon}, ${y0}) NaN supplied`
    );
  const y1 = f(x1);
  if (Math.abs(y1) < epsilon) return x1;
  const x2 = x1 - (y1 * (x1 - x0)) / (y1 - y0);
  //console.debug(`secantMethod(f, ${x0}, ${x1}) - [${y1}, ${x2}]`);
  return secantMethod(f, x1, x2, epsilon, y1);
}

function bisectionMethod(
  f: (x: number) => number,
  x0: number,
  x1: number,
  epsilon: number,
  y0 = f(x0),
  y1 = f(x1)
): number {
  if (isNaN(x0) || isNaN(x1) || isNaN(y0))
    throw new Error(
      `bisectionMethod(f, ${x0}, ${x1}, ${epsilon}, ${y0} NaN supplied.`
    );
  if (y0 < 0 === y1 < 0)
    throw new Error(
      `bisectionMethod(f, ${x0}, ${x1}, ${epsilon}, ${y0}) ` +
        `[${y0}, ${y1}] solution is not bracketed.`
    );
  const x2 = (x0 + x1) / 2;
  const y2 = f(x2);
  //console.debug(`bisectionMethod(f, ${x0}, ${x1}) - [${y2}, ${x2}]`);

  if (Math.abs(y2) < epsilon) {
    return x2;
  }

  return bisectionMethod(
    f,
    y0 < 0 === y2 < 0 ? x2 : x0,
    y1 < 0 === y2 < 0 ? x2 : x1,
    epsilon,
    y0 < 0 === y2 < 0 ? y2 : y0,
    y1 < 0 === y2 < 0 ? y2 : y1
  );
}
