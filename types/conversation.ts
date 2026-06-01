import type { Timestamp } from "firebase/firestore";

export interface ParticipantInfo {
  displayName: string;
  photoURL?: string;
}

export interface Conversation {
  id: string;
  type: "direct" | "group";
  name?: string;
  createdBy?: string;
  // Group avatar (optional). Falls back to a generated group icon when absent.
  photoURL?: string;
  avatarPublicId?: string;
  participantIds: string[];
  participantMap: Record<string, true>;
  // Cached member display names/avatars, captured at group creation so the UI
  // can render sender identity instantly without waiting on per-member fetches.
  participantInfo?: Record<string, ParticipantInfo>;
  lastMessage?: string;
  lastMessageType?: "text" | "call";
  lastMessageAt?: Timestamp;
  unreadFor?: Record<string, number>;
  typing?: Record<string, number>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
