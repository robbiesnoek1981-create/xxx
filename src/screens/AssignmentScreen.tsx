import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useChat } from '../hooks/useChat';
import { ChatMessage } from '../components/ChatMessage';
import { QuickReplies } from '../components/QuickReplies';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../constants/theme';
import type { Role, WetType } from '../types/chat';

const ROLE_REPLIES = [
  {
    label: 'Schrijver',
    value: 'schrijver',
    description: 'Ik wil een nieuwe toewijzing schrijven',
  },
  {
    label: 'Toetser',
    value: 'toetser',
    description: 'Ik wil een bestaande toewijzing beoordelen',
  },
];

const WET_REPLIES = [
  {
    label: 'Wmo',
    value: 'wmo',
    description: 'Wet maatschappelijke ondersteuning 2015',
  },
  {
    label: 'Jeugdwet',
    value: 'jeugdwet',
    description: 'Ondersteuning voor jeugd',
  },
];

function TypingIndicator() {
  return (
    <View style={styles.typingRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>STH</Text>
      </View>
      <View style={[styles.typingBubble]}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.typingText}>Bezig met verwerken…</Text>
      </View>
    </View>
  );
}

export function AssignmentScreen() {
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState('');

  const {
    phase,
    messages,
    isLoading,
    error,
    selectRole,
    selectWet,
    sendUserMessage,
    dismissError,
    resetChat,
  } = useChat();

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    setInputText('');
    sendUserMessage(text);
  };

  const renderFooter = () => (
    <>
      {phase === 'role_selection' && (
        <QuickReplies
          replies={ROLE_REPLIES}
          onSelect={(value) => selectRole(value as Role)}
        />
      )}
      {phase === 'wet_selection' && (
        <QuickReplies
          replies={WET_REPLIES}
          onSelect={(value) => selectWet(value as WetType)}
        />
      )}
      {isLoading && <TypingIndicator />}
      <View style={styles.listBottomPadding} />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Toewijzing Assistent</Text>
          <Text style={styles.headerSubtitle}>Sociale Teams Helmond</Text>
        </View>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetChat}
          accessibilityLabel="Nieuw gesprek starten"
          accessibilityRole="button"
        >
          <Text style={styles.resetButtonText}>↺ Opnieuw</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <TouchableOpacity
          style={styles.errorBanner}
          onPress={dismissError}
          accessibilityLabel="Fout sluiten"
        >
          <Text style={styles.errorText} numberOfLines={3}>
            {error}
          </Text>
          <Text style={styles.errorClose}>✕</Text>
        </TouchableOpacity>
      )}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatMessage message={item} />}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          ListFooterComponent={renderFooter}
          style={styles.flex}
          keyboardShouldPersistTaps="handled"
        />

        {phase === 'conversation' && (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Typ hier je bericht of plak een toewijzing…"
              placeholderTextColor={Colors.disabled}
              multiline
              maxLength={4000}
              editable={!isLoading}
              accessibilityLabel="Berichtinvoer"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
              accessibilityLabel="Verzenden"
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.sendButtonText,
                  (!inputText.trim() || isLoading) && styles.sendButtonTextDisabled,
                ]}
              >
                Stuur
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    ...Shadow.card,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: Colors.surface,
    fontSize: FontSize.lg,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: Colors.surface,
    fontSize: FontSize.sm,
    opacity: 0.8,
    marginTop: 2,
  },
  resetButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    marginLeft: Spacing.sm,
  },
  resetButtonText: {
    color: Colors.surface,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  errorText: {
    flex: 1,
    color: Colors.error,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  errorClose: {
    color: Colors.error,
    fontSize: FontSize.md,
    marginLeft: Spacing.sm,
    fontWeight: '600',
  },
  listContent: {
    paddingTop: Spacing.md,
  },
  listBottomPadding: {
    height: Spacing.md,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  avatarText: {
    color: Colors.surface,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  typingText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSize.md,
    color: Colors.text,
    maxHeight: 120,
    minHeight: 44,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    minHeight: 44,
    minWidth: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  sendButtonText: {
    color: Colors.surface,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  sendButtonTextDisabled: {
    color: Colors.surface,
  },
});
