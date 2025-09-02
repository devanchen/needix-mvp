// lib/toast.ts
type Listener = (text: string) => void;
let listeners: Listener[] = [];

export function onToast(cb: Listener): () => void {
  listeners.push(cb);
  return () => { listeners = listeners.filter((x) => x !== cb); };
}

export function showToast(text: string) {
  for (const l of listeners) l(text);
}
