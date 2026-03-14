import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import ImageLabeling from '@react-native-ml-kit/image-labeling';

export function usePhotoSearch({ onResult }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState(null);

  const processImage = useCallback(async (uri) => {
    setIsProcessing(true);
    setPreview(uri);

    try {
      const [ocrResult, labelResult] = await Promise.all([
        TextRecognition.recognize(uri),
        ImageLabeling.label(uri),
      ]);

      const ocrText = ocrResult.text?.trim() ?? '';
      const labels = labelResult
        .filter(l => l.confidence > 0.6) // Confiance à 60%
        .map(l => l.text);

      const searchQuery = buildSearchQuery(ocrText, labels);
      onResult?.({ ocrText, labels, searchQuery, uri });
    } catch (e) {
      console.error('Photo search error:', e);
    } finally {
      setIsProcessing(false);
    }
  }, [onResult]);

  const pickFromGallery = useCallback(async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled) {
      await processImage(result.assets[0].uri);
    }
  }, [processImage]);

  const takePhoto = useCallback(async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) return;

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      await processImage(result.assets[0].uri);
    }
  }, [processImage]);

  return { pickFromGallery, takePhoto, isProcessing, preview };
}

function buildSearchQuery(ocrText, labels) {
  const parts = [];
  if (ocrText) parts.push(ocrText.substring(0, 50));
  if (labels.length) parts.push(labels.slice(0, 2).join(' '));
  return parts.join(' ').trim();
}
