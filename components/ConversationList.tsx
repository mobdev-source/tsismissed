"use client";

import { Users } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { getConversationId } from "@/lib/conversations";
import type { Contact } from "@/types/contact";
import type { Conversation } from "@/types/conversation";
import type { Timestamp } from "firebase/firestore";

interface ConversationListProps {
  contacts: Contact[];
  conversationMap: Map<string, Conversation>;
  selectedConversationId: string | null;
  currentUid: string;
  onSelect: (contact: Contact) => void;
}

function formatPreviewTime(timestamp: Timestamp | null | undefined): string {
  if (!timestamp) return "";
  try {
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays < 1 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function ConversationList({
  contacts,
  conversationMap,
  selectedConversationId,
  currentUid,
  onSelect,
}: ConversationListProps) {
  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <Users size={40} className="text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-500">No contacts yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Search for people above to add them.
        </p>
      </div>
    );
  }

  const sorted = [...contacts].sort((a, b) => {
    const convA = conversationMap.get(getConversationId(currentUid, a.uid));
    const convB = conversationMap.get(getConversationId(currentUid, b.uid));
    const aTime =
      convA?.lastMessageAt?.toMillis() ??
      convA?.createdAt?.toMillis() ??
      a.addedAt?.toMillis() ??
      0;
    const bTime =
      convB?.lastMessageAt?.toMillis() ??
      convB?.createdAt?.toMillis() ??
      b.addedAt?.toMillis() ??
      0;
    return bTime - aTime;
  });

  return (
    <ul>
      {sorted.map((contact) => {
        const conversationId = getConversationId(currentUid, contact.uid);
        const conversation = conversationMap.get(conversationId);
        const isSelected = selectedConversationId === conversationId;

        const subtitle =
          conversation?.lastMessage?.trim() ||
          contact.bio?.trim() ||
          contact.email;

        const previewTime = formatPreviewTime(conversation?.lastMessageAt);

        return (
          <li
            key={contact.uid}
            onClick={() => onSelect(contact)}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
              isSelected
                ? "bg-blue-50 border-r-2 border-blue-600"
                : "hover:bg-gray-50"
            }`}
          >
            <UserAvatar
              displayName={contact.displayName}
              photoURL={contact.photoURL}
              size={40}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {contact.displayName}
                </p>
                {previewTime && (
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {previewTime}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{subtitle}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
