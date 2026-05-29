"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, MessageSquare, Search, X } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { UserAvatar } from "@/components/UserAvatar";
import { ContactSearch } from "@/components/ContactSearch";
import { ConversationList } from "@/components/ConversationList";
import { ChatHeader } from "@/components/ChatHeader";
import { MessageList } from "@/components/MessageList";
import { MessageInput } from "@/components/MessageInput";
import { CallDialog } from "@/components/CallDialog";
import { IncomingCallToast } from "@/components/IncomingCallToast";
import { subscribeContacts } from "@/lib/contacts";
import {
  getOrCreateConversation,
  subscribeConversations,
} from "@/lib/conversations";
import { getUserDoc } from "@/lib/firestore";
import { signOut } from "@/lib/auth";
import { createRoomName, buildCallUrl } from "@/lib/callProvider";
import { sendCallMessage } from "@/lib/calls";
import type { Contact } from "@/types/contact";
import type { Conversation } from "@/types/conversation";
import type { CallState } from "@/types/call";
import type { CallType } from "@/lib/callProvider";

export function ChatLayout() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [foreignContacts, setForeignContacts] = useState<Contact[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [callState, setCallState] = useState<CallState | null>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeContacts(user.uid, setContacts);
  }, [user?.uid]);

  useEffect(() => {
    if (!user) return;
    return subscribeConversations(user.uid, setConversations);
  }, [user?.uid]);

  // Fetch profiles for conversation participants not already in the contact list
  useEffect(() => {
    if (!user) return;

    const contactUidSet = new Set(contacts.map((c) => c.uid));
    const foreignUids = [
      ...new Set(
        conversations
          .flatMap((conv) => conv.participantIds)
          .filter((uid) => uid !== user.uid && !contactUidSet.has(uid))
      ),
    ];

    if (foreignUids.length === 0) {
      setForeignContacts([]);
      return;
    }

    Promise.all(foreignUids.map((uid) => getUserDoc(uid)))
      .then((profiles) => {
        const synthetic: Contact[] = profiles
          .filter((p): p is NonNullable<typeof p> => p !== null)
          .map((p) => ({
            uid: p.uid,
            displayName: p.displayName,
            email: p.email,
            photoURL: p.photoURL,
            bio: p.bio,
            addedAt: p.createdAt,
          }));
        setForeignContacts(synthetic);
      })
      .catch(() => {});
  }, [conversations, contacts, user?.uid]);

  async function handleSelectContact(contact: Contact) {
    if (!user) return;
    const conversation = await getOrCreateConversation(user.uid, contact.uid);
    setSelectedConversationId(conversation.id);
    setSelectedContact(contact);
    setMobileView("chat");
  }

  async function handleStartCall(callType: CallType) {
    if (!user || !selectedConversationId || !selectedContact) return;
    const roomName = createRoomName(selectedConversationId, callType);
    const callUrl = buildCallUrl(roomName, callType);
    await sendCallMessage(
      selectedConversationId,
      user.uid,
      selectedContact.uid,
      callType,
      callUrl,
      roomName
    );
    setCallState({
      open: true,
      mode: "caller",
      callType,
      callUrl,
      roomName,
      conversationId: selectedConversationId,
    });
  }

  function handleJoinCall(callUrl: string, callType: CallType) {
    setCallState({
      open: true,
      mode: "receiver",
      callType,
      callUrl,
      roomName: "",
      conversationId: selectedConversationId ?? "",
    });
  }

  function handleCloseCall() {
    setCallState(null);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  function handleBack() {
    setMobileView("list");
  }

  if (!user) return null;

  const conversationMap = new Map(conversations.map((c) => [c.id, c]));
  const contactUids = new Set(contacts.map((c) => c.uid));
  const allContacts = [
    ...contacts,
    ...foreignContacts.filter((fc) => !contactUids.has(fc.uid)),
  ];
  const isSearching = searchTerm.trim().length > 0;
  const conversationIds = conversations.map((c) => c.id);

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Left sidebar */}
      <aside
        className={`flex-col w-full md:w-80 border-r border-gray-200 shrink-0 ${
          mobileView === "chat" ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-600" />
            <span className="font-semibold text-gray-900 text-sm">
              TsisMissed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <UserAvatar
              displayName={user.displayName ?? ""}
              photoURL={user.photoURL ?? ""}
              size={28}
            />
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="relative flex items-center">
            <Search
              size={14}
              className="absolute left-2.5 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search people…"
              className="w-full pl-8 pr-8 py-1.5 text-sm bg-gray-100 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors placeholder:text-gray-400"
            />
            {isSearching && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Contact list or search results */}
        <div className="flex-1 overflow-y-auto">
          {isSearching ? (
            <ContactSearch
              term={searchTerm}
              currentUid={user.uid}
              contactUids={contactUids}
            />
          ) : (
            <ConversationList
              contacts={allContacts}
              conversationMap={conversationMap}
              selectedConversationId={selectedConversationId}
              currentUid={user.uid}
              onSelect={handleSelectContact}
            />
          )}
        </div>
      </aside>

      {/* Right area — chat panel */}
      <main
        className={`flex-1 flex-col ${
          mobileView === "list" ? "hidden md:flex" : "flex"
        }`}
      >
        {selectedConversationId && selectedContact ? (
          <>
            <ChatHeader
              contact={selectedContact}
              onBack={handleBack}
              onStartCall={handleStartCall}
            />
            <MessageList
              conversationId={selectedConversationId}
              currentUid={user.uid}
              otherUid={selectedContact.uid}
              onJoinCall={handleJoinCall}
            />
            <MessageInput
              conversationId={selectedConversationId}
              senderId={user.uid}
              receiverId={selectedContact.uid}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50">
            <MessageSquare size={48} className="text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">
              Select a contact to start chatting.
            </p>
          </div>
        )}
      </main>

      {/* Call dialog */}
      {callState && (
        <CallDialog
          open={callState.open}
          onClose={handleCloseCall}
          mode={callState.mode}
          callType={callState.callType}
          callUrl={callState.callUrl}
        />
      )}

      {/* Incoming call toasts */}
      <IncomingCallToast
        conversationIds={conversationIds}
        currentUid={user.uid}
        onJoinCall={handleJoinCall}
      />
    </div>
  );
}
