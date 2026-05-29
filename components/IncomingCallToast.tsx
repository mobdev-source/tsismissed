"use client";

import { useEffect, useRef, useState } from "react";
import * as Toast from "@radix-ui/react-toast";
import { Phone, Video, X } from "lucide-react";
import { subscribeLatestMessages } from "@/lib/messages";
import type { CallType } from "@/lib/callProvider";

interface ToastItem {
  messageId: string;
  callUrl: string;
  callType: CallType;
  open: boolean;
}

interface IncomingCallToastProps {
  conversationIds: string[];
  currentUid: string;
  onJoinCall: (callUrl: string, callType: CallType) => void;
}

export function IncomingCallToast({
  conversationIds,
  currentUid,
  onJoinCall,
}: IncomingCallToastProps) {
  const shownToastIds = useRef<Set<string>>(new Set());
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const convKey = conversationIds.join(",");

  useEffect(() => {
    if (conversationIds.length === 0) return;

    const unsubs = conversationIds.map((convId) =>
      subscribeLatestMessages(convId, (messages) => {
        const now = Date.now();
        for (const msg of messages) {
          if (
            msg.type !== "call" ||
            msg.senderId === currentUid ||
            shownToastIds.current.has(msg.id)
          ) {
            continue;
          }
          if (!msg.createdAt) continue;
          let msgTime: number;
          try {
            msgTime = msg.createdAt.toDate().getTime();
          } catch {
            continue;
          }
          if (now - msgTime > 30000) continue;

          shownToastIds.current.add(msg.id);
          setToasts((prev) => [
            ...prev,
            {
              messageId: msg.id,
              callUrl: msg.callUrl!,
              callType: (msg.callType ?? "audio") as CallType,
              open: true,
            },
          ]);
        }
      })
    );

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convKey, currentUid]);

  function dismiss(messageId: string) {
    setToasts((prev) =>
      prev.map((t) => (t.messageId === messageId ? { ...t, open: false } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.messageId !== messageId));
    }, 400);
  }

  return (
    <>
      {toasts.map((toast) => (
        <Toast.Root
          key={toast.messageId}
          open={toast.open}
          onOpenChange={(open) => {
            if (!open) dismiss(toast.messageId);
          }}
          duration={15000}
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 flex items-start gap-3 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-bottom-full"
        >
          <div className="flex-shrink-0 mt-0.5">
            {toast.callType === "audio" ? (
              <Phone size={18} className="text-green-600" />
            ) : (
              <Video size={18} className="text-blue-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Toast.Title className="text-sm font-semibold text-gray-900">
              Incoming {toast.callType === "audio" ? "Audio" : "Video"} Call
            </Toast.Title>
            <Toast.Description className="text-xs text-gray-500 mt-0.5">
              Someone is calling you
            </Toast.Description>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  dismiss(toast.messageId);
                  onJoinCall(toast.callUrl, toast.callType);
                }}
                className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Join Call
              </button>
              <button
                onClick={() => dismiss(toast.messageId)}
                className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          <Toast.Close asChild>
            <button className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={14} />
            </button>
          </Toast.Close>
        </Toast.Root>
      ))}
    </>
  );
}
