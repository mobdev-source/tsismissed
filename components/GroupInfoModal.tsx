"use client";

import { useRef, useState } from "react";
import { X, LogOut, Camera, Loader2 } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { GroupAvatar } from "@/components/GroupAvatar";
import { CallButton } from "@/components/CallButton";
import { uploadAvatar } from "@/lib/cloudinary";
import type { CallType } from "@/lib/callProvider";

interface GroupMember {
  uid: string;
  displayName: string;
  photoURL?: string;
}

interface GroupInfoModalProps {
  name: string;
  photoURL?: string;
  members: GroupMember[];
  currentUid: string;
  onClose: () => void;
  onStartCall: (callType: CallType) => void;
  onLeave: () => void;
  onUpdateAvatar: (photoURL: string, avatarPublicId: string) => Promise<void>;
}

export function GroupInfoModal({
  name,
  photoURL,
  members,
  currentUid,
  onClose,
  onStartCall,
  onLeave,
  onUpdateAvatar,
}: GroupInfoModalProps) {
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setError(null);
    setUploadingAvatar(true);
    try {
      const { url, publicId } = await uploadAvatar(file);
      await onUpdateAvatar(url, publicId);
    } catch {
      setError("Photo update failed. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-tsismis-surface border border-tsismis-border rounded-2xl shadow-2xl w-[360px] max-w-[calc(100vw-2rem)] mx-4 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-end px-3 py-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-tsismis-muted hover:text-tsismis-text hover:bg-white/5 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Group identity */}
        <div className="flex flex-col items-center px-6 pb-4 shrink-0">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="relative rounded-full group cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-tsismis-pink/15"
            aria-label="Change group photo"
          >
            <GroupAvatar photoURL={photoURL} size={80} />
            <span className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploadingAvatar ? (
                <Loader2 size={22} className="text-white animate-spin" />
              ) : (
                <Camera size={22} className="text-white" />
              )}
            </span>
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <p className="mt-3 text-base font-bold text-tsismis-text text-center leading-tight">
            {name}
          </p>
          <p className="mt-1 text-xs text-tsismis-hint">{members.length} members</p>
          {error && (
            <p className="mt-1.5 text-[11px] text-red-400 text-center">{error}</p>
          )}

          {/* Call actions */}
          <div className="flex items-center gap-3 mt-4">
            <CallButton callType="audio" onClick={onStartCall} />
            <CallButton callType="video" onClick={onStartCall} />
          </div>
        </div>

        {/* Member list */}
        <div className="flex-1 overflow-y-auto px-4 pb-2 border-t border-tsismis-border pt-3">
          <p className="text-xs font-semibold text-tsismis-muted mb-2 px-1">Members</p>
          <ul className="space-y-0.5">
            {members.map((m) => (
              <li
                key={m.uid}
                className="flex items-center gap-3 p-2.5 rounded-xl"
              >
                <UserAvatar
                  displayName={m.displayName}
                  photoURL={m.photoURL}
                  size={36}
                />
                <span className="flex-1 min-w-0 text-sm font-semibold text-tsismis-text truncate">
                  {m.displayName}
                  {m.uid === currentUid && (
                    <span className="text-tsismis-hint font-normal"> (you)</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Leave */}
        <div className="px-5 py-4 border-t border-tsismis-border shrink-0">
          {confirmLeave ? (
            <div className="flex flex-col gap-2.5">
              <p className="text-xs text-tsismis-muted text-center leading-relaxed">
                Leave <span className="font-semibold text-tsismis-text">{name}</span>? You won&apos;t
                receive its messages anymore.
              </p>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmLeave(false)}
                  className="flex-1 py-2 rounded-full border border-tsismis-border text-sm font-semibold text-tsismis-muted hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onLeave}
                  className="flex-1 py-2 rounded-full bg-red-500 text-sm font-semibold text-white hover:bg-red-600 active:scale-[0.97] transition-all cursor-pointer"
                >
                  Leave
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmLeave(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-red-400/40 text-sm font-semibold text-red-400 hover:bg-red-500/10 active:scale-[0.97] transition-all cursor-pointer"
            >
              <LogOut size={15} /> Leave Group
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
