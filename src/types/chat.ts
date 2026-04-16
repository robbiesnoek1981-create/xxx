export type Role = 'schrijver' | 'toetser';
export type WetType = 'wmo' | 'jeugdwet';

export type ConversationPhase =
  | 'role_selection'
  | 'wet_selection'
  | 'conversation';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatState {
  phase: ConversationPhase;
  selectedRole: Role | null;
  selectedWet: WetType | null;
  messages: ChatMessage[];
  conversationHistory: AnthropicMessage[];
  isLoading: boolean;
  error: string | null;
}
