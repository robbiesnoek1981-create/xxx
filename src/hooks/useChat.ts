import { useState, useCallback } from 'react';
import { sendMessage } from '../services/claudeService';
import type {
  ChatState,
  ChatMessage,
  AnthropicMessage,
  Role,
  WetType,
} from '../types/chat';

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const OPENING_MESSAGE = 'Wil je dat ik optreed als Schrijver of als Toetser?';

function makeInitialMessage(): ChatMessage {
  return {
    id: 'init',
    role: 'assistant',
    content: OPENING_MESSAGE,
    timestamp: new Date(),
  };
}

const INITIAL_STATE: ChatState = {
  phase: 'role_selection',
  selectedRole: null,
  selectedWet: null,
  messages: [makeInitialMessage()],
  conversationHistory: [],
  isLoading: false,
  error: null,
};

export function useChat() {
  const [state, setState] = useState<ChatState>(INITIAL_STATE);

  async function callClaude(
    role: Role,
    wet: WetType | null,
    history: AnthropicMessage[],
    userText: string
  ): Promise<void> {
    try {
      const result = await sendMessage({
        role,
        wet,
        conversationHistory: history,
        newUserMessage: userText,
      });

      const assistantMsg: ChatMessage = {
        id: makeId(),
        role: 'assistant',
        content: result.content,
        timestamp: new Date(),
      };

      const newHistory: AnthropicMessage[] = [
        ...history,
        { role: 'user', content: userText },
        { role: 'assistant', content: result.content },
      ];

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMsg],
        conversationHistory: newHistory,
        isLoading: false,
      }));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Er is een fout opgetreden. Controleer uw internetverbinding en probeer opnieuw.';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }

  const selectRole = useCallback(async (role: Role) => {
    const userMsg: ChatMessage = {
      id: makeId(),
      role: 'user',
      content: role === 'schrijver' ? 'Schrijver' : 'Toetser',
      timestamp: new Date(),
    };

    if (role === 'schrijver') {
      const assistantMsg: ChatMessage = {
        id: makeId(),
        role: 'assistant',
        content: 'Gaat het om een toewijzing voor Wmo of voor de Jeugdwet?',
        timestamp: new Date(),
      };
      setState((prev) => ({
        ...prev,
        selectedRole: role,
        phase: 'wet_selection',
        messages: [...prev.messages, userMsg, assistantMsg],
      }));
    } else {
      setState((prev) => ({
        ...prev,
        selectedRole: role,
        phase: 'conversation',
        messages: [...prev.messages, userMsg],
        isLoading: true,
        error: null,
      }));
      await callClaude(role, null, [], 'Ik wil een toewijzing toetsen.');
    }
  }, []);

  const selectWet = useCallback(
    async (wet: WetType) => {
      if (!state.selectedRole) return;

      const userMsg: ChatMessage = {
        id: makeId(),
        role: 'user',
        content: wet === 'wmo' ? 'Wmo' : 'Jeugdwet',
        timestamp: new Date(),
      };

      const currentRole = state.selectedRole;

      setState((prev) => ({
        ...prev,
        selectedWet: wet,
        phase: 'conversation',
        messages: [...prev.messages, userMsg],
        isLoading: true,
        error: null,
      }));

      await callClaude(currentRole, wet, [], wet === 'wmo' ? 'Wmo' : 'Jeugdwet');
    },
    [state.selectedRole]
  );

  const sendUserMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || state.isLoading || !state.selectedRole) return;

      const userMsg: ChatMessage = {
        id: makeId(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      const currentRole = state.selectedRole;
      const currentWet = state.selectedWet;
      const currentHistory = state.conversationHistory;

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMsg],
        isLoading: true,
        error: null,
      }));

      await callClaude(currentRole, currentWet, currentHistory, trimmed);
    },
    [state.isLoading, state.selectedRole, state.selectedWet, state.conversationHistory]
  );

  const dismissError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const resetChat = useCallback(() => {
    setState({
      ...INITIAL_STATE,
      messages: [makeInitialMessage()],
    });
  }, []);

  return {
    ...state,
    selectRole,
    selectWet,
    sendUserMessage,
    dismissError,
    resetChat,
  };
}
