"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { getUserDoc, updateUserProfile } from "@/lib/firestore";
import { ProfileForm } from "@/components/ProfileForm";
import { AvatarUploader } from "@/components/AvatarUploader";
import type { UserProfile } from "@/types/user";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [photoURL, setPhotoURL] = useState("");
  const [avatarPublicId, setAvatarPublicId] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    getUserDoc(user.uid).then((doc) => {
      setProfile(doc);
      setPhotoURL(doc?.photoURL ?? "");
      setAvatarPublicId(doc?.avatarPublicId ?? "");
      setProfileLoading(false);
    });
  }, [user, authLoading, router]);

  async function handleSave({ displayName, bio }: { displayName: string; bio: string }) {
    if (!user) return;
    await updateUserProfile(user.uid, {
      displayName,
      bio,
      photoURL,
      avatarPublicId,
    });
    router.push("/chat");
  }

  function handleAvatarUpload(url: string, publicId: string) {
    setPhotoURL(url);
    setAvatarPublicId(publicId);
  }

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {profile?.displayName ? "Edit Profile" : "Set Up Your Profile"}
        </h1>
        <div className="mb-6">
          <AvatarUploader
            currentPhotoURL={photoURL}
            displayName={profile?.displayName ?? user?.email ?? ""}
            onUpload={handleAvatarUpload}
          />
        </div>
        <ProfileForm
          initialValues={{
            displayName: profile?.displayName ?? "",
            bio: profile?.bio ?? "",
          }}
          onSave={handleSave}
        />
        {profile?.displayName && (
          <button
            type="button"
            onClick={() => router.push("/chat")}
            className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700 text-center"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
