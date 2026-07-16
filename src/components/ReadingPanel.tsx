import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Group,
  Paper,
  Progress,
  ScrollArea,
  SegmentedControl,
  Select,
  Stack,
  Text,
  Textarea,
  Title,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  AudioLines,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleStop,
  Mic2,
  Pause,
  Play,
  Volume2,
} from "lucide-react";
import type {
  ParagraphAnalysis,
  PhraseMark,
  ReadingAnalysis,
  SentenceAnalysis,
} from "../domain/parser";
import {
  useSpeechPlayer,
  type SpeechSegment,
  type SpeechStatus,
} from "../hooks/useSpeechPlayer";

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
  const speech = useSpeechPlayer();
  const [selectedParagraphId, setSelectedParagraphId] = useState<string | null>(
    analysis.paragraphs[0]?.id ?? null,
  );
  const sentencesById = useMemo(
    () => new Map(analysis.sentences.map((sentence) => [sentence.id, sentence])),
    [analysis.sentences],
  );
  const selectedParagraph =
    analysis.paragraphs.find((paragraph) => paragraph.id === selectedParagraphId) ?? null;
  const selectedSentences = selectedParagraph
    ? selectedParagraph.sentenceIds.flatMap((id) => {
        const sentence = sentencesById.get(id);
        return sentence ? [sentence] : [];
      })
    : [];

  useEffect(() => {
    speech.stop();
    setSelectedParagraphId(analysis.paragraphs[0]?.id ?? null);
  }, [analysis.paragraphs, speech.stop]);

  function getSegments(paragraph: ParagraphAnalysis): SpeechSegment[] {
    return paragraph.sentenceIds.flatMap((id) => {
      const sentence = sentencesById.get(id);
      return sentence ? [{ id: sentence.id, text: sentence.text }] : [];
    });
  }

  function selectParagraph(paragraphId: string) {
    if (paragraphId === selectedParagraphId) return;
    speech.stop();
    setSelectedParagraphId(paragraphId);
  }

  function playParagraph(paragraph: ParagraphAnalysis) {
    setSelectedParagraphId(paragraph.id);
    if (speech.trackId === paragraph.id && speech.status !== "idle") {
      speech.togglePause();
      return;
    }
    speech.play(paragraph.id, getSegments(paragraph));
  }

  function toggleSelectedParagraph() {
    if (!selectedParagraph) return;
    if (speech.trackId === selectedParagraph.id && speech.status !== "idle") {
      speech.togglePause();
      return;
    }
    speech.play(selectedParagraph.id, getSegments(selectedParagraph));
  }

  function moveParagraph(offset: number) {
    if (!selectedParagraph) return;
    const nextParagraph = analysis.paragraphs[selectedParagraph.index + offset];
    if (!nextParagraph) return;

    const continuePlaying = speech.status !== "idle";
    setSelectedParagraphId(nextParagraph.id);
    if (continuePlaying) speech.play(nextParagraph.id, getSegments(nextParagraph));
    else speech.stop();
  }

  return (
    <Paper className="toolPanel readingPanel" withBorder>
      <Stack className="panelStack" gap={0}>
        <Group className="panelHeader" justify="space-between">
          <Title order={2}>Read</Title>
          <Badge color="gray" radius="sm" variant="light">
            {analysis.paragraphs.length} 段 / {analysis.sentences.length} 句 / {analysis.phrases.length} 个标注
          </Badge>
        </Group>
        {selectedParagraph ? (
          <SpeechPlayer
            paragraph={selectedParagraph}
            paragraphCount={analysis.paragraphs.length}
            sentences={selectedSentences}
            speech={speech}
            onNext={() => moveParagraph(1)}
            onPrevious={() => moveParagraph(-1)}
            onToggle={toggleSelectedParagraph}
          />
        ) : null}
        <ScrollArea className="readingScroll" offsetScrollbars>
          <Stack gap="sm" p="md">
            {analysis.paragraphs.length === 0 ? (
              <Text c="dimmed" size="sm">
                粘贴英文后点击“分析短语”。
              </Text>
            ) : (
              analysis.paragraphs.map((paragraph) => {
                const sentences = paragraph.sentenceIds.flatMap((id) => {
                  const sentence = sentencesById.get(id);
                  return sentence ? [sentence] : [];
                });

                return (
                  <ParagraphBlock
                    key={paragraph.id}
                    activePhraseId={activePhraseId}
                    activeSpokenSentenceId={speech.trackId === paragraph.id ? speech.activeSegmentId : null}
                    paragraph={paragraph}
                    selected={selectedParagraphId === paragraph.id}
                    sentences={sentences}
                    speechStatus={speech.trackId === paragraph.id ? speech.status : null}
                    onPlay={() => playParagraph(paragraph)}
                    onSelectPhrase={onSelectPhrase}
                    onSelectParagraph={() => selectParagraph(paragraph.id)}
                    onUpdateTranslation={onUpdateTranslation}
                  />
                );
              })
            )}
          </Stack>
        </ScrollArea>
      </Stack>
    </Paper>
  );
}

type SpeechPlayerProps = {
  paragraph: ParagraphAnalysis;
  paragraphCount: number;
  sentences: SentenceAnalysis[];
  speech: ReturnType<typeof useSpeechPlayer>;
  onNext: () => void;
  onPrevious: () => void;
  onToggle: () => void;
};

function SpeechPlayer({
  onNext,
  onPrevious,
  onToggle,
  paragraph,
  paragraphCount,
  sentences,
  speech,
}: SpeechPlayerProps) {
  if (!speech.supported) {
    return (
      <Alert className="speechUnsupported" color="yellow" icon={<Volume2 size={17} />}>
        当前浏览器不支持系统语音朗读，请使用最新版 Safari、Chrome 或 Edge。
      </Alert>
    );
  }

  const activeSentenceIndex = sentences.findIndex((sentence) => sentence.id === speech.activeSegmentId);
  const wordCount = paragraph.text.split(/\s+/).filter(Boolean).length;
  const isCurrentTrack = speech.trackId === paragraph.id;
  const isSpeaking = isCurrentTrack && speech.status === "speaking";
  const isPaused = isCurrentTrack && speech.status === "paused";
  const progress = isCurrentTrack ? speech.progress * 100 : 0;
  const statusLabel = isSpeaking
    ? `正在朗读 · 第 ${Math.max(1, activeSentenceIndex + 1)}/${sentences.length} 句`
    : isPaused
      ? `已暂停 · 第 ${Math.max(1, activeSentenceIndex + 1)}/${sentences.length} 句`
      : progress === 100
        ? "本段已读完 · 可再次播放"
        : "已选中 · 点击播放开始跟读";

  return (
    <Box className={`speechPlayer ${isSpeaking ? "speechPlayer-playing" : ""}`}>
      <Group className="speechTopRow" align="center" justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <Box aria-hidden="true" className="speechGlyph">
            <AudioLines size={20} />
            <span className="speechPulse speechPulse-one" />
            <span className="speechPulse speechPulse-two" />
            <span className="speechPulse speechPulse-three" />
          </Box>
          <Box className="speechNowPlaying">
            <Text className="speechEyebrow" fw={800} size="xs">
              LISTEN · PARAGRAPH {String(paragraph.index + 1).padStart(2, "0")}
            </Text>
            <Text
              aria-live="polite"
              className="speechStatus"
              fw={700}
              lineClamp={1}
              role="status"
              size="sm"
            >
              {statusLabel}
            </Text>
          </Box>
        </Group>
        <Group className="speechTransport" gap={5} wrap="nowrap">
          <Tooltip label="上一段">
            <ActionIcon
              aria-label="朗读上一段"
              disabled={paragraph.index === 0}
              radius="xl"
              size="md"
              variant="subtle"
              onClick={onPrevious}
            >
              <ChevronLeft size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="停止并回到开头">
            <ActionIcon
              aria-label="停止朗读"
              disabled={!isCurrentTrack || (speech.status === "idle" && speech.progress === 0)}
              radius="xl"
              size="md"
              variant="subtle"
              onClick={speech.stop}
            >
              <CircleStop size={17} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={isSpeaking ? "暂停" : isPaused ? "继续" : "朗读本段"}>
            <ActionIcon
              aria-label={isSpeaking ? "暂停朗读" : isPaused ? "继续朗读" : "朗读选中段落"}
              className="speechPlayButton"
              color="teal"
              radius="xl"
              size={44}
              variant="filled"
              onClick={onToggle}
            >
              {isSpeaking ? <Pause fill="currentColor" size={19} /> : <Play fill="currentColor" size={19} />}
            </ActionIcon>
          </Tooltip>
          <Tooltip label="下一段">
            <ActionIcon
              aria-label="朗读下一段"
              disabled={paragraph.index === paragraphCount - 1}
              radius="xl"
              size="md"
              variant="subtle"
              onClick={onNext}
            >
              <ChevronRight size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      <Progress aria-label="朗读进度" className="speechProgress" radius="xl" size={4} value={progress} />
      <Group className="speechSettings" gap="xs" justify="space-between" wrap="nowrap">
        <Select
          aria-label="英文朗读音色"
          className="voiceSelect"
          data={speech.voiceOptions}
          disabled={speech.voiceOptions.length === 0}
          leftSection={<Mic2 size={14} />}
          maxDropdownHeight={220}
          placeholder="系统默认英文音色"
          searchable
          size="xs"
          value={speech.voiceURI || null}
          onChange={(value) => {
            if (value) speech.setVoiceURI(value);
          }}
        />
        <SegmentedControl
          aria-label="朗读语速"
          className="rateControl"
          data={[
            { label: "0.85×", value: "0.85" },
            { label: "1×", value: "1" },
            { label: "1.15×", value: "1.15" },
          ]}
          size="xs"
          value={String(speech.rate)}
          onChange={(value) => speech.setRate(Number(value))}
        />
        <Text c="dimmed" className="speechMeta" size="xs">
          {wordCount} words · {speech.voiceIsLocal ? "本机语音" : "浏览器语音"}
        </Text>
      </Group>
      {speech.error ? (
        <Text c="red" mt={6} role="alert" size="xs">
          {speech.error}
        </Text>
      ) : null}
    </Box>
  );
}

type ParagraphBlockProps = {
  activePhraseId: string | null;
  activeSpokenSentenceId: string | null;
  paragraph: ParagraphAnalysis;
  selected: boolean;
  sentences: SentenceAnalysis[];
  speechStatus: SpeechStatus | null;
  onPlay: () => void;
  onSelectPhrase: (id: string) => void;
  onSelectParagraph: () => void;
  onUpdateTranslation: (sentenceId: string, translation: string) => void;
};

function ParagraphBlock({
  activePhraseId,
  activeSpokenSentenceId,
  onPlay,
  onSelectParagraph,
  onSelectPhrase,
  onUpdateTranslation,
  paragraph,
  selected,
  sentences,
  speechStatus,
}: ParagraphBlockProps) {
  const speechActionLabel =
    speechStatus === "speaking"
      ? `暂停第 ${paragraph.index + 1} 段朗读`
      : speechStatus === "paused"
        ? `继续第 ${paragraph.index + 1} 段朗读`
        : `朗读第 ${paragraph.index + 1} 段`;

  return (
    <Box
      className={`paragraphBlock ${selected ? "paragraphBlock-selected" : ""}`}
      component="article"
      data-paragraph-id={paragraph.id}
      onClick={onSelectParagraph}
    >
      <Group className="paragraphHeader" justify="space-between" wrap="nowrap">
        <UnstyledButton
          aria-label={`选中第 ${paragraph.index + 1} 段`}
          aria-pressed={selected}
          className="paragraphSelector"
          onClick={onSelectParagraph}
        >
          <span className="paragraphCheck" aria-hidden="true">
            {selected ? <Check size={12} strokeWidth={3} /> : null}
          </span>
          <Text component="span" fw={800} size="xs">
            Paragraph {paragraph.index + 1}
          </Text>
          <Text c="dimmed" component="span" size="xs">
            {sentences.length} 句
          </Text>
        </UnstyledButton>
        <Tooltip
          label={speechStatus === "speaking" ? "暂停" : speechStatus === "paused" ? "继续" : "朗读本段"}
        >
          <ActionIcon
            aria-label={speechActionLabel}
            color="teal"
            radius="xl"
            size="sm"
            variant={selected ? "light" : "subtle"}
            onClick={(event) => {
              event.stopPropagation();
              onPlay();
            }}
          >
            {speechStatus === "speaking" ? (
              <Pause fill="currentColor" size={14} />
            ) : speechStatus === "paused" ? (
              <Play fill="currentColor" size={14} />
            ) : (
              <Volume2 size={15} />
            )}
          </ActionIcon>
        </Tooltip>
      </Group>
      <Stack gap={0}>
        {sentences.map((sentence) => (
          <SentenceBlock
            key={sentence.id}
            activePhraseId={activePhraseId}
            activeSpoken={activeSpokenSentenceId === sentence.id}
            sentence={sentence}
            onSelectPhrase={onSelectPhrase}
            onUpdateTranslation={onUpdateTranslation}
          />
        ))}
      </Stack>
    </Box>
  );
}

function SentenceBlock({
  activePhraseId,
  activeSpoken,
  onUpdateTranslation,
  sentence,
  onSelectPhrase,
}: {
  activePhraseId: string | null;
  activeSpoken: boolean;
  onUpdateTranslation: (sentenceId: string, translation: string) => void;
  sentence: SentenceAnalysis;
  onSelectPhrase: (id: string) => void;
}) {
  return (
    <Box className={`sentenceBlock ${activeSpoken ? "sentenceBlock-speaking" : ""}`}>
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
