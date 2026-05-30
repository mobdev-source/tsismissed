"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { uploadAvatar } from "@/lib/cloudinary";
import { UserAvatar } from "./UserAvatar";

interface AvatarUploaderProps {
  currentPhotoURL?: string;
  displayName?: string;
  onUpload: (url: string, publicId: string) => void;
}

export function AvatarUploader({ currentPhotoURL, displayName = "", onUpload }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const { url, publicId } = await uploadAvatar(file);
      onUpload(url, publicId);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <UserAvatar displayName={displayName} photoURL={currentPhotoURL} size={80} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 text-sm text-tsismis-pink hover:text-tsismis-pink/80 disabled:opacity-50 transition-colors"
      >
        {uploading ? (
          <><Loader2 size={14} className="animate-spin" /> Uploading…</>
        ) : (
          <><Upload size={14} /> Change photo</>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
