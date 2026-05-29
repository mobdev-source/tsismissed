"use client";

import { Phone, Video } from "lucide-react";
import type { CallType } from "@/lib/callProvider";

interface CallButtonProps {
  callType: CallType;
  onClick: (callType: CallType) => void;
  disabled?: boolean;
}

export function CallButton({ callType, onClick, disabled }: CallButtonProps) {
  return (
    <button
      onClick={() => onClick(callType)}
      disabled={disabled}
      title={callType === "audio" ? "Start audio call" : "Start video call"}
      className="p-1.5 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {callType === "audio" ? <Phone size={18} /> : <Video size={18} />}
    </button>
  );
}
