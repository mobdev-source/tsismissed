import {
  collection,
  doc,
  addDoc,
  getDoc,
  setDoc,
  updateDoc,
  arrayRemove,
  deleteField,
  increment,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { getUserDoc } from "./firestore";
import type { Conversation, ParticipantInfo } from "@/types/conversation";

export function getConversationId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join("_");
}

// "Bob", "Bob and Carol", "Bob, Carol, and Dave"
function formatNameList(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

export async function createGroupConversation(
  creatorUid: string,
  memberUids: string[],
  name: string,
  photoURL?: string,
  avatarPublicId?: string
): Promise<Conversation> {
  const otherUids = [...new Set(memberUids)].filter((uid) => uid !== creatorUid);
  const participantIds = [creatorUid, ...otherUids];
  const participantMap = Object.fromEntries(
    participantIds.map((uid) => [uid, true])
  ) as Record<string, true>;

  // Snapshot member names/avatars now so the chat UI can show sender identity
  // without a per-member fetch. Firestore rejects undefined, so omit empty photoURL.
  const profiles = await Promise.all(participantIds.map((uid) => getUserDoc(uid)));
  const participantInfo: Record<string, ParticipantInfo> = {};
  for (const p of profiles) {
    if (!p) continue;
    participantInfo[p.uid] = p.photoURL
      ? { displayName: p.displayName, photoURL: p.photoURL }
      : { displayName: p.displayName };
  }

  const ref = doc(collection(db, "conversations"));

  await setDoc(ref, {
    id: ref.id,
    type: "group",
    name: name.trim(),
    createdBy: creatorUid,
    ...(photoURL ? { photoURL } : {}),
    ...(avatarPublicId ? { avatarPublicId } : {}),
    participantIds,
    participantMap,
    participantInfo,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Seed the thread with system messages so members see who created the group
  // and who was added — and so added members get an unread badge + preview.
  const creatorName = participantInfo[creatorUid]?.displayName ?? "Someone";
  const addedNames = otherUids.map(
    (uid) => participantInfo[uid]?.displayName ?? "Someone"
  );

  const messagesCol = collection(db, "conversations", ref.id, "messages");
  await addDoc(messagesCol, {
    senderId: creatorUid,
    receiverId: "",
    type: "system",
    text: `${creatorName} created the group "${name.trim()}"`,
    createdAt: serverTimestamp(),
    readBy: [creatorUid],
  });
  const addedText =
    addedNames.length > 0
      ? `${creatorName} added ${formatNameList(addedNames)}`
      : null;
  if (addedText) {
    await addDoc(messagesCol, {
      senderId: creatorUid,
      receiverId: "",
      type: "system",
      text: addedText,
      createdAt: serverTimestamp(),
      readBy: [creatorUid],
    });
  }

  // Surface the group in every added member's sidebar with a preview + unread badge.
  const unreadIncrements: Record<string, ReturnType<typeof increment>> = {};
  for (const uid of otherUids) {
    unreadIncrements[`unreadFor.${uid}`] = increment(1);
  }
  await updateDoc(ref, {
    lastMessage: addedText ?? `${creatorName} created the group`,
    lastMessageType: "text",
    lastMessageAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...unreadIncrements,
  });

  const snap = await getDoc(ref);
  return { id: snap.id, ...(snap.data() as Omit<Conversation, "id">) };
}

export async function updateGroupAvatar(
  conversationId: string,
  photoURL: string,
  avatarPublicId: string
): Promise<void> {
  await updateDoc(doc(db, "conversations", conversationId), {
    photoURL,
    avatarPublicId,
    updatedAt: serverTimestamp(),
  });
}

export async function leaveGroup(
  conversationId: string,
  uid: string
): Promise<void> {
  await updateDoc(doc(db, "conversations", conversationId), {
    participantIds: arrayRemove(uid),
    [`participantMap.${uid}`]: deleteField(),
    [`participantInfo.${uid}`]: deleteField(),
  });
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
