import type { Timestamp } from "firebase/firestore";

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  type: "text" | "call";
  text?: string;
  callType?: "audio" | "video";
  callUrl?: string;
  roomName?: string;
  createdAt: Timestamp;
  readBy?: string[];
}
