// lib/toast.ts
type Listener = (msg: string) => void;

const listeners = new Set<Listener>();

export function showToast(message: string): void {
  for (const fn of listeners) fn(message);
}

export function onToast(fn: Listener): () => void {
  listeners.add(fn);
  // cleanup must return void, not boolean
  return () => {
    listeners.delete(fn);
  };
}
