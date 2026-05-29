import type { Timestamp } from "firebase/firestore";

export interface Contact {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  addedAt: Timestamp;
  lastConversationId?: string;
}
