import { useEffect, useRef, useState } from 'react';
import type { LanguageCode } from '../types/settings';

interface SpeechResultEvent {
  results: { length: number; [index: number]: { 0: { transcript: string } } };
}

interface SpeechErrorEvent { error: string }
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
type SpeechWindow = Window & typeof globalThis & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const locales: Record<LanguageCode, string> = {
  ru: 'ru-RU', kk: 'kk-KZ', en: 'en-US', tr: 'tr-TR', uz: 'uz-UZ',
  ky: 'ky-KG', zh: 'zh-CN', de: 'de-DE', fr: 'fr-FR', es: 'es-ES',
};

interface VoiceInputButtonProps {
  language: LanguageCode;
  value: string;
  onTranscript: (text: string) => void;
  onError: (reason: 'unsupported' | 'permission' | 'failed' | '') => void;
  label: string;
}

export function VoiceInputButton({ language, value, onTranscript, onError, label }: VoiceInputButtonProps) {
  const [listening, setListening] = useState(false);
  const recognition = useRef<SpeechRecognitionLike | null>(null);
  const prefix = useRef('');
  const browser = window as SpeechWindow;
  const Recognition = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;

  useEffect(() => () => recognition.current?.abort(), []);

  async function toggle() {
    if (listening) {
      recognition.current?.stop();
      return;
    }
    if (!Recognition) {
      onError('unsupported');
      return;
    }
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
      const next = new Recognition();
      prefix.current = value.trim();
      next.lang = locales[language];
      next.interimResults = true;
      next.continuous = false;
      next.onresult = (event) => {
        let heard = '';
        for (let index = 0; index < event.results.length; index += 1) heard += event.results[index][0].transcript;
        onTranscript([prefix.current, heard.trim()].filter(Boolean).join(' '));
      };
      next.onend = () => setListening(false);
      next.onerror = (event) => {
        setListening(false);
        onError(event.error === 'not-allowed' || event.error === 'service-not-allowed' ? 'permission' : 'failed');
      };
      recognition.current = next;
      onError('');
      setListening(true);
      next.start();
    } catch {
      setListening(false);
      onError('permission');
    }
  }

  return (
    <button type="button" className={`voice-input${listening ? ' voice-input--active' : ''}`} onClick={() => void toggle()} aria-label={label} title={label} aria-pressed={listening}>
      <span aria-hidden="true">{listening ? '■' : '🎙️'}</span>
    </button>
  );
}
