import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Message } from "@/types/message";

export function subscribeMessages(
  conversationId: string,
  cb: (messages: Message[]) => void
): () => void {
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("createdAt", "asc"),
    limit(100)
  );

  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Message, "id">),
    }));
    cb(messages);
  });
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  text: string
): Promise<void> {
  const trimmed = text.trim();

  await addDoc(
    collection(db, "conversations", conversationId, "messages"),
    {
      senderId,
      receiverId,
      type: "text",
      text: trimmed,
      createdAt: serverTimestamp(),
      readBy: [senderId],
    }
  );

  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: trimmed,
    lastMessageType: "text",
    lastMessageAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function subscribeLatestMessages(
  conversationId: string,
  cb: (messages: Message[]) => void
): () => void {
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("createdAt", "desc"),
    limit(5)
  );
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Message, "id">),
    }));
    cb(messages);
  });
}

export async function markMessagesAsRead(
  conversationId: string,
  messages: Message[],
  currentUid: string
): Promise<void> {
  const unread = messages.filter(
    (m) =>
      m.senderId !== currentUid && !m.readBy?.includes(currentUid)
  );

  if (unread.length === 0) return;

  const batch = writeBatch(db);
  for (const msg of unread) {
    const ref = doc(
      db,
      "conversations",
      conversationId,
      "messages",
      msg.id
    );
    batch.update(ref, { readBy: arrayUnion(currentUid) });
  }
  await batch.commit();
}
