import { V } from "./classes/V";

const EPS = 0.00001;

export function mapOf<K, V>(...entries: [K, V][]): Map<K, V> {
  const m = new Map<K, V>();
  entries.forEach((pair) => m.set(pair[0], pair[1]));
  return m;
}

export function isCallable<T, V>(f: ((p: V) => T) | T): boolean {
  return (f as () => T).call !== undefined;
}

export function theta(a: V): number {
  return (
    (Math.atan(a.y / a.x) + (a.x > 0 ? Math.PI : 0) + Math.PI * 2) %
    (Math.PI * 2)
  );
}

export function vsEqual(u: V, v: V): boolean {
  return Math.abs(u.x - v.x) < EPS && Math.abs(u.y - v.y) < EPS;
}
