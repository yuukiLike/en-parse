import {
  Badge,
  Box,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  Title,
  Tooltip,
} from "@mantine/core";
import type { PhraseMark, ReadingAnalysis, SentenceAnalysis } from "../domain/parser";

type ReadingPanelProps = {
  activePhraseId: string | null;
  analysis: ReadingAnalysis;
  onSelectPhrase: (id: string) => void;
  onUpdateTranslation: (sentenceId: string, translation: string) => void;
};

export function ReadingPanel({
  activePhraseId,
  analysis,
  onSelectPhrase,
  onUpdateTranslation,
}: ReadingPanelProps) {
  return (
    <Paper className="toolPanel" withBorder>
      <Stack className="panelStack" gap={0}>
        <Group className="panelHeader" justify="space-between">
          <Title order={2}>Read</Title>
          <Badge color="gray" radius="sm" variant="light">
            {analysis.sentences.length} 句 / {analysis.phrases.length} 个标注
          </Badge>
        </Group>
        <ScrollArea className="readingScroll" offsetScrollbars>
          <Stack gap={0} p="md">
            {analysis.sentences.length === 0 ? (
              <Text c="dimmed" size="sm">
                粘贴英文后点击“分析短语”。
              </Text>
            ) : (
              analysis.sentences.map((sentence) => (
                <SentenceBlock
                  key={sentence.id}
                  activePhraseId={activePhraseId}
                  sentence={sentence}
                  onSelectPhrase={onSelectPhrase}
                  onUpdateTranslation={onUpdateTranslation}
                />
              ))
            )}
          </Stack>
        </ScrollArea>
      </Stack>
    </Paper>
  );
}

function SentenceBlock({
  activePhraseId,
  onUpdateTranslation,
  sentence,
  onSelectPhrase,
}: {
  activePhraseId: string | null;
  onUpdateTranslation: (sentenceId: string, translation: string) => void;
  sentence: SentenceAnalysis;
  onSelectPhrase: (id: string) => void;
}) {
  return (
    <Box className="sentenceBlock">
      <Text c="dimmed" fw={800} size="xs" tt="uppercase">
        Sentence {sentence.index + 1}
      </Text>
      <Box className="sentenceText">
        <HighlightedSentence
          activePhraseId={activePhraseId}
          marks={sentence.marks}
          sentence={sentence.text}
          onSelectPhrase={onSelectPhrase}
        />
      </Box>
      <Text c="dimmed" className="translationLabel" fw={800} size="xs">
        中文翻译
      </Text>
      <Textarea
        aria-label={`Sentence ${sentence.index + 1} Chinese translation`}
        autosize
        classNames={{ input: "translationInput" }}
        minRows={2}
        placeholder="补充这句话的中文译文"
        value={sentence.translation}
        onChange={(event) => onUpdateTranslation(sentence.id, event.currentTarget.value)}
      />
    </Box>
  );
}

function HighlightedSentence({
  activePhraseId,
  marks,
  onSelectPhrase,
  sentence,
}: {
  activePhraseId: string | null;
  marks: PhraseMark[];
  onSelectPhrase: (id: string) => void;
  sentence: string;
}) {
  let cursor = 0;
  const segments: React.ReactNode[] = [];

  marks.forEach((mark) => {
    if (mark.start > cursor) {
      segments.push(<span key={`${mark.id}-pre`}>{sentence.slice(cursor, mark.start)}</span>);
    }

    segments.push(
      <Tooltip key={mark.id} label={mark.meaning} multiline maw={260} withArrow>
        <button
          className={`mark mark-${mark.color} ${activePhraseId === mark.id ? "mark-active" : ""}`}
          type="button"
          onClick={() => onSelectPhrase(mark.id)}
        >
          {sentence.slice(mark.start, mark.end)}
        </button>
      </Tooltip>,
    );
    cursor = mark.end;
  });

  if (cursor < sentence.length) {
    segments.push(<span key="tail">{sentence.slice(cursor)}</span>);
  }

  return segments;
}
