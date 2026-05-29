"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import { MessageBubble } from "@/components/MessageBubble";
import { subscribeMessages, markMessagesAsRead } from "@/lib/messages";
import type { Message } from "@/types/message";
import type { CallType } from "@/lib/callProvider";

interface MessageListProps {
  conversationId: string;
  currentUid: string;
  otherUid: string;
  onJoinCall?: (callUrl: string, callType: CallType) => void;
}

export function MessageList({
  conversationId,
  currentUid,
  otherUid,
  onJoinCall,
}: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setMessages([]);

    const unsub = subscribeMessages(conversationId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
    });

    return unsub;
  }, [conversationId]);

  useEffect(() => {
    if (messages.length === 0) return;
    bottomRef.current?.scrollIntoView();
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) return;
    markMessagesAsRead(conversationId, messages, currentUid).catch(() => {});
  }, [messages, conversationId, currentUid]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={24} className="text-gray-300 animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <MessageSquare size={40} className="text-gray-200 mb-3" />
        <p className="text-sm font-medium text-gray-500">No messages yet</p>
        <p className="text-xs text-gray-400 mt-1">Say hi! Send the first message.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isOwn={msg.senderId === currentUid}
          otherUid={otherUid}
          onJoinCall={onJoinCall}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
