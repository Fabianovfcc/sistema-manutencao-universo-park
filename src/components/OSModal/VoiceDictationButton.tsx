import { useEffect, useRef, useState } from 'react';

interface Props {
  onResult: (finalChunk: string) => void;
}

function capitalizeAndPunctuate(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  const capitalized = trimmed[0].toUpperCase() + trimmed.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

export default function VoiceDictationButton({ onResult }: Props) {
  const [supported, setSupported] = useState(true);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          onResult(capitalizeAndPunctuate(result[0].transcript));
        }
      }
    };
    recognition.onend = () => setRecording(false);
    recognition.onerror = () => setRecording(false);

    recognitionRef.current = recognition;
    return () => {
      recognition.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle() {
    if (!recognitionRef.current) return;
    if (recording) {
      recognitionRef.current.stop();
      setRecording(false);
    } else {
      recognitionRef.current.start();
      setRecording(true);
    }
  }

  if (!supported) {
    return (
      <span style={{ fontSize: 11, color: 'var(--text-2)' }}>
        Ditado por voz disponível apenas no Chrome/Edge
      </span>
    );
  }

  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={toggle}>
      {recording ? '⏹️ Parar (gravando...)' : '🎙️ Ditar por voz'}
    </button>
  );
}
