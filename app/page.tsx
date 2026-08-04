"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatApiResponse = {
  answer?: string;
  error?: string;
};

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    content:
        "Hi!!! 👋\nI'm Richard AI 🤖\nAsk me anything about Richard!!!",
  },
];

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] =
      useState<ChatMessage[]>(initialMessages);

  const [isThinking, setIsThinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const isBusy = isThinking || isTyping;

  useEffect(() => {
    const chatContainer = chatContainerRef.current;

    if (!chatContainer || isTyping) {
      return;
    }

    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, isThinking, isTyping]);

  async function typeAssistantMessage(fullText: string) {
    setIsTyping(true);

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        role: "assistant",
        content: "",
      },
    ]);

    for (let index = 1; index <= fullText.length; index += 1) {
      await wait(10);

      setMessages((currentMessages) => {
        const updatedMessages = [...currentMessages];
        const lastMessageIndex = updatedMessages.length - 1;

        updatedMessages[lastMessageIndex] = {
          role: "assistant",
          content: fullText.slice(0, index),
        };

        return updatedMessages;
      });
    }

    setIsTyping(false);
  }

  async function sendMessage() {
    const cleanedMessage = message.trim();

    if (!cleanedMessage || isBusy) {
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: cleanedMessage,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setMessage("");
    setIsThinking(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      const responseText = await response.text();

      let data: ChatApiResponse;

      try {
        data = JSON.parse(responseText) as ChatApiResponse;
      } catch {
        data = {
          error: "The chat server returned an invalid response.",
        };
      }

      setIsThinking(false);

      if (!response.ok || !data.answer) {
        await typeAssistantMessage(
            data.error ??
            "Sorry!!! I couldn't answer that right now 😭",
        );

        return;
      }

      await typeAssistantMessage(data.answer);
    } catch (error) {
      console.error("Chat request failed:", error);

      setIsThinking(false);

      await typeAssistantMessage(
          "Sorry!!! I couldn't connect to Richard AI right now 😭 Please try again!",
      );
    }
  }

  function selectSuggestedQuestion(question: string) {
    if (isBusy) {
      return;
    }

    setMessage(question);
  }

  return (
      <main className="relative min-h-screen overflow-hidden bg-zinc-950 px-4 py-8 text-white sm:px-6">
        {/* Background glow */}
        <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />

        <div className="pointer-events-none absolute bottom-[-200px] right-[-150px] h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[120px]" />

        <section className="relative mx-auto w-full max-w-4xl pt-4 sm:pt-6">
          {/* Header */}
          <header className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-4xl shadow-2xl backdrop-blur">
              🤖
            </div>

            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              Let&apos;s Get to Know Richard!!!
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
              Curious about Richard?
              <br />
              Ask about his education, career, projects, personality,
              daily habits, goals, or literally anything!!!
            </p>
          </header>

          {/* Chat */}
          <section className="mt-9 rounded-3xl border border-white/10 bg-zinc-900/60 p-3 shadow-2xl backdrop-blur-xl sm:p-4">
            {/* Messages */}
            <div
                ref={chatContainerRef}
                className="max-h-[460px] min-h-80 space-y-6 overflow-y-auto rounded-2xl border border-white/5 bg-black/30 p-4 sm:p-5"
            >
              {messages.map((chatMessage, index) => {
                const isUser = chatMessage.role === "user";
                const isLastMessage = index === messages.length - 1;

                const showTypingCursor =
                    isTyping && !isUser && isLastMessage;

                return (
                    <div
                        key={`${chatMessage.role}-${index}`}
                        className={`flex gap-3 ${
                            isUser
                                ? "flex-row-reverse"
                                : "flex-row"
                        }`}
                    >
                      {/* Avatar */}
                      <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-lg ${
                              isUser
                                  ? "border-blue-400/20 bg-blue-500/20"
                                  : "border-white/10 bg-zinc-800"
                          }`}
                      >
                        {isUser ? "👤" : "🤖"}
                      </div>

                      {/* Name + bubble */}
                      <div
                          className={`flex max-w-[82%] flex-col ${
                              isUser ? "items-end" : "items-start"
                          }`}
                      >
                    <span className="mb-1 px-1 text-xs font-medium text-zinc-500">
                      {isUser ? "You" : "Richard AI"}
                    </span>

                        <div
                            className={`whitespace-pre-wrap rounded-2xl px-5 py-3 text-sm leading-7 shadow-lg sm:text-base ${
                                isUser
                                    ? "rounded-tr-md bg-blue-600 text-white"
                                    : "rounded-tl-md border border-white/5 bg-zinc-800 text-zinc-100"
                            }`}
                        >
                          {chatMessage.content}

                          {showTypingCursor && (
                              <span className="ml-1 animate-pulse">
                          ▋
                        </span>
                          )}
                        </div>
                      </div>
                    </div>
                );
              })}

              {/* Thinking */}
              {isThinking && (
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-zinc-800 text-lg">
                      🤖
                    </div>

                    <div className="flex flex-col items-start">
                  <span className="mb-1 px-1 text-xs font-medium text-zinc-500">
                    Richard AI
                  </span>

                      <div className="rounded-2xl rounded-tl-md border border-white/5 bg-zinc-800 px-5 py-3 text-zinc-300">
                    <span className="mr-2">
                      Thinking
                    </span>

                        <span className="inline-flex gap-1">
                      <span className="animate-bounce">•</span>
                      <span className="animate-bounce [animation-delay:150ms]">
                        •
                      </span>
                      <span className="animate-bounce [animation-delay:300ms]">
                        •
                      </span>
                    </span>
                      </div>
                    </div>
                  </div>
              )}
              
            </div>

            {/* Input */}
            <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/30 p-2 sm:flex-row sm:items-end">
            <textarea
                value={message}
                onChange={(event) =>
                    setMessage(event.target.value)
                }
                onKeyDown={(event) => {
                  if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                disabled={isBusy}
                rows={1}
                placeholder="Ask anything about Richard..."
                aria-label="Ask Richard a question"
                className="max-h-32 min-h-12 flex-1 resize-none bg-transparent px-4 py-3 text-base text-white outline-none placeholder:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-60"
            />

              <button
                  type="button"
                  onClick={() => void sendMessage()}
                  disabled={!message.trim() || isBusy}
                  className="min-h-12 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.03] hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 sm:text-base"
              >
                {isThinking
                    ? "Thinking..."
                    : isTyping
                        ? "Typing..."
                        : "Ask Richard"}
              </button>
            </div>
          </section>

          {/* Suggested questions */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {[
              {
                icon: "👤",
                label: "Who is Richard?",
                question: "Who is Richard?",
              },
              {
                icon: "💻",
                label: "His projects",
                question: "What are Richard's projects?",
              },
              {
                icon: "😆",
                label: "His personality",
                question: "What is Richard like?",
              },
              {
                icon: "🎵",
                label: "His favorite music",
                question: "What music does Richard like?",
              },
            ].map((suggestion) => (
                <button
                    key={suggestion.label}
                    type="button"
                    onClick={() =>
                        selectSuggestedQuestion(
                            suggestion.question,
                        )
                    }
                    disabled={isBusy}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
              <span className="mr-2">
                {suggestion.icon}
              </span>
                  {suggestion.label}
                </button>
            ))}
          </div>

          {/* Footer */}
          <footer className="mt-7 text-center text-sm text-zinc-600">
            Richard AI — More Than Just a Chatbot
          </footer>
        </section>
      </main>
  );
}