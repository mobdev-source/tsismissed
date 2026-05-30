import type { Timestamp } from "firebase/firestore";

export type ContactRequestStatus = "pending" | "declined";

export interface ContactRequest {
  fromUid: string;
  fromDisplayName: string;
  fromEmail: string;
  fromPhotoURL?: string;
  fromBio?: string;
  status: ContactRequestStatus;
  createdAt: Timestamp;
}
