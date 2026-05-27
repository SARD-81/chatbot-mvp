import type { ChatMessage as ChatMessageType } from '@/types/chat';
import { SuggestedPromptsList } from './SuggestedPromptsList';

type ChatMessageProps = {
  message: ChatMessageType;
  onSelectPrompt?: (prompt: string) => void;
};

export function ChatMessage({ message, onSelectPrompt }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <article className={`message-row ${isAssistant ? 'assistant-message' : 'user-message'}`}>
      <div className="message-content">
        <div className="message-bubble">{message.content}</div>

        {isAssistant && message.suggestedPrompts?.length ? (
          <SuggestedPromptsList
            items={message.suggestedPrompts}
            onSelectPrompt={onSelectPrompt}
          />
        ) : null}
      </div>
    </article>
  );
}
