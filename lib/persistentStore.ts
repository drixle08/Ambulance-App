/**
 * Tiny external store backed by Web Storage, for use with useSyncExternalStore.
 *
 * Module-level memory is the source of truth, so a tool keeps working even
 * when storage is unavailable (private browsing, blocked site data). The
 * stored value is read lazily on first access on the client.
 */

export type Store<T> = {
  get: () => T;
  set: (value: T) => void;
  subscribe: (listener: () => void) => () => void;
};

export function createStore<T>(
  storage: () => Storage,
  key: string,
  fallback: T,
  parse: (raw: unknown) => T
): Store<T> {
  const listeners = new Set<() => void>();
  let value = fallback;
  let loaded = false;

  function get(): T {
    if (!loaded && typeof window !== "undefined") {
      loaded = true;
      try {
        const raw = storage().getItem(key);
        if (raw) value = parse(JSON.parse(raw));
      } catch {
        /* storage unavailable or corrupt — keep fallback */
      }
    }
    return value;
  }

  function set(next: T) {
    value = next;
    loaded = true;
    try {
      storage().setItem(key, JSON.stringify(next));
    } catch {
      /* storage unavailable — memory copy still works for this session */
    }
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { get, set, subscribe };
}
