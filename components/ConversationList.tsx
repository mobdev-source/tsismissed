"use client";

import { Sparkles } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { GroupAvatar } from "@/components/GroupAvatar";
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
  onSelectGroup: (conversation: Conversation) => void;
  loading?: boolean;
}

type Row =
  | { key: string; kind: "direct"; contact: Contact; conversation?: Conversation; sortTime: number }
  | { key: string; kind: "group"; conversation: Conversation; sortTime: number };

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

function ConversationSkeleton() {
  return (
    <ul className="space-y-0.5 py-2">
      {[120, 90, 150, 80, 110].map((w, i) => (
        <li key={i} className="flex items-center gap-3 p-3 mx-2 my-0.5">
          <div className="w-10 h-10 rounded-full bg-tsismis-border/40 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className={`h-3 rounded bg-tsismis-border/40 animate-pulse`} style={{ width: w }} />
            <div className="h-2.5 rounded bg-tsismis-border/30 animate-pulse w-[60px]" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ConversationList({
  contacts,
  conversationMap,
  selectedConversationId,
  currentUid,
  onSelect,
  onSelectGroup,
  loading,
}: ConversationListProps) {
  if (loading) {
    return <ConversationSkeleton />;
  }

  const groups = [...conversationMap.values()].filter((c) => c.type === "group");

  if (contacts.length === 0 && groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center select-none">
        <Sparkles size={40} className="text-tsismis-hint mb-3 animate-pulse duration-1000" />
        <p className="text-sm font-semibold text-tsismis-muted">No tsismis yet!</p>
        <p className="text-xs text-tsismis-hint mt-1 max-w-[200px]">
          Search for friends above to start the chika.
        </p>
      </div>
    );
  }

  const rows: Row[] = [];

  for (const contact of contacts) {
    const conversation = conversationMap.get(
      getConversationId(currentUid, contact.uid)
    );
    rows.push({
      key: `direct-${contact.uid}`,
      kind: "direct",
      contact,
      conversation,
      sortTime:
        conversation?.lastMessageAt?.toMillis() ??
        conversation?.createdAt?.toMillis() ??
        contact.addedAt?.toMillis() ??
        Date.now(),
    });
  }

  for (const conversation of groups) {
    rows.push({
      key: `group-${conversation.id}`,
      kind: "group",
      conversation,
      sortTime:
        conversation.lastMessageAt?.toMillis() ??
        conversation.createdAt?.toMillis() ??
        0,
    });
  }

  rows.sort((a, b) => b.sortTime - a.sortTime);

  return (
    <ul className="space-y-0.5">
      {rows.map((row) => {
        const conversation =
          row.kind === "direct" ? row.conversation : row.conversation;
        const conversationId =
          row.kind === "direct"
            ? getConversationId(currentUid, row.contact.uid)
            : row.conversation.id;
        const isSelected = selectedConversationId === conversationId;

        const lastMessage = conversation?.lastMessage?.trim() || null;
        const previewTime = formatPreviewTime(conversation?.lastMessageAt);
        const unreadCount = conversation?.unreadFor?.[currentUid] ?? 0;

        const title =
          row.kind === "direct" ? row.contact.displayName : row.conversation.name ?? "Group";

        return (
          <li
            key={row.key}
            onClick={() =>
              row.kind === "direct"
                ? onSelect(row.contact)
                : onSelectGroup(row.conversation)
            }
            className={`flex items-center gap-3 p-3 cursor-pointer transition-all duration-150 rounded-xl mx-2 my-0.5 border ${
              isSelected
                ? "bg-active-item border-l-[3px] border-l-tsismis-pink border-y-transparent border-r-transparent"
                : "hover:bg-white/5 border-transparent hover:border-tsismis-border"
            }`}
          >
            {row.kind === "direct" ? (
              <UserAvatar
                displayName={row.contact.displayName}
                photoURL={row.contact.photoURL}
                size={40}
              />
            ) : (
              <GroupAvatar photoURL={row.conversation.photoURL} size={40} />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-1">
                <p className={`text-sm truncate ${unreadCount > 0 ? "font-bold text-tsismis-text" : "font-semibold text-tsismis-text"}`}>
                  {title}
                </p>
                <div className="flex items-center gap-1.5 shrink-0">
                  {unreadCount > 0 && (
                    <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-tsismis-gradient text-white text-[10px] font-bold leading-none">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                  {previewTime && (
                    <span className={`text-[10px] font-medium ${unreadCount > 0 ? "text-tsismis-pink" : "text-tsismis-hint"}`}>
                      {previewTime}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs truncate mt-0.5">
                {lastMessage ? (
                  <span className={unreadCount > 0 ? "text-tsismis-text font-medium" : "text-tsismis-muted"}>
                    {lastMessage}
                  </span>
                ) : (
                  <span className="text-tsismis-hint italic">
                    {row.kind === "group" ? "Say hi to the group!" : "Say hi!"}
                  </span>
                )}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
