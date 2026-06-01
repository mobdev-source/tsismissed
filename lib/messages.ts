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
  increment,
  serverTimestamp,
} from "firebase/firestore";
import type { Query, QuerySnapshot, DocumentData } from "firebase/firestore";
import { db } from "./firebase";
import type { Message } from "@/types/message";

// The messages read rule is document-independent — it only does
// get(parentConversation).participantIds — so Firestore evaluates it the moment
// we subscribe, even on an empty subcollection. Right after a conversation is
// created (always the case for a new group), that server-side get() can briefly
// miss the freshly written parent on the serving replica and return
// permission-denied, which permanently terminates the listener. We retry a few
// times with a short backoff so the listener self-heals once the parent has
// propagated, instead of dying and logging "Uncaught Error in snapshot listener".
const TRANSIENT_CODES = new Set(["permission-denied", "unavailable"]);
const MAX_RESUBSCRIBE_ATTEMPTS = 6;

function subscribeWithRetry(
  buildQuery: () => Query<DocumentData>,
  onResult: (snap: QuerySnapshot<DocumentData>) => void
): () => void {
  let unsub: () => void = () => {};
  let stopped = false;
  let attempts = 0;

  function start() {
    if (stopped) return;
    unsub = onSnapshot(
      buildQuery(),
      (snap) => {
        attempts = 0;
        onResult(snap);
      },
      (err) => {
        const code = (err as { code?: string }).code ?? "";
        if (
          !stopped &&
          TRANSIENT_CODES.has(code) &&
          attempts < MAX_RESUBSCRIBE_ATTEMPTS
        ) {
          attempts += 1;
          setTimeout(start, 300 * attempts);
        }
      }
    );
  }

  start();
  return () => {
    stopped = true;
    unsub();
  };
}

export function subscribeMessages(
  conversationId: string,
  cb: (messages: Message[]) => void
): () => void {
  // desc + limit keeps the window anchored to the newest messages so real-time
  // updates always land inside the limit. Results are reversed before delivery
  // so the UI sees oldest-first order.
  return subscribeWithRetry(
    () =>
      query(
        collection(db, "conversations", conversationId, "messages"),
        orderBy("createdAt", "desc"),
        limit(50)
      ),
    (snap) => {
      const messages = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Message, "id">) }))
        .reverse();
      cb(messages);
    }
  );
}

// Build the per-recipient unread increment map for a conversation update.
// Direct chats pass a single recipient; group chats pass all non-senders.
function unreadIncrements(recipientIds: string[]): Record<string, ReturnType<typeof increment>> {
  const updates: Record<string, ReturnType<typeof increment>> = {};
  for (const uid of recipientIds) {
    updates[`unreadFor.${uid}`] = increment(1);
  }
  return updates;
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  recipientIds: string[],
  text: string
): Promise<void> {
  const trimmed = text.trim();

  await addDoc(
    collection(db, "conversations", conversationId, "messages"),
    {
      senderId,
      // Single recipient (direct) keeps a real receiverId; groups use "".
      receiverId: recipientIds.length === 1 ? recipientIds[0] : "",
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
    ...unreadIncrements(recipientIds),
  });
}

export function subscribeLatestMessages(
  conversationId: string,
  cb: (messages: Message[]) => void
): () => void {
  return subscribeWithRetry(
    () =>
      query(
        collection(db, "conversations", conversationId, "messages"),
        orderBy("createdAt", "desc"),
        limit(5)
      ),
    (snap) => {
      const messages = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Message, "id">),
      }));
      cb(messages);
    }
  );
}

export async function sendMediaMessage(
  conversationId: string,
  senderId: string,
  recipientIds: string[],
  type: "image" | "audio",
  mediaUrl: string,
  mediaPublicId: string,
  mediaMimeType: string
): Promise<void> {
  await addDoc(
    collection(db, "conversations", conversationId, "messages"),
    {
      senderId,
      receiverId: recipientIds.length === 1 ? recipientIds[0] : "",
      type,
      mediaUrl,
      mediaPublicId,
      mediaMimeType,
      createdAt: serverTimestamp(),
      readBy: [senderId],
    }
  );

  const lastMessage = type === "image" ? "📷 Photo" : "🎵 Audio clip";

  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage,
    lastMessageType: "text",
    lastMessageAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...unreadIncrements(recipientIds),
  });
}

export async function markMessagesAsRead(
  conversationId: string,
  messages: Message[],
  currentUid: string
): Promise<void> {
  const unread = messages.filter(
    (m) => m.senderId !== currentUid && !m.readBy?.includes(currentUid)
  );

  const convRef = doc(db, "conversations", conversationId);

  if (unread.length > 0) {
    const batch = writeBatch(db);
    for (const msg of unread) {
      const ref = doc(db, "conversations", conversationId, "messages", msg.id);
      batch.update(ref, { readBy: arrayUnion(currentUid) });
    }
    await batch.commit();
  }

  // Always reset unread counter when this conversation is viewed
  await updateDoc(convRef, {
    [`unreadFor.${currentUid}`]: 0,
  });
}
