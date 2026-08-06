import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
}

function getRecognitionCtor(): any | null {
  if (Platform.OS !== 'web') return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function useVoiceInput(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    const ctor = getRecognitionCtor();
    setSupported(!!ctor);
    if (!ctor) return;
    const rec: SpeechRecognitionLike = new ctor();
    rec.lang = 'cs-CZ';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (transcript) onResultRef.current(transcript);
    };
    rec.onerror = () => {
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
    };
    recRef.current = rec;
    return () => {
      try {
        rec.stop();
      } catch {
        // ignore
      }
    };
  }, []);

  const start = useCallback(() => {
    if (!recRef.current) return;
    try {
      recRef.current.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (!recRef.current) return;
    try {
      recRef.current.stop();
    } catch {
      // ignore
    }
    setListening(false);
  }, []);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  return { listening, supported, start, stop, toggle };
}
