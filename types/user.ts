import type { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  displayName: string;
  displayNameLower: string;
  email: string;
  emailLower: string;
  photoURL?: string;
  avatarPublicId?: string;
  initials?: string;
  bio?: string;
  status: "online" | "offline";
  lastActiveAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
