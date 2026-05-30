"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { updateUserProfile } from "@/lib/firestore";
import { AvatarUploader } from "@/components/AvatarUploader";
import { ProfileForm } from "@/components/ProfileForm";
import type { UserProfile } from "@/types/user";

interface EditProfilePanelProps {
  open: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  currentUserEmail: string;
  onSaved: (updated: {
    displayName: string;
    bio: string;
    photoURL: string;
    avatarPublicId: string;
  }) => void;
}

export function EditProfilePanel({
  open,
  onClose,
  userProfile,
  currentUserEmail,
  onSaved,
}: EditProfilePanelProps) {
  const [photoURL, setPhotoURL] = useState(userProfile.photoURL ?? "");
  const [avatarPublicId, setAvatarPublicId] = useState(userProfile.avatarPublicId ?? "");

  async function handleSave({ displayName, bio }: { displayName: string; bio: string }) {
    await updateUserProfile(userProfile.uid, { displayName, bio, photoURL, avatarPublicId });
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName, photoURL: photoURL || null });
    }
    onSaved({ displayName, bio, photoURL, avatarPublicId });
    onClose();
  }

  function handleAvatarUpload(url: string, publicId: string) {
    setPhotoURL(url);
    setAvatarPublicId(publicId);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-[340px] bg-tsismis-surface border-l border-tsismis-border z-50 flex flex-col shadow-2xl transition-transform duration-200 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-tsismis-border shrink-0">
          <h2 className="text-sm font-semibold text-tsismis-text">Edit Profile</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 flex items-center justify-center rounded-full text-tsismis-muted hover:text-tsismis-text hover:bg-white/5 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
          <AvatarUploader
            currentPhotoURL={photoURL}
            displayName={userProfile.displayName}
            onUpload={handleAvatarUpload}
          />

          <ProfileForm
            initialValues={{
              displayName: userProfile.displayName,
              bio: userProfile.bio ?? "",
            }}
            onSave={handleSave}
            saveLabel="Save Changes"
          />

          {/* Read-only email */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-tsismis-muted">Email</span>
            <span className="text-xs text-tsismis-text truncate">{currentUserEmail}</span>
          </div>
        </div>
      </div>
    </>
  );
}
