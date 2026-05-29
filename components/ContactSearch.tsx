"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { searchUsers, addContact } from "@/lib/contacts";
import { SearchResultItem } from "@/components/SearchResultItem";
import type { UserProfile } from "@/types/user";

interface ContactSearchProps {
  term: string;
  currentUid: string;
  contactUids: Set<string>;
}

export function ContactSearch({ term, currentUid, contactUids }: ContactSearchProps) {
  const [results, setResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setSearching(true);

    searchUsers(term, currentUid).then((users) => {
      if (!cancelled) {
        setResults(users);
        setSearching(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [term, currentUid]);

  if (searching) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 size={20} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-gray-400">No users found.</p>
    );
  }

  return (
    <ul>
      {results.map((user) => (
        <li key={user.uid}>
          <SearchResultItem
            user={user}
            isContact={contactUids.has(user.uid)}
            onAdd={() => addContact(currentUid, user)}
          />
        </li>
      ))}
    </ul>
  );
}
