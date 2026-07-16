import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type SpeechStatus = "idle" | "speaking" | "paused";

export type SpeechSegment = {
  id: string;
  text: string;
};

const voiceStorageKey = "phrase-lens:speech-voice";
const rateStorageKey = "phrase-lens:speech-rate";
const defaultRate = 1;

function readStoredValue(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function persistValue(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Speech preferences are optional when storage is unavailable.
  }
}

function voiceScore(voice: SpeechSynthesisVoice) {
  const name = voice.name.toLowerCase();
  let score = 0;

  if (voice.localService) score += 200;
  if (/natural|premium|enhanced|neural/.test(name)) score += 120;
  if (/ava|samantha|allison|serena|daniel|karen|moira|tessa|aria|jenny|guy/.test(name)) score += 55;
  if (voice.lang.toLowerCase() === "en-us") score += 30;
  else if (voice.lang.toLowerCase().startsWith("en-")) score += 22;
  if (/online/.test(name)) score -= 20;
  if (/albert|bad news|bells|boing|bubbles|cellos|deranged|hysterical|organ|trinoids|whisper|zarvox/.test(name)) {
    score -= 200;
  }

  return score;
}

function sortVoices(voices: SpeechSynthesisVoice[]) {
  const uniqueVoices = Array.from(new Map(voices.map((voice) => [voice.voiceURI, voice])).values());
  const englishVoices = uniqueVoices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const candidates = englishVoices.length ? englishVoices : uniqueVoices;

  return candidates.sort((left, right) => voiceScore(right) - voiceScore(left));
}

function resetSpeechSynthesis() {
  const synthesis = window.speechSynthesis;
  if (synthesis.paused) synthesis.resume();
  synthesis.cancel();
  if (synthesis.paused) synthesis.resume();
}

export function useSpeechPlayer() {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURIState] = useState(() => readStoredValue(voiceStorageKey) ?? "");
  const [rate, setRateState] = useState(() => {
    const storedRate = Number(readStoredValue(rateStorageKey));
    return storedRate >= 0.5 && storedRate <= 2 ? storedRate : defaultRate;
  });
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [trackId, setTrackId] = useState<string | null>(null);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const segmentsRef = useRef<SpeechSegment[]>([]);
  const segmentIndexRef = useRef(0);
  const sessionRef = useRef(0);
  const statusRef = useRef<SpeechStatus>("idle");
  const voiceURIRef = useRef(voiceURI);
  const rateRef = useRef(rate);

  const commitStatus = useCallback((nextStatus: SpeechStatus) => {
    statusRef.current = nextStatus;
    setStatus(nextStatus);
  }, []);

  const getVoice = useCallback(() => {
    const selectedVoice = voices.find((voice) => voice.voiceURI === voiceURIRef.current);
    return selectedVoice ?? voices[0];
  }, [voices]);

  const speakSegment = useCallback((index: number, session: number, pauseOnStart = false) => {
    if (!supported || session !== sessionRef.current) return;

    const segment = segmentsRef.current[index];
    if (!segment) {
      commitStatus("idle");
      setActiveSegmentId(null);
      setProgress(1);
      return;
    }

    segmentIndexRef.current = index;
    setActiveSegmentId(segment.id);

    const utterance = new SpeechSynthesisUtterance(segment.text);
    const selectedVoice = getVoice();
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = "en-US";
    }
    utterance.rate = rateRef.current;
    utterance.pitch = 1;

    const completedCharacters = segmentsRef.current
      .slice(0, index)
      .reduce((total, item) => total + item.text.length, 0);
    const totalCharacters = Math.max(
      1,
      segmentsRef.current.reduce((total, item) => total + item.text.length, 0),
    );

    utterance.onstart = () => {
      if (session !== sessionRef.current) return;
      if (pauseOnStart) {
        window.speechSynthesis.pause();
        commitStatus("paused");
      } else {
        commitStatus("speaking");
      }
    };

    utterance.onboundary = (event) => {
      if (session !== sessionRef.current) return;
      const spokenCharacters = Math.min(segment.text.length, event.charIndex + (event.charLength || 1));
      setProgress((completedCharacters + spokenCharacters) / totalCharacters);
    };

    utterance.onend = () => {
      if (session !== sessionRef.current) return;
      const nextIndex = index + 1;
      if (nextIndex < segmentsRef.current.length) {
        setProgress(
          segmentsRef.current
            .slice(0, nextIndex)
            .reduce((total, item) => total + item.text.length, 0) / totalCharacters,
        );
        speakSegment(nextIndex, session);
        return;
      }

      utteranceRef.current = null;
      commitStatus("idle");
      setActiveSegmentId(null);
      setProgress(1);
    };

    utterance.onerror = (event) => {
      if (session !== sessionRef.current || event.error === "canceled" || event.error === "interrupted") return;
      utteranceRef.current = null;
      commitStatus("idle");
      setActiveSegmentId(null);
      setError("朗读被浏览器中断，请再试一次。");
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [commitStatus, getVoice, supported]);

  const stop = useCallback(() => {
    sessionRef.current += 1;
    if (supported) resetSpeechSynthesis();
    utteranceRef.current = null;
    segmentsRef.current = [];
    segmentIndexRef.current = 0;
    setTrackId(null);
    setActiveSegmentId(null);
    setProgress(0);
    setError(null);
    commitStatus("idle");
  }, [commitStatus, supported]);

  const play = useCallback((nextTrackId: string, segments: SpeechSegment[]) => {
    if (!supported || segments.length === 0) return;

    sessionRef.current += 1;
    resetSpeechSynthesis();
    const session = sessionRef.current;
    segmentsRef.current = segments;
    segmentIndexRef.current = 0;
    setTrackId(nextTrackId);
    setProgress(0);
    setError(null);
    commitStatus("speaking");
    speakSegment(0, session);
  }, [commitStatus, speakSegment, supported]);

  const togglePause = useCallback(() => {
    if (!supported) return;
    if (statusRef.current === "speaking") {
      window.speechSynthesis.pause();
      commitStatus("paused");
    } else if (statusRef.current === "paused") {
      window.speechSynthesis.resume();
      commitStatus("speaking");
    }
  }, [commitStatus, supported]);

  const restartCurrentSegment = useCallback(() => {
    if (!supported || statusRef.current === "idle" || segmentsRef.current.length === 0) return;
    const pauseOnStart = statusRef.current === "paused";
    sessionRef.current += 1;
    resetSpeechSynthesis();
    const session = sessionRef.current;
    commitStatus("speaking");
    speakSegment(segmentIndexRef.current, session, pauseOnStart);
  }, [commitStatus, speakSegment, supported]);

  const setVoiceURI = useCallback((nextVoiceURI: string) => {
    voiceURIRef.current = nextVoiceURI;
    setVoiceURIState(nextVoiceURI);
    persistValue(voiceStorageKey, nextVoiceURI);
    restartCurrentSegment();
  }, [restartCurrentSegment]);

  const setRate = useCallback((nextRate: number) => {
    rateRef.current = nextRate;
    setRateState(nextRate);
    persistValue(rateStorageKey, String(nextRate));
    restartCurrentSegment();
  }, [restartCurrentSegment]);

  useEffect(() => {
    if (!supported) return;

    const loadVoices = () => setVoices(sortVoices(window.speechSynthesis.getVoices()));
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [supported]);

  useEffect(() => {
    if (!voices.length) return;
    const storedVoiceExists = voices.some((voice) => voice.voiceURI === voiceURIRef.current);
    if (storedVoiceExists) return;

    const bestVoiceURI = voices[0].voiceURI;
    voiceURIRef.current = bestVoiceURI;
    setVoiceURIState(bestVoiceURI);
    persistValue(voiceStorageKey, bestVoiceURI);
  }, [voices]);

  useEffect(() => stop, [stop]);

  const voiceOptions = useMemo(
    () => voices.map((voice) => ({ value: voice.voiceURI, label: `${voice.name} · ${voice.lang}` })),
    [voices],
  );
  const voiceIsLocal = voices.find((voice) => voice.voiceURI === voiceURI)?.localService ?? false;

  return {
    activeSegmentId,
    error,
    play,
    progress,
    rate,
    setRate,
    setVoiceURI,
    status,
    stop,
    supported,
    togglePause,
    trackId,
    voiceIsLocal,
    voiceOptions,
    voiceURI,
  };
}
