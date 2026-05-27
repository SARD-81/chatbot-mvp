import { useLayoutEffect, useRef } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { SendHorizontal } from 'lucide-react';

interface ChatInputProps {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

const TEXTAREA_LINE_HEIGHT = 28;
const TEXTAREA_MIN_HEIGHT = 28;
const TEXTAREA_MAX_HEIGHT = TEXTAREA_LINE_HEIGHT * 3;

export function ChatInput({
  value,
  disabled = false,
  onChange,
  onSubmit,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';

    const nextHeight = Math.min(
      Math.max(textarea.scrollHeight, TEXTAREA_MIN_HEIGHT),
      TEXTAREA_MAX_HEIGHT,
    );

    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > TEXTAREA_MAX_HEIGHT ? 'auto' : 'hidden';
  }, [value]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!value.trim() || disabled) {
      return;
    }

    onSubmit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      if (!value.trim() || disabled) {
        return;
      }

      onSubmit();
    }
  }

  return (
    <form className="chat-composer" onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        value={value}
        disabled={disabled}
        rows={1}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="سؤال خود را درباره داده‌ها بنویسید"
      />

      <button
        className="send-button"
        type="submit"
        disabled={!value.trim() || disabled}
        aria-label="ارسال پیام"
      >
        <SendHorizontal size={24} />
      </button>
    </form>
  );
}