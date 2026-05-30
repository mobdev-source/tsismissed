import type { Timestamp } from "firebase/firestore";

export interface BlockedUser {
  uid: string;
  blockedAt: Timestamp;
}
