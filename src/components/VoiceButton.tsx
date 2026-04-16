import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, Text } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

interface Props {
  onRecordingStart: () => void;
  onTranscript: (text: string, isFinal: boolean) => void;
  disabled?: boolean;
}

export function VoiceButton({ onRecordingStart, onTranscript, disabled }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isListeningRef = useRef(false);

  useEffect(() => {
    try {
      setIsAvailable(ExpoSpeechRecognitionModule.isRecognitionAvailable());
    } catch {
      setIsAvailable(false);
    }
  }, []);

  // Keep ref in sync for cleanup
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Stop on unmount
  useEffect(() => {
    return () => {
      if (isListeningRef.current) {
        try {
          ExpoSpeechRecognitionModule.stop();
        } catch {}
      }
    };
  }, []);

  // Pulse animation while listening
  useEffect(() => {
    if (isListening) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [isListening, pulseAnim]);

  useSpeechRecognitionEvent('result', (event) => {
    if (!isListeningRef.current) return;
    const transcript = event.results[0]?.transcript ?? '';
    if (!transcript) return;
    onTranscript(transcript, event.isFinal);
    if (event.isFinal) {
      setIsListening(false);
    }
  });

  useSpeechRecognitionEvent('error', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  const toggle = async () => {
    if (isListening) {
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch {}
      setIsListening(false);
      return;
    }

    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) return;

      onRecordingStart();
      ExpoSpeechRecognitionModule.start({
        lang: 'nl-NL',
        interimResults: true,
        continuous: false,
      });
      setIsListening(true);
    } catch {
      setIsAvailable(false);
    }
  };

  if (!isAvailable) return null;

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity
        style={[
          styles.button,
          isListening && styles.buttonActive,
          disabled && styles.buttonDisabled,
        ]}
        onPress={toggle}
        disabled={disabled}
        accessibilityLabel={isListening ? 'Stop spraakopname' : 'Start spraakopname'}
        accessibilityRole="button"
        activeOpacity={0.75}
      >
        <Text style={[styles.icon, isListening && styles.iconActive]}>
          {isListening ? '⏹' : '🎤'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#FFEBEE',
    borderColor: Colors.error,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  icon: {
    fontSize: 18,
    lineHeight: 22,
  },
  iconActive: {
    fontSize: 16,
  },
});
