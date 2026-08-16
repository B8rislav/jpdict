'use client';

import { useCallback, useEffect, useState } from 'react';
import { type Language } from '@/shared/api/types';

const BCP47: Record<Language, string> = { jp: 'ja-JP', cn: 'zh-CN' };

/**
 * Pronunciation via the browser's Web Speech API.
 *
 * There is no TTS backend: this is entirely client-side, which means the voice is the
 * operating system's and **may not exist at all** — Japanese voices are commonly absent
 * on Linux and on some Windows installs. `supported` reports that honestly so the UI can
 * disable the control rather than have it silently do nothing.
 *
 * Voices load asynchronously in most browsers, so the list is re-read on `voiceschanged`.
 */
export function useSpeech(language: Language) {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setReady(true);
      return;
    }

    const target = BCP47[language];
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      // Exact locale first, then any voice for the same base language (ja-JP vs ja).
      const base = target.split('-')[0];
      const match =
        voices.find((candidate) => candidate.lang.replace('_', '-') === target) ??
        voices.find((candidate) => candidate.lang.replace('_', '-').startsWith(base));
      setVoice(match ?? null);
      if (voices.length) setReady(true);
    };

    pick();
    window.speechSynthesis.addEventListener('voiceschanged', pick);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pick);
  }, [language]);

  const speak = useCallback(
    (text: string) => {
      if (!text || typeof window === 'undefined' || !window.speechSynthesis || !voice) return;
      // Cancel first: clicking through a list otherwise queues every utterance.
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.lang = voice.lang;
      window.speechSynthesis.speak(utterance);
    },
    [voice],
  );

  return { speak, supported: voice !== null, ready };
}
