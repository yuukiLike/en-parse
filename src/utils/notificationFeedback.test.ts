import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const { getCopyNotesFeedback } = await import(
  new URL("./notificationFeedback.ts", import.meta.url).href
);

const appSource = await readFile(new URL("../App.tsx", import.meta.url), "utf8");
const memoryPanelSource = await readFile(
  new URL("../components/MemoryPanel.tsx", import.meta.url),
  "utf8",
);

test("copy notes returns one combined success notification", () => {
  assert.deepEqual(getCopyNotesFeedback({ copied: true, persisted: true }), {
    color: "teal",
    message: "笔记已复制，并保存为本地记忆。",
  });
});

test("copy notes explains each partial failure in one notification", () => {
  assert.deepEqual(getCopyNotesFeedback({ copied: true, persisted: false }), {
    color: "yellow",
    message: "笔记已复制，但本地存储不可用；请导出 JSON 保留内容。",
  });
  assert.deepEqual(getCopyNotesFeedback({ copied: false, persisted: true }), {
    color: "yellow",
    message: "浏览器未开放剪贴板权限，但记忆已保存。",
  });
});

test("copy notes reports a complete failure in one notification", () => {
  assert.deepEqual(getCopyNotesFeedback({ copied: false, persisted: false }), {
    color: "red",
    message: "笔记未能复制，本地存储也不可用；请先导出 JSON 保留内容。",
  });
});

test("save and copy actions expose only one feedback layer", () => {
  const memoryActions = memoryPanelSource.slice(
    memoryPanelSource.indexOf("<Title order={2}>Remember</Title>"),
    memoryPanelSource.indexOf('<Box className="libraryPanel">'),
  );
  const copyNotesHandler = appSource.slice(
    appSource.indexOf("async function handleCopyNotes()"),
    appSource.indexOf("function handleExportJson()"),
  );
  const copyNotesWithContent = copyNotesHandler.slice(copyNotesHandler.indexOf("const noteText"));

  assert.doesNotMatch(memoryActions, /<Tooltip\b/);
  assert.match(copyNotesWithContent, /commitLibrary\([\s\S]*?, false\);/);
  assert.equal(copyNotesWithContent.match(/notifications\.show\(/g)?.length, 1);
});
