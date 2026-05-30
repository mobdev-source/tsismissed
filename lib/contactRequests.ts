import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { addContactByUid } from "./contacts";
import type { ContactRequest } from "@/types/contactRequest";

export async function sendContactRequest(
  fromUid: string,
  fromDisplayName: string,
  fromEmail: string,
  fromPhotoURL: string | null | undefined,
  fromBio: string,
  toUid: string
): Promise<void> {
  const ref = doc(db, "users", toUid, "contactRequests", fromUid);
  await setDoc(ref, {
    fromUid,
    fromDisplayName,
    fromEmail,
    fromPhotoURL: fromPhotoURL ?? "",
    fromBio,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export async function getOutgoingRequestStatus(
  currentUid: string,
  targetUid: string
): Promise<"pending" | "declined" | null> {
  const ref = doc(db, "users", targetUid, "contactRequests", currentUid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return (snap.data() as ContactRequest).status;
}

export async function acceptContactRequest(
  currentUid: string,
  request: ContactRequest
): Promise<void> {
  await addContactByUid(currentUid, request.fromUid);
  await addContactByUid(request.fromUid, currentUid);
  await deleteDoc(doc(db, "users", currentUid, "contactRequests", request.fromUid));
}

export async function declineContactRequest(
  currentUid: string,
  fromUid: string
): Promise<void> {
  await updateDoc(doc(db, "users", currentUid, "contactRequests", fromUid), {
    status: "declined",
  });
}

export function subscribeIncomingRequests(
  uid: string,
  cb: (requests: ContactRequest[]) => void
): () => void {
  const q = query(
    collection(db, "users", uid, "contactRequests"),
    where("status", "==", "pending")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ ...d.data() } as ContactRequest)));
  });
}
