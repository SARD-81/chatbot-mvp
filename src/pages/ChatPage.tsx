import { useEffect, useRef, useState } from 'react';
import { Bot, LogOut, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { ChatInput } from '../components/ChatInput';
import { ChatMessageBubble } from '../components/ChatMessageBubble';
// import { FileUpload } from '../components/FileUpload';
import { useSystem } from '../contexts/SystemContext';
import { sendChatMessage } from '../lib/api';
import type { ChatMessage } from '../types/chat';
import { buildChartForPromptResponse } from '../utils/chatCharts';
import { getUserFriendlyErrorMessage, logErrorForDebug } from '../utils/errorMessages';
import { logout } from '../utils/storage';

export function ChatPage() {
  const navigate = useNavigate();
  const { activeSystem } = useSystem();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const hasMessages = messages.length > 0;
  const hasSuggestedPrompts = activeSystem.suggestedPrompts.length > 0;

  useEffect(() => {
    document.title = `${activeSystem.name} | چت`;
  }, [activeSystem.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending]);

  function handleLogout() {
    logout();
    navigate('/systems', { replace: true });
  }

  function handleChangeSystem() {
    navigate('/systems', { replace: true });
  }

  async function submitMessage(userText: string) {
    if (!userText.trim() || isSending) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: userText,
      createdAt: new Date(),
    };

    setMessages((previousMessages) => [...previousMessages, userMessage]);
    setIsSending(true);

    try {
      const response = await sendChatMessage(userText, activeSystem);
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response.answer || 'پاسخی دریافت نشد.',
        createdAt: new Date(),
        response,
        chart: buildChartForPromptResponse(userText, response),
      };
      setMessages((previousMessages) => [...previousMessages, assistantMessage]);
    } catch (error) {
      logErrorForDebug(error, 'chat-message');
      setMessages((previousMessages) => [
        ...previousMessages,
        {
          id: uuidv4(),
          role: 'assistant',
          content: '',
          createdAt: new Date(),
          error: getUserFriendlyErrorMessage(error, 'chat'),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  async function handleSendMessage() {
    const userText = inputValue.trim();
    if (!userText || isSending) return;
    setInputValue('');
    await submitMessage(userText);
  }

  async function handleRegenerateResponse(assistantMessageId: string) {
    if (isSending) return;

    const assistantMessageIndex = messages.findIndex((message) => message.id === assistantMessageId);
    if (assistantMessageIndex <= 0) return;

    const previousUserMessage = [...messages]
      .slice(0, assistantMessageIndex)
      .reverse()
      .find((message) => message.role === 'user');

    if (!previousUserMessage) return;

    setMessages((previousMessages) =>
      previousMessages.filter(
        (message) => message.id !== assistantMessageId && message.id !== previousUserMessage.id,
      ),
    );
    await submitMessage(previousUserMessage.content);
  }

  const lastAssistantMessageId = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant' && !message.error)?.id;

  return (
    <main className={`chat-page ${activeSystem.themeClass}`}>
      <section className="chat-shell">
        <header className="chat-header">
          <div className="chat-brand">
            <div className="chat-brand-icon" aria-hidden="true">
              <img
                src={activeSystem.logoSrc}
                alt=""
                className="chat-brand-logo"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
              <Bot size={22} className="chat-brand-fallback-icon" />
            </div>
            <div className="chat-brand-copy">
              <h1>{activeSystem.name}</h1>
              <p>{activeSystem.subtitle}</p>
              <div className="chat-brand-meta" aria-label="وضعیت سامانه">
                <span className="chat-system-pill">{activeSystem.selectionTitle}</span>
                <span className="chat-status-pill">
                  <span className="chat-status-dot" aria-hidden="true" />
                  جلسه فعال
                </span>
              </div>
            </div>
          </div>

          <div className="chat-header-actions">
            {/* <FileUpload /> */}
            <button
              type="button"
              className="change-system-button chat-change-system-button"
              onClick={handleChangeSystem}
              disabled={isSending}
            >
              تغییر سامانه
            </button>
            <button className="logout-button" onClick={handleLogout}>
              <LogOut size={18} />
              خروج
            </button>
          </div>
        </header>

        <div className="chat-body">
          {!hasMessages && (
            <div className="empty-chat-state">
              <p className="empty-chat-kicker">دستیار تحلیلی سازمانی</p>
              <div className="empty-chat-icon">
                <Sparkles size={34} />
              </div>
              <h2>از {activeSystem.name} بپرسید</h2>
              <p>پرسش آماده را انتخاب کنید یا سؤال خودتان را در کادر پایین بنویسید.</p>
              {hasSuggestedPrompts && <span className="prompt-section-label">پرسش‌های پیشنهادی</span>}
              {hasSuggestedPrompts && (
                <div className="prompt-list">
                  {activeSystem.suggestedPrompts.map((prompt) => (
                    <button key={prompt} type="button" onClick={() => setInputValue(prompt)}>
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {hasMessages && (
            <div className="messages-list">
              {messages.map((message) => (
                <ChatMessageBubble
                  key={message.id}
                  message={message}
                  canRegenerate={message.role === 'assistant' && message.id === lastAssistantMessageId && !isSending}
                  onRegenerate={handleRegenerateResponse}
                />
              ))}
              {isSending && (
                <article className="message-row assistant-message">
                  <div className="message-avatar"><Bot size={18} /></div>
                  <div className="message-content">
                    <div className="message-label">دستیار</div>
                    <div className="message-bubble loading-bubble"><span /><span /><span /></div>
                  </div>
                </article>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <footer className="chat-footer">
          <ChatInput value={inputValue} disabled={isSending} onChange={setInputValue} onSubmit={handleSendMessage} />
        </footer>
      </section>
    </main>
  );
}
