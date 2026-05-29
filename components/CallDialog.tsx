"use client";

import { useEffect, useRef, useState } from "react";
import { X, ExternalLink, Phone, Video } from "lucide-react";
import { getIframeAllowAttribute } from "@/lib/callProvider";
import type { CallType } from "@/lib/callProvider";

interface CallDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "caller" | "receiver";
  callType: CallType;
  callUrl: string;
}

export function CallDialog({
  open,
  onClose,
  mode,
  callType,
  callUrl,
}: CallDialogProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeSrc, setIframeSrc] = useState("");
  const [joined, setJoined] = useState(false);

  // Caller auto-loads iframe; reset state when dialog closes
  useEffect(() => {
    if (open && mode === "caller") {
      setIframeSrc(callUrl);
      setJoined(true);
    }
    if (!open) {
      setIframeSrc("");
      setJoined(false);
    }
  }, [open, mode, callUrl]);

  function handleClose() {
    // Stop camera/mic streams before unmounting
    if (iframeRef.current) {
      iframeRef.current.src = "";
    }
    setIframeSrc("");
    setJoined(false);
    onClose();
  }

  function handleJoin() {
    setIframeSrc(callUrl);
    setJoined(true);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white shrink-0">
        <div className="flex items-center gap-2">
          {callType === "audio" ? (
            <Phone size={18} className="text-green-400" />
          ) : (
            <Video size={18} className="text-blue-400" />
          )}
          <span className="text-sm font-medium">
            {callType === "audio" ? "Audio Call" : "Video Call"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <a
            href={callUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new tab"
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <ExternalLink size={16} />
          </a>
          <button
            onClick={handleClose}
            title="End call"
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex items-center justify-center bg-black overflow-hidden">
        {!joined && mode === "receiver" ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-600">
              {callType === "audio" ? (
                <Phone size={28} className="text-white" />
              ) : (
                <Video size={28} className="text-white" />
              )}
            </div>
            <p className="text-white text-sm">
              {callType === "audio" ? "Incoming audio call" : "Incoming video call"}
            </p>
            <button
              onClick={handleJoin}
              className="px-6 py-2.5 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Join Call
            </button>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            allow={getIframeAllowAttribute()}
            allowFullScreen
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        )}
      </div>
    </div>
  );
}
