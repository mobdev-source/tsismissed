import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { UserProfile } from "@/types/user";
import type { Contact } from "@/types/contact";

export async function searchUsers(
  term: string,
  currentUid: string
): Promise<UserProfile[]> {
  if (!term.trim()) return [];

  const lower = term.toLowerCase();
  const q = query(
    collection(db, "users"),
    where("displayNameLower", ">=", lower),
    where("displayNameLower", "<=", lower + ""),
    orderBy("displayNameLower"),
    limit(10)
  );

  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as UserProfile)
    .filter((u) => u.uid !== currentUid);
}

export async function addContact(
  currentUid: string,
  target: UserProfile
): Promise<void> {
  const ref = doc(db, "users", currentUid, "contacts", target.uid);
  await setDoc(ref, {
    uid: target.uid,
    displayName: target.displayName,
    email: target.email,
    photoURL: target.photoURL ?? "",
    bio: target.bio ?? "",
    addedAt: serverTimestamp(),
  });
}

export async function addContactByUid(
  currentUid: string,
  targetUid: string
): Promise<void> {
  const snap = await getDoc(doc(db, "users", targetUid));
  if (!snap.exists()) throw new Error("User not found");
  await addContact(currentUid, snap.data() as UserProfile);
}

export function subscribeContacts(
  uid: string,
  cb: (contacts: Contact[]) => void
): () => void {
  const q = query(
    collection(db, "users", uid, "contacts"),
    orderBy("addedAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => d.data() as Contact));
  });
}
