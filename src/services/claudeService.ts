import Anthropic from '@anthropic-ai/sdk';
import type { PromptCachingBetaTextBlockParam } from '@anthropic-ai/sdk/resources/beta/prompt-caching/messages';
import { buildSystemPrompt } from '../constants/systemPrompt';
import type { AnthropicMessage, Role, WetType } from '../types/chat';

export interface SendMessageOptions {
  role: Role;
  wet: WetType | null;
  conversationHistory: AnthropicMessage[];
  newUserMessage: string;
}

export interface SendMessageResult {
  content: string;
  cacheReadTokens: number;
  cacheCreationTokens: number;
}

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';
    _client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }
  return _client;
}

export async function sendMessage(options: SendMessageOptions): Promise<SendMessageResult> {
  const { role, wet, conversationHistory, newUserMessage } = options;

  if (!process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY) {
    throw new Error(
      'API-sleutel niet ingesteld. Voeg EXPO_PUBLIC_ANTHROPIC_API_KEY toe aan uw .env bestand.'
    );
  }

  const systemPromptText = buildSystemPrompt(role, wet);

  const systemBlock: PromptCachingBetaTextBlockParam = {
    type: 'text',
    text: systemPromptText,
    cache_control: { type: 'ephemeral' },
  };

  const messages = [
    ...conversationHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: newUserMessage },
  ];

  const response = await getClient().beta.promptCaching.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: [systemBlock],
    messages,
    betas: ['prompt-caching-2024-07-31'],
  });

  const content =
    response.content[0].type === 'text' ? response.content[0].text : '';

  return {
    content,
    cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
    cacheCreationTokens: response.usage.cache_creation_input_tokens ?? 0,
  };
}
