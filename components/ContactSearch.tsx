"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { searchUsers } from "@/lib/contacts";
import {
  sendContactRequest,
  getOutgoingRequestStatus,
} from "@/lib/contactRequests";
import { SearchResultItem } from "@/components/SearchResultItem";
import type { UserProfile } from "@/types/user";
import type { SearchResultStatus } from "@/components/SearchResultItem";

interface ContactSearchProps {
  term: string;
  currentUid: string;
  currentDisplayName: string;
  currentEmail: string;
  currentPhotoURL: string | null | undefined;
  contactUids: Set<string>;
  onOpenChat: (uid: string) => void;
}

export function ContactSearch({
  term,
  currentUid,
  currentDisplayName,
  currentEmail,
  currentPhotoURL,
  contactUids,
  onOpenChat,
}: ContactSearchProps) {
  const [results, setResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  // Statuses fetched from Firestore for current result set
  const [fetchedStatuses, setFetchedStatuses] = useState<
    Map<string, "pending" | "declined" | null>
  >(new Map());
  // Optimistic local overrides after user clicks send
  const localSentRef = useRef<Map<string, "pending">>(new Map());
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!term.trim()) {
      setResults([]);
      setFetchedStatuses(new Map());
      localSentRef.current = new Map();
      return;
    }

    let cancelled = false;
    setSearching(true);

    searchUsers(term, currentUid).then(async (users) => {
      if (cancelled) return;
      setResults(users);
      setSearching(false);

      // Fetch outgoing request statuses for non-contacts
      const nonContacts = users.filter((u) => !contactUids.has(u.uid));
      const entries = await Promise.all(
        nonContacts.map(async (u) => {
          const status = await getOutgoingRequestStatus(currentUid, u.uid);
          return [u.uid, status] as const;
        })
      );
      if (!cancelled) {
        setFetchedStatuses(new Map(entries));
      }
    });

    return () => {
      cancelled = true;
    };
  // contactUids is a Set — compare by stringified to avoid infinite loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, currentUid]);

  function getStatus(uid: string): SearchResultStatus {
    if (contactUids.has(uid)) return "contact";
    if (localSentRef.current.has(uid)) return localSentRef.current.get(uid)!;
    const fetched = fetchedStatuses.get(uid);
    if (fetched === "pending") return "pending";
    if (fetched === "declined") return "declined";
    return "none";
  }

  async function handleSendRequest(user: UserProfile) {
    await sendContactRequest(
      currentUid,
      currentDisplayName,
      currentEmail,
      currentPhotoURL,
      "",
      user.uid
    );
    localSentRef.current = new Map(localSentRef.current).set(user.uid, "pending");
    forceUpdate((n) => n + 1);
  }

  if (searching) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={20} className="animate-spin text-tsismis-pink" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="px-4 py-12 text-center select-none">
        <p className="text-sm font-semibold text-tsismis-muted">Wala kaming nahanap.</p>
        <p className="text-xs text-tsismis-hint mt-1">Subukan mong mag-search ng ibang pangalan.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-0.5">
      {results.map((user) => (
        <li key={user.uid}>
          <SearchResultItem
            user={user}
            status={getStatus(user.uid)}
            onSendRequest={() => handleSendRequest(user)}
            onOpen={contactUids.has(user.uid) ? () => onOpenChat(user.uid) : undefined}
          />
        </li>
      ))}
    </ul>
  );
}
