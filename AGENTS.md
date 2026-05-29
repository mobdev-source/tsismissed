<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# CLAUDE.md

## TsisMissed Chat MVP — Claude Code Instructions

This file is automatically read by Claude Code at the start of every session. Read it completely before touching any file. Then read PROGRESS.md to confirm the current session. Implement only what is listed for the current session.

---

## Project Overview

TsisMissed Chat MVP is a simple modern web-based chat application.

Users can:

* Register and log in with email/password or Google
* Create and edit their profile
* Upload an avatar or see generated initials as fallback
* Add a short bio
* Search for other users by display name
* Add users as contacts
* Send one-on-one real-time messages
* See simple read receipts (Sent / Seen)
* Start audio calls or video calls using VDO.Ninja
* Receive incoming call toast notifications

The app must remain simple, reliable, and deployable to Vercel. Do not over-engineer.

---

## Commands

Run these from the project root.

```bash
# Install dependencies
npm install

# Run local dev server
npm run dev

# Check for type errors and build issues
npm run build

# Install a new package
npm install <package-name>

# Deploy Firestore rules (requires Firebase CLI)
firebase deploy --only firestore:rules

# Deploy Firestore indexes (requires Firebase CLI)
firebase deploy --only firestore:indexes
```

Always run `npm run build` after completing a session to confirm no type errors before marking the session Done in PROGRESS.md.

---

## Tech Stack

Do not upgrade or replace any dependency unless explicitly instructed.

```text
Next.js 15+ (App Router)
React
TypeScript
Tailwind CSS
Firebase Authentication
Firebase Firestore
Cloudinary (avatar image storage)
VDO.Ninja (audio/video calls via WebRTC)
@radix-ui/react-toast
Lucide Icons
Vercel (deployment target)
```

---

## Firebase Setup Notes for Claude Code

Firebase is configured manually before running the project. Claude Code does not provision Firebase automatically.

The Firebase config is read from environment variables in `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

`lib/firebase.ts` must read exclusively from these environment variables. Never hardcode config values.

If `.env.local` does not exist, read `.env.local.example` and inform the user which values need to be filled in before the app can run.

If the Firebase CLI is available, use it to deploy rules and indexes. If not, output the rules and indexes content so the user can deploy manually via the Firebase Console.

---

## File Structure

```text
app/
  login/
    page.tsx
  register/
    page.tsx
  forgot-password/
    page.tsx
  profile/
    page.tsx
  chat/
    page.tsx
  layout.tsx
  page.tsx

components/
  AuthForm.tsx
  ProfileForm.tsx
  AvatarUploader.tsx
  ChatLayout.tsx
  ConversationList.tsx
  ContactSearch.tsx
  SearchResultItem.tsx
  ChatHeader.tsx
  MessageList.tsx
  MessageBubble.tsx
  MessageInput.tsx
  CallButton.tsx
  CallDialog.tsx
  IncomingCallToast.tsx
  ToastProvider.tsx
  UserAvatar.tsx

lib/
  firebase.ts
  auth.ts
  firestore.ts
  contacts.ts
  conversations.ts
  messages.ts
  cloudinary.ts
  callProvider.ts
  calls.ts

types/
  user.ts
  contact.ts
  conversation.ts
  message.ts
  call.ts

firestore.rules
firestore.indexes.json
.env.local.example
.gitignore
README.md
CLAUDE.md
PROGRESS.md
```

---

## Firestore Data Model

### users

```text
users/{userId}
```

```ts
{
  uid: string;
  displayName: string;
  displayNameLower: string;
  email: string;
  emailLower: string;
  photoURL?: string;
  avatarPublicId?: string;
  initials?: string;
  bio?: string;
  status: "online" | "offline";
  lastActiveAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### contacts

```text
users/{userId}/contacts/{contactUserId}
```

```ts
{
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  addedAt: Timestamp;
  lastConversationId?: string;
}
```

### conversations

```text
conversations/{conversationId}
```

Deterministic ID: sort both user UIDs alphabetically and join with underscore.

```ts
const conversationId = [uid1, uid2].sort().join("_");
```

```ts
{
  id: string;
  type: "direct";
  participantIds: string[];
  participantMap: { [uid: string]: true };
  lastMessage?: string;
  lastMessageType?: "text" | "call";
  lastMessageAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### messages

```text
conversations/{conversationId}/messages/{messageId}
```

```ts
{
  id: string;
  senderId: string;
  receiverId: string;
  type: "text" | "call";
  text?: string;
  callType?: "audio" | "video";
  callUrl?: string;
  roomName?: string;
  createdAt: Timestamp;
  readBy?: string[];
}
```

---

## Key Architectural Decisions

### Contact List Privacy

The left panel must never show all registered users by default. Show only added contacts and active conversations. Search results appear only while the user is actively searching.

### Search Implementation

Use Firestore prefix search on `displayNameLower`:

```ts
query(
  collection(db, "users"),
  where("displayNameLower", ">=", term),
  where("displayNameLower", "<=", term + "\uf8ff"),
  orderBy("displayNameLower"),
  limit(10)
)
```

The `\uf8ff` character is required for prefix search. Do not replace with client-side filtering.

This query requires a Firestore index. Generate `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "displayNameLower", "order": "ASCENDING" }
      ]
    }
  ]
}
```

### Avatar Storage

Use Cloudinary for avatar uploads. Initials fallback must always work independently of Cloudinary. Never use Firebase Storage.

### Timestamps

All date fields must use Firestore `serverTimestamp()`. Never use `new Date().toISOString()` or `new Date()` for Firestore document timestamps.

### Calling Provider Abstraction

All VDO.Ninja URL logic must live exclusively in `lib/callProvider.ts`. Never construct VDO.Ninja URLs inside UI components.

---

## Verified VDO.Ninja Calling Facts

Treat these as fixed requirements. Do not browse VDO.Ninja docs or override with assumptions.

### Room URL

Both caller and receiver use the same URL:

```text
https://vdo.ninja/?room=ROOM_NAME
```

Rooms are persistent and do not expire.

### Audio-Only Calls

`&novideo` alone is insufficient. It is viewer-side only and does not prevent the sender camera from activating.

Correct audio-only URL:

```text
https://vdo.ninja/?room=ROOM_NAME&videodevice=0&novideo
```

* `&videodevice=0` — sender-side, prevents camera activation
* `&novideo` — viewer-side, suppresses video rendering
* Both are always required for audio-only calls

### Video Calls

```text
https://vdo.ninja/?room=ROOM_NAME
```

No additional parameters needed.

### iframe

```tsx
<iframe
  src={callUrl}
  allow="camera; microphone; autoplay; display-capture"
  allowFullScreen
  style={{ width: "100%", height: "100%", border: "none" }}
/>
```

### Autoplay Policy

* Caller: auto-load iframe immediately — caller already clicked the call button
* Receiver: never auto-load iframe — show Join Call button first, load iframe only after click

### Required lib/callProvider.ts

```ts
export type CallType = "audio" | "video";

export function createRoomName(
  conversationId: string,
  callType: CallType
): string {
  const shortId = conversationId.replace("_", "").slice(0, 12);
  const timestamp = Date.now().toString(36);
  return `tm-${shortId}-${callType === "audio" ? "a" : "v"}-${timestamp}`;
}

export function buildCallUrl(
  roomName: string,
  callType: CallType
): string {
  const base = `https://vdo.ninja/?room=${encodeURIComponent(roomName)}`;
  if (callType === "audio") {
    return `${base}&videodevice=0&novideo`;
  }
  return base;
}

export function getIframeAllowAttribute(): string {
  return "camera; microphone; autoplay; display-capture";
}
```

---

## CallDialog Rules

Two modes: `"caller"` and `"receiver"`.

### Caller Mode
* Open immediately after call creation
* Load iframe immediately
* No Join button shown before iframe
* Show Close button and Open in New Tab fallback

### Receiver Mode
* Never auto-load iframe
* Show Join Call button first
* Load iframe only after receiver clicks Join Call
* Show Close button and Open in New Tab fallback

### Cleanup Rule

When dialog closes:
1. Set iframe `src` to empty string
2. Then unmount the component

This stops camera/mic streams from staying active after the call ends.

---

## Toast Deduplication

```ts
// Track shown toasts in a ref — never show the same call message twice
const shownToastIds = useRef<Set<string>>(new Set());

// Only show toast if:
// 1. message.type === "call"
// 2. message.senderId !== currentUser.uid
// 3. message.createdAt is within last 30 seconds
// 4. message.id is not already in shownToastIds
```

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /{document=**} {
      allow read, write: if false;
    }

    function isSignedIn() { return request.auth != null; }

    function isValidUser(data) {
      return data.keys().hasAll(['uid', 'email'])
        && data.uid is string
        && data.email is string;
    }

    function isValidConversation(data) {
      return data.keys().hasAll(['participantIds', 'participantMap'])
        && data.participantIds is list
        && data.participantIds.size() > 0
        && data.participantMap is map;
    }

    function isValidMessage(data) {
      let hasRequired = data.keys().hasAll(['senderId', 'receiverId', 'type', 'createdAt']);
      let isText = data.type == 'text' && data.keys().hasAll(['text']) && data.text is string;
      let isCall = data.type == 'call' && data.keys().hasAll(['callUrl', 'roomName']);
      let validReadBy = !data.keys().hasAny(['readBy']) || data.readBy is list;
      return hasRequired && (isText || isCall) && validReadBy;
    }

    match /users/{userId} {
      allow get: if isSignedIn();
      allow list: if isSignedIn();
      allow create: if isSignedIn()
        && request.auth.uid == userId
        && isValidUser(request.resource.data)
        && request.resource.data.uid == request.auth.uid;
      allow update: if isSignedIn()
        && request.auth.uid == userId
        && isValidUser(request.resource.data)
        && request.resource.data.uid == resource.data.uid
        && request.resource.data.email == resource.data.email
        && request.resource.data.diff(resource.data).affectedKeys()
           .hasOnly(['displayName', 'photoURL', 'bio', 'initials',
                     'status', 'displayNameLower', 'emailLower',
                     'lastActiveAt', 'updatedAt', 'avatarPublicId']);

      match /contacts/{contactId} {
        allow read, write: if isSignedIn() && request.auth.uid == userId;
      }
    }

    match /conversations/{conversationId} {
      allow get: if isSignedIn()
        && request.auth.uid in resource.data.participantIds;
      allow list: if isSignedIn()
        && request.auth.uid in resource.data.participantIds;
      allow create: if isSignedIn()
        && isValidConversation(request.resource.data)
        && request.auth.uid in request.resource.data.participantIds;
      allow update: if isSignedIn()
        && request.auth.uid in resource.data.participantIds
        && request.resource.data.participantIds == resource.data.participantIds;

      match /messages/{messageId} {
        allow read: if isSignedIn()
          && request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participantIds;
        allow create: if isSignedIn()
          && isValidMessage(request.resource.data)
          && request.resource.data.senderId == request.auth.uid
          && request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participantIds;
        allow update: if isSignedIn()
          && request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participantIds
          && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['readBy']);
      }
    }
  }
}
```

---

## Never Do

**Calling:**
* Never use `&novideo` alone for audio calls
* Never allow audio calls to activate the camera
* Never generate a new room when the receiver joins
* Never auto-load the iframe for the receiver without a click
* Never omit iframe `allow` attributes
* Never use `&push` or `&view`
* Never put VDO.Ninja URL logic outside `lib/callProvider.ts`
* Never close dialog without first setting iframe src to empty string

**Data:**
* Never use `new Date()` or `.toISOString()` for Firestore timestamps
* Never use `participants` — always use `participantIds` and `participantMap`
* Never show all registered users in the contact list by default
* Never commit `.env.local`
* Never hardcode Firebase config values

**Code:**
* Never rewrite the entire app when a focused change is enough
* Never silently resolve ambiguities — document them in PROGRESS.md
* Never leave visible UI controls non-functional
* Never start a new session without first updating PROGRESS.md
* Never mark a session Done without confirming `npm run build` passes
<!-- END:nextjs-agent-rules -->
