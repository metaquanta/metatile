export function gcd(a: number, b: number): number {
  if (a < b) return gcd(b, a);
  const r = a % b;
  if (r === 0) return b;
  return gcd(b, r);
}
