import { Badge, Box, Group, Paper, ScrollArea, Stack, Text, Title, Tooltip } from "@mantine/core";
import type { PhraseMark, ReadingAnalysis, SentenceAnalysis } from "../domain/parser";

type ReadingPanelProps = {
  activePhraseId: string | null;
  analysis: ReadingAnalysis;
  onSelectPhrase: (id: string) => void;
};

export function ReadingPanel({ activePhraseId, analysis, onSelectPhrase }: ReadingPanelProps) {
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
  sentence,
  onSelectPhrase,
}: {
  activePhraseId: string | null;
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
      <Text className="translationText">{sentence.translation}</Text>
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
