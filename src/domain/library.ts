import type { PhraseMark, ReadingAnalysis } from "./parser";
import { normalizeSpaces } from "./parser";

export type SourceRecord = {
  id: string;
  kind: "paste" | "webpage" | "clipboard" | "import";
  title: string;
  url: string | null;
  app: "web" | "extension" | "raycast" | "ios";
  createdAt: string;
  updatedAt: string;
};

export type WordbookExample = {
  text: string;
  translation: string;
  sourceId: string;
};

export type WordbookItem = {
  id: string;
  fingerprint: string;
  kind: "phrase" | "structure";
  text: string;
  meaning: string;
  examples: WordbookExample[];
  tags: string[];
  sourceIds: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type MemoryRecord = {
  id: string;
  kind: "copied-notes";
  text: string;
  title: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type SessionMark = {
  itemId: string;
  text: string;
  color: "red" | "green";
  meaning: string;
  sentenceIndex: number;
  sentenceText: string;
  translation: string;
};

export type SessionRecord = {
  id: string;
  title: string;
  sourceText: string;
  sentenceCount: number;
  markCount: number;
  marks: SessionMark[];
  sourceId: string;
  createdAt: string;
  updatedAt: string;
};

export type PhraseLensLibrary = {
  format: "phrase-lens-library";
  version: 1;
  createdAt: string;
  updatedAt: string;
  wordbook: WordbookItem[];
  memories: MemoryRecord[];
  sessions: SessionRecord[];
  sources: SourceRecord[];
};

export type LibraryStats = {
  phrases: number;
  memories: number;
  sessions: number;
};

export function nowIso() {
  return new Date().toISOString();
}

export function createId(prefix: string) {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `${prefix}_${uuid}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function createEmptyLibrary(): PhraseLensLibrary {
  const createdAt = nowIso();

  return {
    format: "phrase-lens-library",
    version: 1,
    createdAt,
    updatedAt: createdAt,
    wordbook: [],
    memories: [],
    sessions: [],
    sources: [],
  };
}

export function normalizeLibrary(value: unknown): PhraseLensLibrary {
  const fallback = createEmptyLibrary();
  const source = value && typeof value === "object" ? (value as Partial<PhraseLensLibrary>) : {};

  return {
    ...fallback,
    ...source,
    format: "phrase-lens-library",
    version: 1,
    wordbook: Array.isArray(source.wordbook) ? source.wordbook : [],
    memories: Array.isArray(source.memories) ? source.memories : [],
    sessions: Array.isArray(source.sessions) ? source.sessions : [],
    sources: Array.isArray(source.sources) ? source.sources : [],
  };
}

export function getLibraryStats(library: PhraseLensLibrary): LibraryStats {
  return {
    phrases: library.wordbook.filter((item) => item.deletedAt == null).length,
    memories: library.memories.filter((item) => item.deletedAt == null).length,
    sessions: library.sessions.length,
  };
}

function phraseFingerprint(phrase: Pick<PhraseMark, "color" | "text">) {
  return `${phrase.color}:${normalizeSpaces(phrase.text).toLowerCase()}`;
}

function upsertWordbookItem(
  library: PhraseLensLibrary,
  phrase: PhraseMark,
  sourceId: string,
  timestamp: string,
) {
  const fingerprint = phraseFingerprint(phrase);
  const existing = library.wordbook.find((item) => item.fingerprint === fingerprint);
  const example: WordbookExample = {
    text: phrase.sentenceText,
    translation: phrase.translation,
    sourceId,
  };

  if (existing) {
    existing.updatedAt = timestamp;
    existing.meaning = phrase.meaning;
    existing.sourceIds = Array.from(new Set([...(existing.sourceIds ?? []), sourceId]));
    existing.examples = existing.examples ?? [];

    const hasExample = existing.examples.some((item) => item.text === example.text);
    if (!hasExample) existing.examples.push(example);

    return existing.id;
  }

  const item: WordbookItem = {
    id: createId("item"),
    fingerprint,
    kind: phrase.color === "red" ? "phrase" : "structure",
    text: normalizeSpaces(phrase.text),
    meaning: phrase.meaning,
    examples: [example],
    tags: phrase.color === "red" ? ["phrase"] : ["structure"],
    sourceIds: [sourceId],
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
  };

  library.wordbook.push(item);
  return item.id;
}

export function saveReadingSession(
  currentLibrary: PhraseLensLibrary,
  analysis: ReadingAnalysis,
  sourceText: string,
  title: string,
) {
  const library = structuredClone(currentLibrary);
  const timestamp = nowIso();
  const sourceId = createId("src");
  const sessionId = createId("session");

  library.sources.push({
    id: sourceId,
    kind: "paste",
    title,
    url: null,
    app: "web",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const marks = analysis.phrases.map<SessionMark>((phrase) => ({
    itemId: upsertWordbookItem(library, phrase, sourceId, timestamp),
    text: normalizeSpaces(phrase.text),
    color: phrase.color,
    meaning: phrase.meaning,
    sentenceIndex: phrase.sentenceIndex,
    sentenceText: phrase.sentenceText,
    translation: phrase.translation,
  }));

  library.sessions.push({
    id: sessionId,
    title,
    sourceText,
    sentenceCount: analysis.sentences.length,
    markCount: analysis.phrases.length,
    marks,
    sourceId,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  library.updatedAt = timestamp;

  return library;
}

export function addCopiedMemory(
  currentLibrary: PhraseLensLibrary,
  noteText: string,
  title: string,
  itemCount: number,
) {
  const library = structuredClone(currentLibrary);
  const timestamp = nowIso();

  library.memories.push({
    id: createId("mem"),
    kind: "copied-notes",
    text: noteText,
    title,
    itemCount,
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
  });
  library.updatedAt = timestamp;

  return library;
}

function mergeRecords<T extends { id: string; updatedAt?: string; createdAt?: string }>(
  current: T[],
  incoming: T[],
) {
  const byId = new Map(current.map((item) => [item.id, item]));

  incoming.forEach((item) => {
    if (!item?.id) return;

    const existing = byId.get(item.id);
    if (!existing) {
      byId.set(item.id, item);
      return;
    }

    const incomingTime = Date.parse(item.updatedAt || item.createdAt || "");
    const existingTime = Date.parse(existing.updatedAt || existing.createdAt || "");

    if (Number.isNaN(existingTime) || incomingTime > existingTime) {
      byId.set(item.id, item);
    }
  });

  return [...byId.values()];
}

export function mergeLibraries(
  currentLibrary: PhraseLensLibrary,
  incomingLibrary: PhraseLensLibrary,
): PhraseLensLibrary {
  const timestamp = nowIso();

  return {
    ...currentLibrary,
    updatedAt: timestamp,
    wordbook: mergeRecords(currentLibrary.wordbook, incomingLibrary.wordbook),
    memories: mergeRecords(currentLibrary.memories, incomingLibrary.memories),
    sessions: mergeRecords(currentLibrary.sessions, incomingLibrary.sessions),
    sources: mergeRecords(currentLibrary.sources, incomingLibrary.sources),
  };
}
