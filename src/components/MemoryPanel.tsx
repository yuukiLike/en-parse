import {
  Badge,
  Box,
  Button,
  Group,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  ClipboardCopy,
  Database,
  Download,
  FileJson,
  FileText,
  Save,
  Table,
  Upload,
} from "lucide-react";
import type { LibraryStats } from "../domain/library";
import type { PhraseMark } from "../domain/parser";

type MemoryPanelProps = {
  activePhraseId: string | null;
  libraryStats: LibraryStats;
  libraryStatus: string;
  phrases: PhraseMark[];
  onCopyNotes: () => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  onExportMarkdown: () => void;
  onImport: () => void;
  onSaveSession: () => void;
  onSelectPhrase: (id: string) => void;
};

export function MemoryPanel({
  activePhraseId,
  libraryStats,
  libraryStatus,
  phrases,
  onCopyNotes,
  onExportCsv,
  onExportJson,
  onExportMarkdown,
  onImport,
  onSaveSession,
  onSelectPhrase,
}: MemoryPanelProps) {
  return (
    <Paper className="toolPanel" withBorder>
      <Stack className="panelStack" gap={0}>
        <Group className="panelHeader" justify="space-between">
          <Title order={2}>Remember</Title>
          <Group gap="xs">
            <Tooltip label="保存当前阅读">
              <Button leftSection={<Save size={16} />} size="sm" variant="light" onClick={onSaveSession}>
                保存本次
              </Button>
            </Tooltip>
            <Tooltip label="复制并保存笔记">
              <Button
                leftSection={<ClipboardCopy size={16} />}
                size="sm"
                variant="default"
                onClick={onCopyNotes}
              >
                复制笔记
              </Button>
            </Tooltip>
          </Group>
        </Group>
        <Box className="libraryPanel">
          <Group align="flex-start" justify="space-between" gap="sm">
            <Group gap="xs">
              <Database size={18} />
              <Box>
                <Text fw={800} size="sm">
                  Local Library
                </Text>
                <Text c="dimmed" size="xs">
                  {libraryStats.phrases} phrases / {libraryStats.memories} memories /{" "}
                  {libraryStats.sessions} sessions
                </Text>
              </Box>
            </Group>
            <Badge color="teal" radius="sm" variant="light">
              portable
            </Badge>
          </Group>
          <SimpleGrid cols={2} mt="sm" spacing="xs">
            <Button leftSection={<FileJson size={15} />} size="xs" variant="default" onClick={onExportJson}>
              JSON
            </Button>
            <Button
              leftSection={<FileText size={15} />}
              size="xs"
              variant="default"
              onClick={onExportMarkdown}
            >
              Markdown
            </Button>
            <Button leftSection={<Table size={15} />} size="xs" variant="default" onClick={onExportCsv}>
              CSV
            </Button>
            <Button leftSection={<Upload size={15} />} size="xs" variant="default" onClick={onImport}>
              导入
            </Button>
          </SimpleGrid>
          <Group gap={6} mt="xs" wrap="nowrap">
            <Download size={14} className="mutedIcon" />
            <Text c="dimmed" lineClamp={2} size="xs">
              {libraryStatus}
            </Text>
          </Group>
        </Box>
        <ScrollArea className="phraseScroll" offsetScrollbars>
          <Stack gap="xs" p="sm">
            {phrases.length === 0 ? (
              <Text c="dimmed" size="sm">
                还没有识别到短语。
              </Text>
            ) : (
              phrases.map((phrase) => (
                <PhraseCard
                  key={phrase.id}
                  active={activePhraseId === phrase.id}
                  phrase={phrase}
                  onClick={() => onSelectPhrase(phrase.id)}
                />
              ))
            )}
          </Stack>
        </ScrollArea>
      </Stack>
    </Paper>
  );
}

function PhraseCard({
  active,
  onClick,
  phrase,
}: {
  active: boolean;
  onClick: () => void;
  phrase: PhraseMark;
}) {
  return (
    <UnstyledButton className={`phraseCard ${active ? "phraseCard-active" : ""}`} onClick={onClick}>
      <Stack gap={6}>
        <Badge color={phrase.color === "red" ? "phraseRed" : "phraseGreen"} radius="sm" size="sm">
          {phrase.color === "red" ? "短语" : "结构"}
        </Badge>
        <Text fw={800} lh={1.3} size="sm">
          {phrase.text}
        </Text>
        <Text c="dimmed" lh={1.45} size="xs">
          {phrase.meaning}
        </Text>
      </Stack>
    </UnstyledButton>
  );
}
