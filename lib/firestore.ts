import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import type { User as FirebaseUser } from "firebase/auth";
import { db } from "./firebase";
import type { UserProfile } from "@/types/user";

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

export async function createOrUpdateUserDoc(user: FirebaseUser): Promise<void> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const displayName = user.displayName ?? "";
    await setDoc(ref, {
      uid: user.uid,
      displayName,
      displayNameLower: displayName.toLowerCase(),
      email: user.email ?? "",
      emailLower: (user.email ?? "").toLowerCase(),
      photoURL: user.photoURL ?? "",
      initials: getInitials(displayName),
      bio: "",
      status: "online",
      lastActiveAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(ref, {
      status: "online",
      lastActiveAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function getUserDoc(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function updateUserProfile(
  uid: string,
  fields: {
    displayName?: string;
    bio?: string;
    photoURL?: string;
    avatarPublicId?: string;
    initials?: string;
  }
): Promise<void> {
  const update: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (fields.displayName !== undefined) {
    update.displayName = fields.displayName;
    update.displayNameLower = fields.displayName.toLowerCase();
    update.initials = fields.initials ?? getInitials(fields.displayName);
  }
  if (fields.bio !== undefined) update.bio = fields.bio;
  if (fields.photoURL !== undefined) update.photoURL = fields.photoURL;
  if (fields.avatarPublicId !== undefined) update.avatarPublicId = fields.avatarPublicId;

  await updateDoc(doc(db, "users", uid), update);
}
