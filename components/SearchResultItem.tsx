"use client";

import { useState } from "react";
import { Check, UserPlus } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import type { UserProfile } from "@/types/user";

interface SearchResultItemProps {
  user: UserProfile;
  isContact: boolean;
  onAdd: () => Promise<void>;
}

export function SearchResultItem({ user, isContact, onAdd }: SearchResultItemProps) {
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    setAdding(true);
    try {
      await onAdd();
    } finally {
      setAdding(false);
    }
  }

  const subtitle = user.bio?.trim() || user.email;

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
      <UserAvatar displayName={user.displayName} photoURL={user.photoURL} size={40} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{user.displayName}</p>
        <p className="text-xs text-gray-500 truncate">{subtitle}</p>
      </div>
      {isContact ? (
        <span className="flex items-center gap-1 text-xs text-green-600 font-medium shrink-0">
          <Check size={14} />
          Added
        </span>
      ) : (
        <button
          onClick={handleAdd}
          disabled={adding}
          className="shrink-0 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <UserPlus size={14} />
          {adding ? "Adding…" : "Add"}
        </button>
      )}
    </div>
  );
}
