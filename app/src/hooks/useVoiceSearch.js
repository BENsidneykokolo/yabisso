import { useState, useCallback } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

export function useVoiceSearch({ onResult, locale = 'fr-FR' }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  useSpeechRecognitionEvent('result', (e) => {
    const text = e.results[0]?.transcript ?? '';
    setTranscript(text);
    if (e.isFinal) {
      onResult?.(text);
      setIsListening(false);
    }
  });

  useSpeechRecognitionEvent('error', (e) => {
    setError(e.message);
    setIsListening(false);
  });

  const start = useCallback(async () => {
    setError(null);
    setTranscript('');

    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      setError('Permission microphone refusée');
      return;
    }

    try {
      ExpoSpeechRecognitionModule.start({
        lang: locale,
        interimResults: true,
        requiresOnDeviceRecognition: true,
      });
      setIsListening(true);
    } catch (err) {
      setError(err.message);
      setIsListening(false);
    }
  }, [locale]);

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
    setIsListening(false);
  }, []);

  return { isListening, transcript, error, start, stop };
}
