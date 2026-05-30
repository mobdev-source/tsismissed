"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import type { ContactRequest } from "@/types/contactRequest";

interface ContactRequestsPanelProps {
  requests: ContactRequest[];
  onAccept: (request: ContactRequest) => Promise<void>;
  onDecline: (request: ContactRequest) => Promise<void>;
}

export function ContactRequestsPanel({
  requests,
  onAccept,
  onDecline,
}: ContactRequestsPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [processingUid, setProcessingUid] = useState<string | null>(null);

  async function handleAccept(request: ContactRequest) {
    setProcessingUid(request.fromUid);
    try {
      await onAccept(request);
    } finally {
      setProcessingUid(null);
    }
  }

  async function handleDecline(request: ContactRequest) {
    setProcessingUid(request.fromUid);
    try {
      await onDecline(request);
    } finally {
      setProcessingUid(null);
    }
  }

  return (
    <div className="border-b border-tsismis-border">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-tsismis-muted uppercase tracking-wider hover:bg-white/5 transition-colors cursor-pointer"
      >
        <span>
          Contact Requests{" "}
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-tsismis-pink/20 text-tsismis-pink font-bold normal-case">
            {requests.length}
          </span>
        </span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <ul>
          {requests.map((req) => {
            const isProcessing = processingUid === req.fromUid;
            return (
              <li
                key={req.fromUid}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
              >
                <UserAvatar
                  displayName={req.fromDisplayName}
                  photoURL={req.fromPhotoURL}
                  size={36}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-tsismis-text truncate">
                    {req.fromDisplayName}
                  </p>
                  <p className="text-xs text-tsismis-muted truncate">
                    {req.fromBio || req.fromEmail}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleAccept(req)}
                    className="px-3 py-1 text-xs font-semibold rounded-full bg-tsismis-gradient text-white hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleDecline(req)}
                    className="px-3 py-1 text-xs font-semibold rounded-full border border-tsismis-border text-tsismis-muted hover:bg-white/5 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
