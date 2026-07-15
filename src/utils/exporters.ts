import type { PhraseLensLibrary } from "../domain/library";
import { nowIso } from "../domain/library";

export function downloadText(filename: string, mimeType: string, text: string) {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function exportLibraryJson(library: PhraseLensLibrary) {
  const date = new Date().toISOString().slice(0, 10);
  downloadText(
    `phrase-lens-library-${date}.json`,
    "application/json",
    JSON.stringify(library, null, 2),
  );
}

export function exportLibraryMarkdown(library: PhraseLensLibrary) {
  const lines = ["# Phrase Lens Library", "", `Exported: ${nowIso()}`, "", "## Wordbook", ""];

  library.wordbook.forEach((item) => {
    lines.push(`### ${item.text}`);
    lines.push("");
    lines.push(`- Type: ${item.kind}`);
    lines.push(`- Meaning: ${item.meaning}`);
    if (item.tags?.length) lines.push(`- Tags: ${item.tags.join(", ")}`);
    item.examples?.forEach((example) => {
      lines.push(`- Example: ${example.text}`);
      if (example.translation) lines.push(`  Translation: ${example.translation}`);
    });
    lines.push("");
  });

  lines.push("## Copied Memories", "");
  library.memories.forEach((memory) => {
    lines.push(`### ${memory.title || memory.id}`);
    lines.push("");
    lines.push(memory.text);
    lines.push("");
  });

  downloadText("phrase-lens-library.md", "text/markdown", lines.join("\n"));
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export function exportLibraryCsv(library: PhraseLensLibrary) {
  const rows = [
    ["text", "kind", "meaning", "tags", "examples", "createdAt", "updatedAt"],
    ...library.wordbook.map((item) => [
      item.text,
      item.kind,
      item.meaning,
      item.tags?.join("; ") || "",
      item.examples?.map((example) => example.text).join(" | ") || "",
      item.createdAt,
      item.updatedAt,
    ]),
  ];

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  downloadText("phrase-lens-wordbook.csv", "text/csv", csv);
}
