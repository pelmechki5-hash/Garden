import { useEffect, useState } from 'react';
import type { LanguageCode } from '../types/settings';

const speechLocales: Record<LanguageCode, string> = {
  ru: 'ru-RU', kk: 'kk-KZ', en: 'en-US', tr: 'tr-TR', uz: 'uz-UZ',
  ky: 'ky-KG', zh: 'zh-CN', de: 'de-DE', fr: 'fr-FR', es: 'es-ES',
};

function plainSpeechText(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[([^\]]*)]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[`*_~#>|]/g, '')
    .replace(/[\p{Extended_Pictographic}\u200D\uFE0E\uFE0F\u20E3]/gu, '')
    .replace(/^[\s\-–—•]+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function voiceScore(voice: SpeechSynthesisVoice, locale: string) {
  const language = locale.slice(0, 2).toLowerCase();
  const name = voice.name.toLowerCase();
  let score = voice.lang.toLowerCase().startsWith(language) ? 20 : 0;
  if (voice.localService) score += 4;
  if (/natural|premium|enhanced|google|microsoft|siri/.test(name)) score += 8;
  if (/compact|robot|espeak/.test(name)) score -= 5;
  return score;
}

interface SpeakButtonProps {
  text: string;
  language: LanguageCode;
  speakLabel: string;
  stopLabel: string;
  persona?: 'seal' | 'human';
}

export function SpeakButton({ text, language, speakLabel, stopLabel, persona = 'seal' }: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function toggleSpeech() {
    if (!supported) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const speechText = plainSpeechText(text);
    if (!speechText) return;
    const utterance = new SpeechSynthesisUtterance(speechText);
    const locale = speechLocales[language];
    const voices = [...window.speechSynthesis.getVoices()]
      .sort((first, second) => voiceScore(second, locale) - voiceScore(first, locale));
    utterance.lang = locale;
    utterance.voice = voices.find((voice) => voice.lang.toLowerCase().startsWith(locale.slice(0, 2))) ?? null;
    utterance.volume = 1;
    utterance.pitch = persona === 'seal' ? 0.92 : 1;
    utterance.rate = persona === 'seal' ? 0.9 : 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  if (!supported) return null;
  const label = speaking ? stopLabel : speakLabel;
  return (
    <button className={`speak-button${speaking ? ' speak-button--active' : ''}`} onClick={toggleSpeech} aria-label={label} title={label}>
      <span aria-hidden="true">{speaking ? '■' : '🔊'}</span>
      {label}
    </button>
  );
}
