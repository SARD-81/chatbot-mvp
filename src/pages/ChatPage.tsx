import { useEffect, useRef, useState } from "react";
import {
  getUserFriendlyErrorMessage,
  logErrorForDebug,
} from "../utils/errorMessages";
import { v4 as uuidv4 } from "uuid";
import { Bot, LogOut, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChatInput } from "../components/ChatInput";
import { ChatMessageBubble } from "../components/ChatMessageBubble";
// import { FileUpload } from '../components/FileUpload';
import { sendChatMessage } from "../lib/api";
import type { ChatMessage } from "../types/chat";
import { logout } from "../utils/storage";
import { APP_NAME } from "../config/app";
import {
  AVERAGE_SCORE_BY_DATE_PROMPT,
  TOP_GROWTH_BY_RANK_PROMPT,
  RANK_SCORE_COMPARISON_SCATTER_PROMPT,
  buildChartForPromptResponse,
} from "../utils/chatCharts";

const suggestedPrompts = [
  AVERAGE_SCORE_BY_DATE_PROMPT,
  TOP_GROWTH_BY_RANK_PROMPT,
  RANK_SCORE_COMPARISON_SCATTER_PROMPT,
  "مقداری از داده‌های بارگذاری‌شده بده",
];

export function ChatPage() {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isSending]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  async function submitMessage(userText: string) {
    if (!userText.trim() || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: userText,
      createdAt: new Date(),
    };

    setMessages((previousMessages) => [...previousMessages, userMessage]);
    setIsSending(true);

    try {
      const response = await sendChatMessage(userText);
      const responseChart = buildChartForPromptResponse(userText, response);

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: response.answer || "پاسخی دریافت نشد.",
        createdAt: new Date(),
        response,
        chart: responseChart,
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        assistantMessage,
      ]);
    } catch (error) {
      logErrorForDebug(error, "chat-message");

      const assistantErrorMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: "",
        createdAt: new Date(),
        error: getUserFriendlyErrorMessage(error, "chat"),
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        assistantErrorMessage,
      ]);
    } finally {
      setIsSending(false);
    }
  }

  async function handleSendMessage() {
    const userText = inputValue.trim();

    if (!userText || isSending) {
      return;
    }

    setInputValue("");
    await submitMessage(userText);
  }

  async function handleRegenerateResponse(assistantMessageId: string) {
    if (isSending) {
      return;
    }

    const assistantMessageIndex = messages.findIndex(
      (message) => message.id === assistantMessageId
    );

    if (assistantMessageIndex <= 0) {
      return;
    }

    const previousUserMessage = [...messages]
      .slice(0, assistantMessageIndex)
      .reverse()
      .find((message) => message.role === "user");

    if (!previousUserMessage) {
      return;
    }

    const questionToRegenerate = previousUserMessage.content;

    setMessages((previousMessages) =>
      previousMessages.filter(
        (message) =>
          message.id !== assistantMessageId &&
          message.id !== previousUserMessage.id
      )
    );

    await submitMessage(questionToRegenerate);
  }

  const lastAssistantMessageId = [...messages]
    .reverse()
    .find((message) => message.role === "assistant" && !message.error)?.id;

  return (
    <main className="chat-page">
      <section className="chat-shell">
        <header className="chat-header">
          <div className="chat-brand">
            <div className="chat-brand-icon">
              <Bot size={22} />
            </div>

            <div>
              <h1>{APP_NAME}</h1>
              <p>پرسش خود را بنویسید و پاسخ تحلیلی دریافت کنید.</p>
            </div>
          </div>

          <div className="chat-header-actions">
            {/* <FileUpload /> */}

            <button className="logout-button" onClick={handleLogout}>
              <LogOut size={18} />
              خروج
            </button>
          </div>
        </header>

        <div className="chat-body">
          {!hasMessages && (
            <div className="empty-chat-state">
              <div className="empty-chat-icon">
                <Sparkles size={34} />
              </div>

              <h2>از دستیار هوشمند بپرسید</h2>
              {/* <p>
                پس از بارگذاری فایل، سؤال خود را درباره داده‌ها مطرح کنید.
              </p> */}

              <div className="prompt-list">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setInputValue(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasMessages && (
            <div className="messages-list">
              {messages.map((message) => (
                <ChatMessageBubble
                  key={message.id}
                  message={message}
                  canRegenerate={
                    message.role === "assistant" &&
                    message.id === lastAssistantMessageId &&
                    !isSending
                  }
                  onRegenerate={handleRegenerateResponse}
                />
              ))}

              {isSending && (
                <article className="message-row assistant-message">
                  <div className="message-avatar">
                    <Bot size={18} />
                  </div>

                  <div className="message-content">
                    <div className="message-label">دستیار</div>

                    <div className="message-bubble loading-bubble">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </article>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <footer className="chat-footer">
          <ChatInput
            value={inputValue}
            disabled={isSending}
            onChange={setInputValue}
            onSubmit={handleSendMessage}
          />
        </footer>
      </section>
    </main>
  );
}
