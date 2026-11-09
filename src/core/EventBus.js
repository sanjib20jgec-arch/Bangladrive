const listeners = new Map();

export const EventBus = Object.freeze({
  on(type, handler) {
    let set = listeners.get(type);
    if (!set) listeners.set(type, (set = new Set()));
    set.add(handler);
    return () => set.delete(handler);
  },
  emit(type, payload) {
    const set = listeners.get(type);
    if (!set) return;
    for (const handler of set) handler(payload);
  },
  clear() { listeners.clear(); },
});
