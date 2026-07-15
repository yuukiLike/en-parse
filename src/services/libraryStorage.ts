import { createEmptyLibrary, normalizeLibrary, type PhraseLensLibrary } from "../domain/library";

const storageKey = "phrase-lens-library-v1";

export function loadLibrary(): PhraseLensLibrary {
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return createEmptyLibrary();
    return normalizeLibrary(JSON.parse(saved));
  } catch {
    return createEmptyLibrary();
  }
}

export function persistLibrary(library: PhraseLensLibrary) {
  window.localStorage.setItem(storageKey, JSON.stringify(library));
}
