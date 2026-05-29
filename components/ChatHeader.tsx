"use client";

import { ArrowLeft } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { CallButton } from "@/components/CallButton";
import type { Contact } from "@/types/contact";
import type { CallType } from "@/lib/callProvider";

interface ChatHeaderProps {
  contact: Contact;
  onBack: () => void;
  onStartCall: (callType: CallType) => void;
}

export function ChatHeader({ contact, onBack, onStartCall }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white shrink-0">
      <button
        onClick={onBack}
        className="md:hidden p-1 -ml-1 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
        aria-label="Back to contacts"
      >
        <ArrowLeft size={20} />
      </button>
      <UserAvatar
        displayName={contact.displayName}
        photoURL={contact.photoURL}
        size={36}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {contact.displayName}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <CallButton callType="audio" onClick={onStartCall} />
        <CallButton callType="video" onClick={onStartCall} />
      </div>
    </div>
  );
}
