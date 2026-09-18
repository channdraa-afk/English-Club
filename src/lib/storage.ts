/**
 * Safe Storage Guardrail
 * Provides safe access to window.localStorage and window.sessionStorage with in-memory fallback.
 * Prevents fatal SecurityError / DOMException crashes in sandboxed iframes, strict private browsing,
 * or hostile browser extensions.
 */

const memoryStore: Record<string, string> = {};

export const safeStorage = {
  get: (key: string, type: 'local' | 'session' = 'local'): string | null => {
    try {
      if (typeof window !== 'undefined') {
        const storage = type === 'local' ? window.localStorage : window.sessionStorage;
        if (storage) {
          return storage.getItem(key);
        }
      }
    } catch {
      // Storage access blocked by browser policy / iframe sandbox
    }
    return memoryStore[`${type}_${key}`] ?? null;
  },

  set: (key: string, value: string, type: 'local' | 'session' = 'local'): boolean => {
    try {
      if (typeof window !== 'undefined') {
        const storage = type === 'local' ? window.localStorage : window.sessionStorage;
        if (storage) {
          storage.setItem(key, value);
          return true;
        }
      }
    } catch {
      // Storage access blocked, fallback to memory
    }
    memoryStore[`${type}_${key}`] = value;
    return true;
  },

  remove: (key: string, type: 'local' | 'session' = 'local'): boolean => {
    try {
      if (typeof window !== 'undefined') {
        const storage = type === 'local' ? window.localStorage : window.sessionStorage;
        if (storage) {
          storage.removeItem(key);
          delete memoryStore[`${type}_${key}`];
          return true;
        }
      }
    } catch {
      // Fallback
    }
    delete memoryStore[`${type}_${key}`];
    return true;
  },
};
