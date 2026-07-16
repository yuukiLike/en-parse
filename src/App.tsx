import { useMemo, useRef, useState } from "react";
import { Box, Container, Group, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { AppHeader } from "./components/AppHeader";
import { MemoryPanel } from "./components/MemoryPanel";
import { PastePanel } from "./components/PastePanel";
import { ReadingPanel } from "./components/ReadingPanel";
import { phraseRules, sampleText, sampleTranslations } from "./data/sample";
import {
  addCopiedMemory,
  getLibraryStats,
  mergeLibraries,
  normalizeLibrary,
  saveReadingSession,
  type PhraseLensLibrary,
} from "./domain/library";
import {
  analyzeReading,
  buildNotes,
  getReadingTitle,
  updateSentenceTranslation,
  type ReadingAnalysis,
} from "./domain/parser";
import { loadLibrary, persistLibrary } from "./services/libraryStorage";
import {
  exportLibraryCsv,
  exportLibraryJson,
  exportLibraryMarkdown,
} from "./utils/exporters";
import { getCopyNotesFeedback } from "./utils/notificationFeedback";

const initialAnalysis = analyzeReading(sampleText, phraseRules, sampleTranslations);

export function App() {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [sourceText, setSourceText] = useState(sampleText);
  const [analysis, setAnalysis] = useState<ReadingAnalysis>(initialAnalysis);
  const [library, setLibrary] = useState<PhraseLensLibrary>(() => loadLibrary());
  const [activePhraseId, setActivePhraseId] = useState<string | null>(null);
  const [libraryStatus, setLibraryStatus] = useState(
    "数据保存在当前浏览器本机；导出的 JSON 可以放进 iCloud Drive 迁移。",
  );

  const libraryStats = useMemo(() => getLibraryStats(library), [library]);

  function commitLibrary(
    nextLibrary: PhraseLensLibrary,
    message: string,
    showNotification = true,
  ) {
    try {
      persistLibrary(nextLibrary);
      setLibrary(nextLibrary);
      setLibraryStatus(message);
      if (showNotification) notifications.show({ color: "teal", message });
      return true;
    } catch {
      setLibrary(nextLibrary);
      const fallback = "当前浏览器没有开放本地存储；请先导出 JSON 保留这次内容。";
      setLibraryStatus(fallback);
      if (showNotification) notifications.show({ color: "red", message: fallback });
      return false;
    }
  }

  function handleAnalyze() {
    const nextAnalysis = analyzeReading(sourceText, phraseRules, sampleTranslations);
    setAnalysis(nextAnalysis);
    setActivePhraseId(null);
  }

  function handleLoadSample() {
    setSourceText(sampleText);
    setAnalysis(initialAnalysis);
    setActivePhraseId(null);
  }

  function handleClear() {
    setSourceText("");
    setAnalysis(analyzeReading("", phraseRules, sampleTranslations));
    setActivePhraseId(null);
  }

  function handleUpdateTranslation(sentenceId: string, translation: string) {
    setAnalysis((currentAnalysis) =>
      updateSentenceTranslation(currentAnalysis, sentenceId, translation),
    );
  }

  function handleSaveSession() {
    if (!analysis.phrases.length) {
      notifications.show({ color: "yellow", message: "还没有可保存的标注。先粘贴英文并分析短语。" });
      return;
    }

    const title = getReadingTitle(sourceText);
    const nextLibrary = saveReadingSession(library, analysis, sourceText, title);
    commitLibrary(nextLibrary, `已保存 ${analysis.phrases.length} 个标注到本地资料库。`);
  }

  async function handleCopyNotes() {
    if (!analysis.phrases.length) {
      notifications.show({ color: "yellow", message: "还没有可复制的笔记。" });
      return;
    }

    const noteText = buildNotes(analysis.phrases);
    const nextLibrary = addCopiedMemory(
      library,
      noteText,
      getReadingTitle(sourceText),
      analysis.phrases.length,
    );
    const persisted = commitLibrary(nextLibrary, "已保存为可迁移的本地记忆。", false);
    let copied = false;

    try {
      await navigator.clipboard.writeText(noteText);
      copied = true;
    } catch {}

    notifications.show(getCopyNotesFeedback({ copied, persisted }));
  }

  function handleExportJson() {
    exportLibraryJson(library);
    setLibraryStatus("已导出 JSON；这个文件可以放进 iCloud Drive 备份或迁移。");
  }

  function handleExportMarkdown() {
    exportLibraryMarkdown(library);
    setLibraryStatus("已导出 Markdown，适合人工阅读和长期备份。");
  }

  function handleExportCsv() {
    exportLibraryCsv(library);
    setLibraryStatus("已导出 CSV，适合迁移到 Numbers、Excel 或 Anki 流程。");
  }

  async function handleImportFile(file: File) {
    try {
      const imported = normalizeLibrary(JSON.parse(await file.text()));
      const nextLibrary = mergeLibraries(library, imported);
      commitLibrary(nextLibrary, `已导入 ${file.name}，并与本地资料库合并。`);
    } catch {
      notifications.show({ color: "red", message: "导入失败：请选择 Phrase Lens JSON 资料库文件。" });
    } finally {
      if (importInputRef.current) importInputRef.current.value = "";
    }
  }

  return (
    <Box className="appFrame">
      <Container size="xl" py="lg">
        <Stack gap="md">
          <AppHeader />
          <Box className="workspaceGrid">
            <PastePanel
              sourceText={sourceText}
              onChange={setSourceText}
              onAnalyze={handleAnalyze}
              onClear={handleClear}
              onLoadSample={handleLoadSample}
            />
            <ReadingPanel
              analysis={analysis}
              activePhraseId={activePhraseId}
              onSelectPhrase={setActivePhraseId}
              onUpdateTranslation={handleUpdateTranslation}
            />
            <MemoryPanel
              activePhraseId={activePhraseId}
              libraryStats={libraryStats}
              libraryStatus={libraryStatus}
              phrases={analysis.phrases}
              onCopyNotes={handleCopyNotes}
              onExportCsv={handleExportCsv}
              onExportJson={handleExportJson}
              onExportMarkdown={handleExportMarkdown}
              onImport={() => importInputRef.current?.click()}
              onSaveSession={handleSaveSession}
              onSelectPhrase={setActivePhraseId}
            />
          </Box>
        </Stack>
      </Container>
      <input
        ref={importInputRef}
        accept="application/json,.json"
        hidden
        type="file"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) void handleImportFile(file);
        }}
      />
    </Box>
  );
}
