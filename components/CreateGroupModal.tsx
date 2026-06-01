"use client";

import { useRef, useState } from "react";
import { Users, X, Check, Camera, Loader2 } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { GroupAvatar } from "@/components/GroupAvatar";
import { uploadAvatar } from "@/lib/cloudinary";
import type { Contact } from "@/types/contact";

interface CreateGroupModalProps {
  contacts: Contact[];
  onClose: () => void;
  onCreate: (
    name: string,
    memberUids: string[],
    photoURL?: string,
    avatarPublicId?: string
  ) => Promise<void>;
}

export function CreateGroupModal({
  contacts,
  onClose,
  onCreate,
}: CreateGroupModalProps) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoURL, setPhotoURL] = useState<string>("");
  const [avatarPublicId, setAvatarPublicId] = useState<string>("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setError(null);
    setUploadingAvatar(true);
    try {
      const { url, publicId } = await uploadAvatar(file);
      setPhotoURL(url);
      setAvatarPublicId(publicId);
    } catch {
      setError("Photo upload failed. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  function toggle(uid: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }

  const canCreate = name.trim().length > 0 && selected.size >= 2;

  async function handleCreate() {
    if (!canCreate || creating || uploadingAvatar) return;
    setCreating(true);
    setError(null);
    try {
      await onCreate(
        name.trim(),
        [...selected],
        photoURL || undefined,
        avatarPublicId || undefined
      );
    } catch {
      setError("Failed to create group. Please try again.");
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-tsismis-surface border border-tsismis-border rounded-2xl shadow-2xl w-[360px] max-w-[calc(100vw-2rem)] mx-4 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-tsismis-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-tsismis-gradient flex items-center justify-center text-white shrink-0">
              <Users size={18} />
            </div>
            <p className="text-sm font-bold text-tsismis-text">New Group</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-tsismis-muted hover:text-tsismis-text hover:bg-white/5 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Group photo (optional) */}
          <div className="flex flex-col items-center mb-4">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="relative rounded-full group cursor-pointer disabled:cursor-not-allowed"
              aria-label="Upload group photo"
            >
              <GroupAvatar photoURL={photoURL || undefined} size={72} />
              <span className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingAvatar ? (
                  <Loader2 size={20} className="text-white animate-spin" />
                ) : (
                  <Camera size={20} className="text-white" />
                )}
              </span>
            </button>
            <span className="text-[11px] text-tsismis-hint mt-1.5">
              {uploadingAvatar ? "Uploading…" : "Add group photo (optional)"}
            </span>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name..."
            maxLength={50}
            className="w-full px-4 py-2.5 mb-4 text-sm bg-tsismis-sidebar border border-tsismis-border rounded-xl text-tsismis-text placeholder:text-tsismis-hint outline-none focus:border-tsismis-pink focus:ring-1 focus:ring-tsismis-pink/30 transition-all"
          />

          <p className="text-xs font-semibold text-tsismis-muted mb-2 px-1">
            Add members ({selected.size} selected)
          </p>

          {contacts.length === 0 ? (
            <p className="text-xs text-tsismis-hint italic px-1 py-6 text-center">
              Add contacts first to start a group.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {contacts.map((contact) => {
                const isSelected = selected.has(contact.uid);
                return (
                  <li
                    key={contact.uid}
                    onClick={() => toggle(contact.uid)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? "bg-active-item border-tsismis-pink/40"
                        : "hover:bg-white/5 border-transparent"
                    }`}
                  >
                    <UserAvatar
                      displayName={contact.displayName}
                      photoURL={contact.photoURL}
                      size={36}
                    />
                    <span className="flex-1 min-w-0 text-sm font-semibold text-tsismis-text truncate">
                      {contact.displayName}
                    </span>
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 transition-all ${
                        isSelected
                          ? "bg-tsismis-gradient border-transparent text-white"
                          : "border-tsismis-border"
                      }`}
                    >
                      {isSelected && <Check size={13} />}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-tsismis-border shrink-0">
          {error && (
            <p className="text-xs text-red-400 mb-2 font-medium text-center">{error}</p>
          )}
          <button
            type="button"
            onClick={handleCreate}
            disabled={!canCreate || creating}
            className="w-full py-2.5 rounded-full bg-tsismis-gradient text-white text-sm font-semibold hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-tsismis-pink/10"
          >
            {creating ? "Creating…" : "Create Group"}
          </button>
          {!canCreate && (
            <p className="text-[11px] text-tsismis-hint mt-2 text-center">
              Pick a name and at least 2 members.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
