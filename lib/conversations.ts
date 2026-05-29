import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Conversation } from "@/types/conversation";

export function getConversationId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join("_");
}

export async function getOrCreateConversation(
  uid1: string,
  uid2: string
): Promise<Conversation> {
  const conversationId = getConversationId(uid1, uid2);
  const ref = doc(db, "conversations", conversationId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return { id: snap.id, ...(snap.data() as Omit<Conversation, "id">) };
  }

  const participantIds = [uid1, uid2].sort();
  const participantMap = Object.fromEntries(
    participantIds.map((uid) => [uid, true])
  ) as Record<string, true>;

  await setDoc(ref, {
    id: conversationId,
    type: "direct",
    participantIds,
    participantMap,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const newSnap = await getDoc(ref);
  return { id: newSnap.id, ...(newSnap.data() as Omit<Conversation, "id">) };
}

export function subscribeConversations(
  uid: string,
  cb: (conversations: Conversation[]) => void
): () => void {
  const q = query(
    collection(db, "conversations"),
    where("participantIds", "array-contains", uid)
  );

  return onSnapshot(q, (snap) => {
    const conversations = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Conversation, "id">),
    }));

    conversations.sort((a, b) => {
      const aTime =
        a.lastMessageAt?.toMillis() ?? a.createdAt?.toMillis() ?? 0;
      const bTime =
        b.lastMessageAt?.toMillis() ?? b.createdAt?.toMillis() ?? 0;
      return bTime - aTime;
    });

    cb(conversations);
  });
}
