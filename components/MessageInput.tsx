"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { Send, Smile } from "lucide-react";
import { sendMessage } from "@/lib/messages";
import { setTyping, clearTyping } from "@/lib/typing";

const QUICK_EMOJI = [
  "😂","😭","😍","🥰","😊","🤣","😅","😆","🥺","😢",
  "😩","🔥","❤️","💕","💖","👍","🙌","😎","🤔","😤",
  "😏","🥳","🤩","😱","🙈","💀","🫶","✨","💯","🤙",
];

interface MessageInputProps {
  conversationId: string;
  senderId: string;
  receiverId: string;
  disabled?: boolean;
}

export function MessageInput({
  conversationId,
  senderId,
  receiverId,
  disabled = false,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPanelRef = useRef<HTMLDivElement>(null);

  // Typing indicator refs — throttle writes to Firestore
  const lastTypingSentAt = useRef(0);
  const typingClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup typing state when conversation changes or component unmounts
  useEffect(() => {
    return () => {
      if (typingClearRef.current) clearTimeout(typingClearRef.current);
      clearTyping(conversationId, senderId).catch(() => {});
    };
  }, [conversationId, senderId]);

  // Close emoji panel on outside click
  useEffect(() => {
    if (!showEmoji) return;
    function handleClick(e: MouseEvent) {
      if (emojiPanelRef.current && !emojiPanelRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showEmoji]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (disabled) return;
    setText(e.target.value);

    const now = Date.now();
    // Throttle: only write typing to Firestore every 2s
    if (now - lastTypingSentAt.current > 2000) {
      lastTypingSentAt.current = now;
      setTyping(conversationId, senderId).catch(() => {});
    }

    // Auto-clear after 3s of no typing
    if (typingClearRef.current) clearTimeout(typingClearRef.current);
    typingClearRef.current = setTimeout(() => {
      clearTyping(conversationId, senderId).catch(() => {});
      lastTypingSentAt.current = 0;
    }, 3000);
  }

  function handleBlur() {
    if (typingClearRef.current) clearTimeout(typingClearRef.current);
    clearTyping(conversationId, senderId).catch(() => {});
    lastTypingSentAt.current = 0;
  }

  async function handleSend() {
    if (disabled) return;
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    // Clear typing state immediately on send
    if (typingClearRef.current) clearTimeout(typingClearRef.current);
    clearTyping(conversationId, senderId).catch(() => {});
    lastTypingSentAt.current = 0;

    setSending(true);
    setError(null);

    try {
      await sendMessage(conversationId, senderId, receiverId, trimmed);
      setText("");
      textareaRef.current?.focus();
    } catch {
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function insertEmoji(emoji: string) {
    const el = textareaRef.current;
    if (!el) {
      setText((t) => t + emoji);
      return;
    }
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    const next = text.slice(0, start) + emoji + text.slice(end);
    setText(next);
    // Restore cursor after emoji
    requestAnimationFrame(() => {
      el.selectionStart = start + emoji.length;
      el.selectionEnd = start + emoji.length;
      el.focus();
    });
    setShowEmoji(false);
  }

  if (disabled) {
    return (
      <div className="shrink-0 border-t border-tsismis-border bg-tsismis-sidebar px-4 py-3">
        <p className="text-xs text-tsismis-muted text-center select-none">
          You can&apos;t message this person.
        </p>
      </div>
    );
  }

  return (
    <div className="shrink-0 border-t border-tsismis-border bg-tsismis-sidebar p-4 transition-all duration-150">
      {error && (
        <p className="text-xs text-red-400 mb-2 font-medium">{error}</p>
      )}
      <div className="flex items-end gap-2.5 relative">
        {/* Emoji panel */}
        {showEmoji && (
          <div
            ref={emojiPanelRef}
            className="absolute bottom-full mb-2 left-0 z-20 bg-tsismis-surface border border-tsismis-border rounded-2xl shadow-xl p-2 grid grid-cols-10 gap-0.5 w-[280px] animate-in fade-in zoom-in-95 duration-150"
          >
            {QUICK_EMOJI.map((emoji) => (
              <button
                key={emoji}
                onClick={() => insertEmoji(emoji)}
                className="text-lg p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer leading-none"
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Emoji toggle button */}
        <button
          type="button"
          onClick={() => setShowEmoji((v) => !v)}
          title="Emoji"
          className={`p-2 rounded-full transition-all cursor-pointer shrink-0 ${
            showEmoji
              ? "text-tsismis-pink bg-tsismis-pink/10"
              : "text-tsismis-muted hover:text-tsismis-text hover:bg-white/5"
          }`}
        >
          <Smile size={18} />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Mag-type ng tsismis..."
          rows={1}
          className="flex-1 resize-none rounded-xl border border-tsismis-border bg-tsismis-surface px-4 py-2.5 text-sm text-tsismis-text placeholder:text-tsismis-hint outline-none focus:border-tsismis-pink focus:ring-1 focus:ring-tsismis-pink/30 transition-all max-h-32 overflow-y-auto"
          style={{ lineHeight: "1.5" }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="p-2.5 rounded-full bg-tsismis-gradient text-white hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center cursor-pointer shadow-md shadow-tsismis-pink/10"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
