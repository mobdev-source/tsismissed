import { doc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "./firebase";

export async function setTyping(
  conversationId: string,
  uid: string
): Promise<void> {
  await updateDoc(doc(db, "conversations", conversationId), {
    [`typing.${uid}`]: Date.now(),
  });
}

export async function clearTyping(
  conversationId: string,
  uid: string
): Promise<void> {
  await updateDoc(doc(db, "conversations", conversationId), {
    [`typing.${uid}`]: deleteField(),
  });
}
