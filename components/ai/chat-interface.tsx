"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AiChatProps {
  projectId: string;
  phase: string;
  phaseLabel: string;
  phaseIcon: string;
  initialMessages?: ChatMessage[];
  onOutputDetected?: (json: Record<string, unknown>) => void;
  outputLabel?: string;
}

export function AiChat({
  projectId,
  phase,
  phaseLabel,
  phaseIcon,
  initialMessages = [],
  onOutputDetected,
  outputLabel,
}: AiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [detectedOutput, setDetectedOutput] = useState<Record<string, unknown> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  // Auto-start: if no messages, fire the first AI message
  useEffect(() => {
    if (initialMessages.length === 0 && messages.length === 0) {
      sendMessage("", true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const extractJson = useCallback((text: string): Record<string, unknown> | null => {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (!match) return null;
    try {
      return JSON.parse(match[1].trim());
    } catch {
      return null;
    }
  }, []);

  async function sendMessage(userText: string, isAuto = false) {
    if (streaming) return;
    if (!isAuto && !userText.trim()) return;

    const userMsg: ChatMessage = { role: "user", content: userText };
    const newMessages = isAuto ? messages : [...messages, userMsg];

    if (!isAuto) {
      setMessages(newMessages);
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }

    setStreaming(true);
    setStreamingText("");

    try {
      const res = await fetch(`/api/ai/${phase}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, messages: newMessages }),
      });

      if (!res.ok) throw new Error(await res.text());

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.text) {
              full += data.text;
              setStreamingText(full);
            }
            if (data.done || data.error) break;
          } catch {
            // ignore parse errors on partial chunks
          }
        }
      }

      const assistantMsg: ChatMessage = { role: "assistant", content: full };
      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);
      setStreamingText("");

      // Check for JSON output in the response
      const json = extractJson(full);
      if (json) {
        setDetectedOutput(json);
        onOutputDetected?.(json);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: "var(--border)" }}
      >
        <span className="text-2xl">{phaseIcon}</span>
        <div>
          <p className="font-semibold">{phaseLabel}</p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            AI-powered assistant
          </p>
        </div>
        {streaming && (
          <Badge variant="warning" className="ml-auto text-xs">
            Thinking…
          </Badge>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {streamingText && (
          <MessageBubble
            message={{ role: "assistant", content: streamingText }}
            streaming
          />
        )}
        {messages.length === 0 && !streamingText && !streaming && (
          <div className="text-center py-12" style={{ color: "var(--muted-foreground)" }}>
            <div className="text-4xl mb-3">{phaseIcon}</div>
            <p className="text-sm">Starting session…</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Detected output panel */}
      {detectedOutput && onOutputDetected && (
        <div
          className="mx-4 mb-3 rounded-lg p-3 text-sm border"
          style={{
            background: "var(--primary-light, #fef3c7)",
            borderColor: "var(--primary)",
            color: "var(--primary-deep, #78350f)",
          }}
        >
          <p className="font-semibold mb-1">
            ✅ {outputLabel ?? "Output"} ready
          </p>
          <p className="text-xs opacity-75">
            The AI has generated structured data. It has been saved to your project.
          </p>
        </div>
      )}

      {/* Input */}
      <div
        className="p-4 border-t flex-shrink-0"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="flex gap-2 rounded-xl border p-2"
          style={{ borderColor: "var(--border)", background: "var(--background)" }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type your message… (Enter to send)"
            rows={1}
            disabled={streaming}
            className="flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed px-1 py-1 disabled:opacity-50"
            style={{ color: "var(--foreground)", minHeight: 36, maxHeight: 160 }}
          />
          <Button
            size="sm"
            onClick={() => sendMessage(input)}
            loading={streaming}
            disabled={!input.trim() || streaming}
            className="self-end"
          >
            Send
          </Button>
        </div>
        <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)" }}>
          Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  streaming,
}: {
  message: ChatMessage;
  streaming?: boolean;
}) {
  const isUser = message.role === "user";

  // Render markdown-ish: code blocks, bold, lists
  const rendered = renderContent(message.content);

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5"
          style={{ background: "var(--primary)", color: "white" }}
        >
          AI
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-sm text-white"
            : "rounded-tl-sm border",
          streaming && "after:content-['▋'] after:animate-pulse after:ml-0.5"
        )}
        style={
          isUser
            ? { background: "var(--primary)" }
            : { background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }
        }
        dangerouslySetInnerHTML={{ __html: rendered }}
      />
      {isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5"
          style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
        >
          You
        </div>
      )}
    </div>
  );
}

function renderContent(text: string): string {
  // Escape HTML first
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks
  html = html.replace(
    /```(?:json|typescript|javascript|bash|)?\n?([\s\S]*?)```/g,
    '<pre class="mt-2 mb-2 p-3 rounded-lg text-xs overflow-x-auto" style="background:rgba(0,0,0,0.08);white-space:pre-wrap;word-break:break-word"><code>$1</code></pre>'
  );

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Bullet lists
  html = html.replace(/^[-*]\s+(.+)$/gm, "<li class='ml-4 list-disc'>$1</li>");
  html = html.replace(/(<li[\s\S]*?<\/li>)/g, "<ul class='my-1'>$1</ul>");

  // Numbered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, "<li class='ml-4 list-decimal'>$1</li>");

  // Line breaks
  html = html.replace(/\n{2,}/g, "</p><p class='mt-2'>");
  html = html.replace(/\n/g, "<br>");

  return `<p>${html}</p>`;
}
