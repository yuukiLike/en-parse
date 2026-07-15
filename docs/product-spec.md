# Phrase Lens Product Spec

## Positioning

Phrase Lens is a local-first English reading and memory tool. It helps users paste or select English, understand the sentence, remember useful phrases, and keep a portable personal learning library.

The durable product is not a web page, browser extension, or Raycast plugin. Those are surfaces. The durable product is the user's own phrase and reading library.

## Non-Negotiable Principles

- Local-first: user data is created, stored, searched, imported, and exported locally by default.
- Portable: every saved word, phrase, memory, and reading session must be exportable without an account.
- User-owned sync: if cloud sync is needed, prefer Apple iCloud Drive as a file sync layer.
- No proprietary lock-in: Phrase Lens should not require a Phrase Lens account or hosted database for the core product.
- Explicit AI use: text is sent to an AI service only when the user asks for parsing, translation, or explanation.
- Offline value: saved memories and the wordbook remain usable without network access.

## Platform Strategy

### 1. Standalone Web / PWA

Primary first surface because it is the cheapest way to support Mac and iOS.

The PWA should support:

- Paste text and parse it.
- Save phrases and sentence memories.
- Import and export the library package.
- Save a local backup file.
- Use iCloud Drive through normal file import/export or user-selected files when the platform permits.

### 2. Browser Extension

The extension is a capture surface.

It should support:

- Select English on a web page.
- Parse selected text.
- Save phrases, examples, and page source metadata.
- Export or hand off saved items into the same library format.

The extension should not become the source of truth unless it can write to the same local library package.

### 3. Raycast Extension

Raycast is a Mac productivity surface.

It should support:

- Search the local wordbook.
- Save clipboard text as a memory.
- Quick add a phrase.
- Open the current library folder.
- Export Markdown or CSV notes.

Raycast should read/write the same local files as the desktop web/PWA experience.

### 4. iOS

Short term, iOS should be supported through the PWA and iCloud Drive import/export.

Native iOS can come later if the habit is validated. Its first native advantages would be share sheet capture, offline review, and iCloud Drive file access.

## Library Format

Use a folder package that can live anywhere, including iCloud Drive:

```text
PhraseLens.library/
  manifest.json
  wordbook.jsonl
  memories.jsonl
  sessions.jsonl
  sources.jsonl
  exports/
  assets/
```

Prefer JSON Lines for append-friendly local writes and simpler conflict recovery.

### manifest.json

```json
{
  "format": "phrase-lens-library",
  "version": 1,
  "createdAt": "2026-07-09T14:00:00+08:00",
  "updatedAt": "2026-07-09T14:00:00+08:00",
  "device": {
    "name": "Mac",
    "app": "web"
  }
}
```

### wordbook.jsonl

One saved word or phrase per line.

```json
{"id":"item_01","kind":"phrase","text":"optimize for","meaning":"针对……优化","examples":["A side-project version should optimize for speed."],"tags":["product","verb phrase"],"createdAt":"2026-07-09T14:00:00+08:00","updatedAt":"2026-07-09T14:00:00+08:00","deletedAt":null}
```

### memories.jsonl

One copied or saved memory per line.

```json
{"id":"mem_01","text":"the fastest useful version","translation":"最快可用版本","note":"useful product phrase","sourceId":"src_01","createdAt":"2026-07-09T14:00:00+08:00","deletedAt":null}
```

### sessions.jsonl

One reading/parsing session per line.

```json
{"id":"session_01","title":"Stock tool discussion","sourceText":"...","sentenceCount":29,"markCount":62,"sourceId":"src_01","createdAt":"2026-07-09T14:00:00+08:00"}
```

### sources.jsonl

One source per line.

```json
{"id":"src_01","kind":"paste","title":"Stock tool discussion","url":null,"app":"web","createdAt":"2026-07-09T14:00:00+08:00"}
```

## Sync Model

iCloud Drive is the preferred sync transport, but Phrase Lens should still behave as a local app:

- The user chooses or imports a `PhraseLens.library` folder.
- The app writes local files into that folder.
- If the folder is inside iCloud Drive, Apple handles sync.
- Phrase Lens does not run its own sync server.
- Conflicts are handled at the record level using stable IDs, `updatedAt`, and `deletedAt`.

For v1, conflict policy can be simple:

- Same `id`, newer `updatedAt` wins.
- `deletedAt` acts as a tombstone.
- If two records have the same `id` and same timestamp but different content, keep both by forking one ID and mark it with `conflictOf`.

## Export Formats

Required:

- Full library folder.
- Single `.json` backup archive.
- Markdown notes.
- CSV for spreadsheet migration.

Later:

- Anki-compatible export.
- OPML or plain text phrase list.

## Cost Strategy

Avoid recurring infrastructure until there is clear need.

V1 should not require:

- User accounts.
- Hosted database.
- Custom sync server.
- Background worker service.
- Subscription billing infrastructure.

Optional AI cost should be user-visible and controllable:

- Parse current text only on demand.
- Cache parsed results locally.
- Let the user bring their own API key if appropriate.
- Keep a non-AI manual save path.

## Immediate Build Order

1. Add local library data model in the web app.
2. Save highlighted phrases into `localStorage` as the temporary local store.
3. Add export/import for JSON.
4. Add Markdown and CSV export.
5. Add a user-selected library file/folder flow where browser support allows it.
6. Build the browser extension as a capture surface.
7. Build Raycast search/add commands against the same library files.
