export type HighlightColor = "red" | "green";

export type PhraseRule = {
  phrase: string;
  color: HighlightColor;
  meaning: string;
};

export type PhraseMark = {
  id: string;
  rulePhrase: string;
  text: string;
  color: HighlightColor;
  meaning: string;
  start: number;
  end: number;
  sentenceIndex: number;
  sentenceText: string;
  translation: string;
};

export type SentenceAnalysis = {
  id: string;
  index: number;
  text: string;
  translation: string;
  marks: PhraseMark[];
};

export type ReadingAnalysis = {
  sentences: SentenceAnalysis[];
  phrases: PhraseMark[];
};

const fallbackTranslation = "离线版先提供短语高亮；这里可以接入翻译 API 或粘贴你自己的参考译文。";

export function normalizeSpaces(value: string) {
  return value.replace(/[ \t\n]+/g, " ").trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function splitSentences(text: string) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (!compact) return [];

  return compact.match(/[^.!?。！？]+(?:[.!?。！？]+|$)/g)?.map((item) => item.trim()) ?? [compact];
}

function getTranslation(sentence: string, translations: Map<string, string>) {
  return translations.get(normalizeSpaces(sentence)) ?? fallbackTranslation;
}

function findMatches(sentence: string, rules: PhraseRule[]) {
  const used: Array<{ start: number; end: number }> = [];
  const matches: Array<Omit<PhraseMark, "id" | "sentenceIndex" | "sentenceText" | "translation">> = [];
  const sortedRules = [...rules].sort((a, b) => b.phrase.length - a.phrase.length);

  sortedRules.forEach((rule) => {
    const pattern = new RegExp(escapeRegExp(rule.phrase).replace(/\s+/g, "\\s+"), "gi");
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(sentence)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      const overlaps = used.some((range) => start < range.end && end > range.start);

      if (!overlaps) {
        used.push({ start, end });
        matches.push({
          rulePhrase: rule.phrase,
          text: match[0],
          color: rule.color,
          meaning: rule.meaning,
          start,
          end,
        });
      }
    }
  });

  return matches.sort((a, b) => a.start - b.start);
}

export function analyzeReading(
  text: string,
  rules: PhraseRule[],
  translations: Map<string, string>,
): ReadingAnalysis {
  const sentences = splitSentences(text).map<SentenceAnalysis>((sentence, sentenceIndex) => {
    const translation = getTranslation(sentence, translations);
    const marks = findMatches(sentence, rules).map<PhraseMark>((match, matchIndex) => ({
      ...match,
      id: `s${sentenceIndex}-p${matchIndex}-${match.start}`,
      sentenceIndex,
      sentenceText: sentence,
      translation,
    }));

    return {
      id: `sentence-${sentenceIndex}`,
      index: sentenceIndex,
      text: sentence,
      translation,
      marks,
    };
  });

  return {
    sentences,
    phrases: sentences.flatMap((sentence) => sentence.marks),
  };
}

export function getReadingTitle(text: string) {
  const firstLine = text
    .split(/\n+/)
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstLine) return "Untitled reading";
  return firstLine.length > 46 ? `${firstLine.slice(0, 46)}...` : firstLine;
}

export function buildNotes(phrases: PhraseMark[]) {
  return phrases
    .map((phrase) => {
      const tag = phrase.color === "red" ? "短语" : "结构";
      return `- [${tag}] ${phrase.text}: ${phrase.meaning}`;
    })
    .join("\n");
}
