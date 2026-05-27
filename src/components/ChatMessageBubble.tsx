import { useState } from 'react';
import {
  Bot,
  Check,
  Copy,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
  UserRound,
} from 'lucide-react';
import type { ChatMessage } from '../types/chat';
import { ResultTable } from './ResultTable';
import { MarkdownMessage } from './MarkdownMessage';
import { SuggestedPromptsList } from './chat/SuggestedPromptsList';
import { ChatResponseChart } from "./ChatResponseChart";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  canRegenerate?: boolean;
  onRegenerate?: (assistantMessageId: string) => void;
}

type FeedbackValue = 'good' | 'bad' | null;

function fallbackCopyText(text: string) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';

  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

export function ChatMessageBubble({
  message,
  canRegenerate = false,
  onRegenerate,
}: ChatMessageBubbleProps) {
  const isUser = message.role === 'user';
  const hasTable = Boolean(message.response?.table);

  const [isCopied, setIsCopied] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackValue>(null);

  async function handleCopy() {
    const textToCopy = message.content.trim();

    if (!textToCopy) {
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch {
      fallbackCopyText(textToCopy);
    }

    setIsCopied(true);

    window.setTimeout(() => {
      setIsCopied(false);
    }, 1300);
  }

  function handleFeedback(nextFeedback: Exclude<FeedbackValue, null>) {
    setFeedback((currentFeedback) =>
      currentFeedback === nextFeedback ? null : nextFeedback,
    );
  }

  return (
    <article className={`message-row ${isUser ? 'user-message' : 'assistant-message'}`}>
      <div className="message-avatar">
        {isUser ? <UserRound size={18} /> : <Bot size={18} />}
      </div>

      <div className="message-content">
        <div className="message-label">
          {isUser ? 'شما' : 'دستیار'}
        </div>

        <div className="message-bubble">
  {message.error ? (
    <p className="message-error">{message.error}</p>
  ) : (
    <MarkdownMessage content={message.content} />
  )}
</div>


        {!message.error && !isUser && message.suggestedPrompts?.length ? (
          <SuggestedPromptsList items={message.suggestedPrompts} />
        ) : null}

        {!message.error && (
          <div className="message-actions">
            <button
              type="button"
              className={`message-action-button copy-action ${isCopied ? 'is-copied' : ''}`}
              onClick={handleCopy}
              aria-label="کپی پیام"
              title="کپی پیام"
            >
              {isCopied ? <Check size={16} /> : <Copy size={16} />}
              <span>{isCopied ? 'کپی شد' : 'کپی'}</span>
            </button>

            {!isUser && (
              <>
                <button
                  type="button"
                  className={`message-action-button feedback-action good-action ${
                    feedback === 'good' ? 'is-active' : ''
                  }`}
                  onClick={() => handleFeedback('good')}
                  aria-label="پاسخ خوب بود"
                  title="پاسخ خوب بود"
                >
                  <ThumbsUp size={16} />
                  <span>خوب بود</span>
                </button>

                <button
                  type="button"
                  className={`message-action-button feedback-action bad-action ${
                    feedback === 'bad' ? 'is-active' : ''
                  }`}
                  onClick={() => handleFeedback('bad')}
                  aria-label="پاسخ خوب نبود"
                  title="پاسخ خوب نبود"
                >
                  <ThumbsDown size={16} />
                  <span>خوب نبود</span>
                </button>

                {canRegenerate && (
                  <button
                    type="button"
                    className="message-action-button regenerate-action"
                    onClick={() => onRegenerate?.(message.id)}
                    aria-label="تولید مجدد پاسخ"
                    title="تولید مجدد پاسخ"
                  >
                    <RotateCcw size={16} />
                    <span>تولید مجدد</span>
                  </button>
                )}
              </>
            )}
          </div>
        )}

{!message.error && !isUser && message.chart && (
  <ChatResponseChart chart={message.chart} />
)}

        {!message.error && hasTable && message.response?.table && (
          <ResultTable
            table={message.response.table}
            metadata={message.response.metadata}
          />
        )}

        {!message.error && message.response?.sql && (
          <details className="sql-details">
            <summary>مشاهده SQL تولیدشده</summary>
            <pre>{message.response.sql}</pre>
          </details>
        )}
      </div>
    </article>
  );
}