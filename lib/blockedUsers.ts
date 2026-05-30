import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

export async function blockUser(
  blockerUid: string,
  blockedUid: string
): Promise<void> {
  const batch = writeBatch(db);
  batch.set(doc(db, "users", blockerUid, "blockedUsers", blockedUid), {
    uid: blockedUid,
    blockedAt: serverTimestamp(),
  });
  batch.set(doc(db, "users", blockedUid, "blockedByUsers", blockerUid), {
    uid: blockerUid,
    blockedAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function unblockUser(
  blockerUid: string,
  blockedUid: string
): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(doc(db, "users", blockerUid, "blockedUsers", blockedUid));
  batch.delete(doc(db, "users", blockedUid, "blockedByUsers", blockerUid));
  await batch.commit();
}

export function subscribeBlockedUsers(
  uid: string,
  cb: (blockedUids: Set<string>) => void
): () => void {
  return onSnapshot(collection(db, "users", uid, "blockedUsers"), (snap) => {
    cb(new Set(snap.docs.map((d) => d.id)));
  });
}

export function subscribeBlockedByUsers(
  uid: string,
  cb: (blockedByUids: Set<string>) => void
): () => void {
  return onSnapshot(collection(db, "users", uid, "blockedByUsers"), (snap) => {
    cb(new Set(snap.docs.map((d) => d.id)));
  });
}
