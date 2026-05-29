"use client";

import { Phone, Video } from "lucide-react";
import type { Timestamp } from "firebase/firestore";
import type { Message } from "@/types/message";
import type { CallType } from "@/lib/callProvider";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  otherUid: string;
  onJoinCall?: (callUrl: string, callType: CallType) => void;
}

function formatTime(timestamp: Timestamp | null | undefined): string {
  if (!timestamp) return "";
  try {
    return timestamp.toDate().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function CallIcon({ callType }: { callType: CallType }) {
  return callType === "audio" ? (
    <Phone size={14} className="shrink-0" />
  ) : (
    <Video size={14} className="shrink-0" />
  );
}

export function MessageBubble({ message, isOwn, otherUid, onJoinCall }: MessageBubbleProps) {
  const time = formatTime(message.createdAt);

  if (message.type === "call") {
    const callType = message.callType ?? "audio";
    const label = callType === "audio" ? "Audio call" : "Video call";

    if (isOwn) {
      return (
        <div className="flex flex-col items-end mb-1">
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl rounded-br-sm bg-blue-600 text-white text-sm">
            <CallIcon callType={callType} />
            <span>{label}</span>
          </div>
          {time && (
            <span className="text-[10px] text-gray-400 mt-0.5 px-1">{time}</span>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-start mb-1">
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl rounded-bl-sm bg-gray-100 text-gray-900 text-sm">
          <CallIcon callType={callType} />
          <span>{label}</span>
          {message.callUrl && onJoinCall && (
            <button
              onClick={() => onJoinCall(message.callUrl!, callType)}
              className="ml-1 px-2.5 py-0.5 text-xs font-medium bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
            >
              Join
            </button>
          )}
        </div>
        {time && (
          <span className="text-[10px] text-gray-400 mt-0.5 px-1">{time}</span>
        )}
      </div>
    );
  }

  // Text message
  const isSeen = message.readBy?.includes(otherUid) ?? false;
  const receipt = isSeen ? "Seen" : "Sent";

  if (isOwn) {
    return (
      <div className="flex flex-col items-end mb-1">
        <div className="max-w-[70%] px-3 py-2 rounded-2xl rounded-br-sm bg-blue-600 text-white text-sm leading-relaxed">
          {message.text}
        </div>
        <div className="flex items-center gap-1 mt-0.5 px-1">
          {time && (
            <span className="text-[10px] text-gray-400">{time}</span>
          )}
          <span className="text-[10px] text-gray-400">{receipt}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start mb-1">
      <div className="max-w-[70%] px-3 py-2 rounded-2xl rounded-bl-sm bg-gray-100 text-gray-900 text-sm leading-relaxed">
        {message.text}
      </div>
      {time && (
        <span className="text-[10px] text-gray-400 mt-0.5 px-1">{time}</span>
      )}
    </div>
  );
}
