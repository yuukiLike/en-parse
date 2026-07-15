# Phrase Lens

Phrase Lens is a local-first English-learning app. Paste an English paragraph, click `分析短语`, and it highlights:

- Red: useful phrases, terms, and collocations worth memorizing.
- Green: grammar, sentence structure, and logic connectors.

The current app uses `pnpm`, Vite, React, TypeScript, Mantine, and lucide icons. It keeps parsing and library logic in reusable domain modules so browser extensions, Raycast, and future iOS surfaces can share the same data model.

## Current Features

- Paste English and highlight useful phrases and sentence structures.
- Save the current reading session into a local library.
- Save copied notes as portable memories.
- Keep a local wordbook in browser storage.
- Export the library as JSON, Markdown, or CSV.
- Import a JSON library backup and merge it with local data.

## Product Direction

Phrase Lens is local-first. The user's wordbook, copied memories, and reading sessions must remain portable files that can be backed up, inspected, imported, exported, and moved between surfaces.

If sync is needed, the preferred cloud layer is Apple iCloud Drive. Phrase Lens should treat iCloud as a user-owned file sync location, not as a proprietary backend.

See [docs/product-spec.md](docs/product-spec.md).

## Run

```bash
pnpm install
pnpm run dev
```

Open the Vite URL printed by the terminal, usually <http://127.0.0.1:5173/>.

## Scripts

```bash
pnpm run dev
pnpm run typecheck
pnpm run build
```

## Structure

```text
src/
  components/        Mantine UI panels
  data/              sample text, phrase rules, sample translations
  domain/            parser and portable library model
  services/          browser storage adapter
  utils/             export/download helpers
```

## Next Useful Upgrade

Add import/export for the local library format first. After that, optionally add an AI parser that sends the current text only when the user explicitly asks for parsing and returns structured JSON:

```json
{
  "sentences": [
    {
      "source": "English sentence",
      "translation": "中文译文",
      "marks": [
        {
          "text": "optimize for",
          "color": "red",
          "meaning": "针对……优化"
        }
      ]
    }
  ]
}
```
