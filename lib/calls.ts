import {
  addDoc,
  collection,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { CallType } from "@/lib/callProvider";

export async function sendCallMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  callType: CallType,
  callUrl: string,
  roomName: string
): Promise<void> {
  await addDoc(
    collection(db, "conversations", conversationId, "messages"),
    {
      senderId,
      receiverId,
      type: "call",
      callType,
      callUrl,
      roomName,
      createdAt: serverTimestamp(),
      readBy: [senderId],
    }
  );

  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: callType === "audio" ? "Audio call" : "Video call",
    lastMessageType: "call",
    lastMessageAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
