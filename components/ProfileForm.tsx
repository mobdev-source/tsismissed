"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface ProfileFormValues {
  displayName: string;
  bio: string;
}

interface ProfileFormProps {
  initialValues: ProfileFormValues;
  onSave: (values: ProfileFormValues) => Promise<void>;
  saveLabel?: string;
}

export function ProfileForm({ initialValues, onSave, saveLabel }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(initialValues.displayName);
  const [bio, setBio] = useState(initialValues.bio);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Display name is required.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSave({ displayName: displayName.trim(), bio: bio.trim() });
    } catch {
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-tsismis-text mb-1">
          Display Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
          maxLength={60}
          className="w-full border border-tsismis-border bg-tsismis-surface text-tsismis-text rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tsismis-pink/30 focus:border-tsismis-pink"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-tsismis-text mb-1">
          Bio <span className="text-tsismis-muted font-normal">({bio.length}/160)</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 160))}
          placeholder="A short bio…"
          rows={3}
          className="w-full border border-tsismis-border bg-tsismis-surface text-tsismis-text rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tsismis-pink/30 focus:border-tsismis-pink resize-none"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="flex items-center justify-center gap-2 bg-tsismis-pink hover:bg-tsismis-pink/90 text-white font-medium rounded-lg px-4 py-2 text-sm disabled:opacity-50 transition-colors"
      >
        {saving && <Loader2 size={14} className="animate-spin" />}
        {saveLabel ?? "Save Profile"}
      </button>
    </form>
  );
}
