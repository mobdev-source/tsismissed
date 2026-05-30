"use client";

import { useState } from "react";
import { Clock, MessageCircle, UserPlus } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import type { UserProfile } from "@/types/user";

export type SearchResultStatus = "contact" | "pending" | "declined" | "none";

interface SearchResultItemProps {
  user: UserProfile;
  status: SearchResultStatus;
  onSendRequest: () => Promise<void>;
  onOpen?: () => void;
}

export function SearchResultItem({ user, status, onSendRequest, onOpen }: SearchResultItemProps) {
  const [sending, setSending] = useState(false);

  async function handleSend() {
    setSending(true);
    try {
      await onSendRequest();
    } finally {
      setSending(false);
    }
  }

  const subtitle = user.bio?.trim() || user.email;
  const isContact = status === "contact";

  function renderAction() {
    if (isContact) {
      return (
        <button
          type="button"
          onClick={onOpen}
          className="shrink-0 flex items-center gap-1.5 text-xs font-semibold bg-transparent border border-tsismis-border text-tsismis-muted rounded-full px-4 py-1.5 hover:border-tsismis-pink hover:text-tsismis-pink hover:bg-tsismis-pink/10 transition-all active:scale-[0.97] cursor-pointer"
        >
          <MessageCircle size={13} />
          Message
        </button>
      );
    }
    if (status === "pending") {
      return (
        <span className="flex items-center gap-1 text-xs text-tsismis-muted font-semibold shrink-0 select-none">
          <Clock size={13} />
          Request Sent
        </span>
      );
    }
    const label = status === "declined" ? "Send Again" : "Add";
    return (
      <button
        onClick={handleSend}
        disabled={sending}
        className="shrink-0 flex items-center gap-1.5 text-xs font-semibold bg-transparent border border-tsismis-pink text-tsismis-pink rounded-full px-4 py-1.5 hover:bg-tsismis-pink/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.97] cursor-pointer"
      >
        <UserPlus size={13} />
        {sending ? "Sending…" : label}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 transition-all duration-150 rounded-xl mx-2 my-0.5 border border-transparent hover:bg-white/5 hover:border-tsismis-border">
      <UserAvatar displayName={user.displayName} photoURL={user.photoURL} size={40} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-tsismis-text truncate">{user.displayName}</p>
        <p className="text-xs text-tsismis-muted truncate mt-0.5">{subtitle}</p>
      </div>
      {renderAction()}
    </div>
  );
}
