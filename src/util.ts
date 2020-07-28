export function mapOf<K, V>(...entries: [K, V][]): Map<K, V> {
  const m = new Map<K, V>();
  entries.forEach((pair) => m.set(pair[0], pair[1]));
  return m;
}

export function isCallable<T, V>(f: ((p: V) => T) | T): boolean {
  return (f as () => T).call !== undefined;
}
