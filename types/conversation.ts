import type { Timestamp } from "firebase/firestore";

export interface Conversation {
  id: string;
  type: "direct";
  participantIds: string[];
  participantMap: Record<string, true>;
  lastMessage?: string;
  lastMessageType?: "text" | "call";
  lastMessageAt?: Timestamp;
  unreadFor?: Record<string, number>;
  typing?: Record<string, number>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
