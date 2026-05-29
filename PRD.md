# Product Requirements Document

## TsisMissed Chat MVP

### Simple Web Chat App with Firebase, Contact Search, Profiles, and Free Audio/Video Calling

---

## 1. Product Overview

Build a simple, modern web-based chat application where users can sign in, manage their profile, search for other users, add contacts, send one-on-one messages, and start audio or video calls.

The app should feel similar to modern messaging apps like Messenger, Viber, Telegram, and WhatsApp, but the MVP must remain simple, reliable, and easy to deploy.

The final application should be deployable to Vercel.

---

## 2. Main Goal

Create a working MVP with:

* User registration and login
* Google Sign-In
* User profile with avatar and bio
* Contact search and add contact flow
* Contact list that only shows added contacts or active conversations
* One-on-one real-time chat
* Modern responsive chat UI
* Audio call using VDO.Ninja
* Video call using VDO.Ninja
* Embedded call dialog with new-tab fallback
* Caller auto-join behavior after starting a call
* Audio-only call behavior where the camera does not start
* Simple read receipts
* Incoming call toast notification
* Firebase-powered backend
* Vercel-ready deployment setup

---

## 3. Recommended Tech Stack

Use **Next.js** unless there is a strong reason to use plain React. Next.js is preferred because it is easy to deploy on Vercel and can support future API routes if needed.

Recommended stack:

* Next.js
* React
* TypeScript
* Firebase Authentication
* Firebase Firestore
* Cloudinary for avatar image storage
* Firebase Storage only if Blaze billing is acceptable
* Tailwind CSS
* shadcn/ui or Radix UI components
* `@radix-ui/react-toast`
* VDO.Ninja for free WebRTC audio/video calling
* Vercel for deployment

Do not over-engineer. Avoid unnecessary backend servers unless required.

---

## 4. Target Users

The app is intended for small teams, students, internal company users, or MVP users who need a simple messaging system with basic calling features.

The experience should be simple enough for non-technical users.

---

## 5. Product Principles

The MVP should follow these principles:

1. **Simple first**
   Prioritize working chat, login, contact search, and calling before advanced features.

2. **Reliable over fancy**
   Avoid complex custom WebRTC or notification systems for now.

3. **Beginner-friendly setup**
   Firebase, Cloudinary, and Vercel should be easy to configure.

4. **No fake UI**
   Buttons and menus should either work, be hidden, or be clearly marked as coming soon.

5. **Future-ready but not overbuilt**
   Structure the app so group chat, push notifications, and production-grade calling can be added later.

---

## 6. Core Features

---

# 6.1 Authentication

Users should be able to sign in using:

* Email and password
* Google Sign-In using Firebase Authentication

Required screens:

* Login
* Register
* Forgot password
* Basic profile setup after registration

After successful login, redirect the user to `/chat`.

### Authentication Requirements

* User can register using email and password.
* User can log in using email and password.
* User can sign in using Google.
* User can log out.
* User can reset password.
* After registration or Google sign-in, create or update the user document in Firestore.
* If the user profile is incomplete, redirect to the profile setup page.

---

# 6.2 User Profile

Each user should have a profile.

Profile fields:

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

### Profile Requirements

Users should be able to:

* Update display name
* Add or update a short bio
* Upload an avatar photo
* See generated initials if no avatar exists
* Edit their profile later

### Avatar Display Locations

Avatar should appear in:

* Left contact list
* Chat header
* Message bubbles, if applicable
* User search results
* Profile modal/page
* Current user mini-profile area

### Bio Requirements

* Maximum 160 characters
* Show bio in profile view
* Optional: show short bio preview in contact search results
* Bio should not be required

---

# 6.3 Avatar Storage

Preferred MVP storage: **Cloudinary**

Use Cloudinary for avatar image uploads because it is beginner-friendly and avoids Firebase Storage billing friction.

### Cloudinary Requirements

Use Cloudinary for profile photos.

For MVP:

* Use unsigned upload preset for simplicity, or use a small Next.js API route for signed uploads if the implementation agent recommends it.
* Store the returned `secure_url` in the user document as `photoURL`.
* Store `public_id` as `avatarPublicId` if available.
* Limit uploads to image files only.
* Limit max avatar image size, for example 2 MB.
* Allow JPG, PNG, and WebP.
* Show a square cropped avatar preview in the UI.

Cloudinary environment variables:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

Optional safer future setup:

```env
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

For MVP, keep Cloudinary setup beginner-friendly.

### Alternative Storage

Use Firebase Storage only if the project owner is comfortable enabling Firebase Blaze/pay-as-you-go billing.

If neither Cloudinary nor Firebase Storage is available, use generated initials as fallback.

---

# 6.4 Contact List and Search Behavior

The left panel should **not show every registered user by default**.

The left panel should show:

* Search bar at the top
* Existing contacts or active conversations below it
* Last message preview
* Last message time
* Avatar or initials
* Online/offline indicator if available
* Unread badge if available

### Important Privacy and UX Rule

Users should only see:

* People they have already added as contacts
* People they already have active conversations with

Users should not automatically see all registered users in the system.

---

# 6.5 Search for Other Users

Above the contact list, add a search bar where users can search for other users by name or email.

### Search Requirements

* Search bar should be placed at the top of the left sidebar, above the contact/conversation list.
* User can search by display name.
* Optional: allow search by email for more accurate results.
* Search results should not show the current logged-in user.
* Search results should not permanently appear in the contact list unless added.
* Search results should show:

  * Avatar or initials
  * Display name
  * Email or short bio
  * Add Contact button or Message button

### Recommended Simple Search Approach

Store searchable lowercase fields:

```ts
{
  displayName: "Jay Guillermo",
  displayNameLower: "jay guillermo",
  email: "jay@example.com",
  emailLower: "jay@example.com"
}
```

For MVP:

* Use prefix search on `displayNameLower` or `emailLower`.
* Avoid complex full-text search.
* Avoid Algolia or external search unless absolutely necessary.

---

# 6.6 Add Contact Flow

Users should be able to add another user as a contact before chatting.

### Simple MVP Behavior

* User searches for a name.
* User clicks **Add Contact** or **Message**.
* App creates a contact relationship.
* App creates or opens a direct conversation.

For MVP, do not build a complicated friend request approval system unless needed.

### Recommended Contact Model

Use one-way contacts first.

Path:

```text
users/{currentUserId}/contacts/{otherUserId}
```

Fields:

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

### MVP Contact Behavior

* If User A adds User B, User B appears in User A's contact list.
* User A can message User B.
* User B may see the conversation once User A sends a message.
* Mutual friend request approval is out of scope for MVP.

---

# 6.7 One-on-One Chat

Users should be able to open a contact and send messages in real time.

### Message Features

* Text messages
* Real-time updates using Firestore
* Message timestamp
* Sent/received alignment
* Auto-scroll to latest message
* Basic loading state
* Empty state when no messages exist
* Simple read receipts

### Message Bubble Behavior

* Current user messages appear on the right.
* Other user messages appear on the left.
* Use clean rounded bubbles.
* Use readable spacing and font size.
* Mobile-friendly layout.

---

# 6.8 Read Receipts

Implement a simple read receipt feature.

When a user opens a conversation:

* Update messages sent by the other user.
* Add current user UID to the `readBy` array if not already present.
* Use Firestore `arrayUnion`.

Message model:

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

### Read Receipt Requirements

When opening a conversation, mark messages as read only when:

* `senderId !== currentUser.uid`
* `readBy` does not already include `currentUser.uid`

Use Firestore batch writes if practical.

Avoid excessive writes. For MVP, it is acceptable to mark only recent unread messages.

### Read Receipt UI

For sent messages, show:

* **Sent** if receiver has not read it yet
* **Seen** if receiver UID is included in `readBy`

Keep it simple for MVP.

---

# 6.9 Audio Call

Each conversation should have an audio call button.

### Audio Call Behavior

* User clicks **Audio Call**.
* App generates a unique VDO.Ninja room name.
* App generates the audio-only call URL using both required parameters:
  * `&videodevice=0` — prevents camera from activating on the sender side
  * `&novideo` — suppresses video rendering on the viewer side
  * **Both parameters are required. Using only `&novideo` is incorrect.**
* App creates a call message in the conversation with the stored `callUrl`.
* Caller automatically opens the room inside an embedded dialog.
* Caller does not see a separate Join button after creating the room.
* Camera must not turn on for either party in an audio call.
* Receiver joins using the stored `callUrl` from the call message.
* Receiver must not generate a new room.
* If embedded iframe has permission issues, allow Open in New Tab fallback.

---

# 6.10 Video Call

Each conversation should have a video call button.

### Video Call Behavior

* User clicks **Video Call**.
* App generates a unique VDO.Ninja room name.
* App generates the video call URL using only the room parameter:
  * `https://vdo.ninja/?room=ROOM_NAME`
  * No additional parameters are needed for video calls.
* App creates a call message in the conversation with the stored `callUrl`.
* Caller automatically opens the room inside an embedded dialog.
* Caller does not see a separate Join button after creating the room.
* Camera and microphone should be enabled.
* Receiver joins using the stored `callUrl` from the call message.
* Receiver must not generate a new room.
* If embedded iframe has permission issues, allow Open in New Tab fallback.

---

# 6.11 Caller Auto-Join and Audio-Only Call Behavior

During the earlier prototype, we encountered an issue where starting an audio or video call created the room but still showed the caller a **Join** option. This must be fixed.

## Required Caller Behavior

### Audio Call

When the caller starts an audio call:

* The user clicks **Audio Call**.
* The app generates a unique room name.
* The app generates the audio-only URL:

```text
https://vdo.ninja/?room=ROOM_NAME&videodevice=0&novideo
```

* `&videodevice=0` prevents the camera from activating on the sender side.
* `&novideo` suppresses video rendering on the viewer side.
* Both parameters are required.
* The app creates a call message in the conversation.
* The call dialog opens immediately.
* The caller is automatically loaded into the created room.
* The caller does not need to click a separate Join button.
* The camera must not turn on.

### Video Call

When the caller starts a video call:

* The user clicks **Video Call**.
* The app generates a unique room name.
* The app generates the video call URL:

```text
https://vdo.ninja/?room=ROOM_NAME
```

* No additional parameters are needed for video.
* The app creates a call message in the conversation.
* The call dialog opens immediately.
* The caller is automatically loaded into the created room.
* The caller does not need to click a separate Join button.
* The video call should enable camera and microphone.

## Required Receiver Behavior

When the receiver sees the call message or receives the call toast:

* The receiver sees a **Join Call** button.
* The receiver clicks **Join Call**.
* Only after that click, the call dialog opens and the iframe loads.
* The receiver must use the stored `callUrl` from the call message.
* The receiver must not generate a new room.

**Important:** The receiver iframe must not auto-load from the toast or from a passive message update. The receiver click is required because browsers block audio autoplay in iframes unless the parent page has already received a user gesture.

## Required Dialog Behavior

The call dialog supports two modes:

### Caller Mode

* Opens immediately after call creation.
* Loads the VDO.Ninja iframe immediately.
* Does not show a separate Join button before loading the room.
* Shows call title.
* Shows Close button.
* Shows Open in New Tab fallback.

### Receiver Mode

* Opens after receiver clicks Join Call from the call message or toast.
* Does not render the iframe until after the user click.
* Loads the VDO.Ninja iframe using the stored `callUrl` from the message.
* Shows call title.
* Shows Close button.
* Shows Open in New Tab fallback.

## Call Dialog Cleanup Rule

When the call dialog closes:

* Set the iframe `src` to an empty string before unmounting the component.
* This prevents the browser from keeping the camera or microphone stream active after the dialog closes.
* Test: close the dialog and verify the camera indicator light turns off.

## Call URL Rules

The call URL is generated once when the call starts and stored in the call message.

Audio-only URL:

```ts
function buildCallUrl(roomName: string, callType: "audio" | "video") {
  const base = `https://vdo.ninja/?room=${encodeURIComponent(roomName)}`;

  if (callType === "audio") {
    return `${base}&videodevice=0&novideo`;
  }

  return base;
}
```

Room name generation:

```ts
function createRoomName(conversationId: string, callType: "audio" | "video"): string {
  // Keep room names short and alphanumeric for VDO.Ninja compatibility
  const shortId = conversationId.replace("_", "").slice(0, 12);
  const timestamp = Date.now().toString(36); // base36 keeps it short
  return `tm-${shortId}-${callType === "audio" ? "a" : "v"}-${timestamp}`;
}
```

Room names should stay under 30 characters and use only alphanumeric characters and hyphens.

## Acceptance Criteria for Calling

* Starting an audio call automatically opens the created room for the caller.
* Starting a video call automatically opens the created room for the caller.
* The caller does not see an unnecessary Join step after starting the call.
* Audio calls do not turn on the camera.
* Video calls turn on the camera and microphone.
* The receiver joins the same room through the stored call message URL.
* The receiver does not generate a separate room.
* The receiver iframe does not load until the receiver clicks Join Call.
* The app still supports Open in New Tab as fallback.

---

# 6.12 Incoming Call Toast

Add a simple toast notification using `@radix-ui/react-toast`.

When a user receives a new incoming call message:

* Show toast notification.
* Show caller name.
* Show call type: audio or video.
* Include button: Open Chat or Join Call.
* Clicking the toast opens the correct conversation.
* Clicking Join Call from the toast is the user gesture that then allows the iframe to load.

### Toast Requirements

Show toast only when:

* Message type is `call`
* Sender is not the current user
* Call message `createdAt` is within the last 30 seconds
* The message ID has not already triggered a toast in the current session
* Current user is a participant in the conversation

### Toast Deduplication

To prevent duplicate toasts:

* Store the last seen call message ID in a `useRef` or local state variable.
* On each Firestore snapshot, only show a toast if:
  * The message `createdAt` timestamp is within the last 30 seconds.
  * The message ID has not already triggered a toast this session.
* Do not rely on message array position. Use timestamp comparison.
* Do not trigger toasts for old call messages that existed before the current session loaded.

### Receiver Autoplay Rule

* Clicking Open Chat navigates to the conversation. The iframe does not auto-load.
* Clicking Join Call from the toast counts as the required user gesture. The call dialog may then open and load the iframe.
* Never auto-load the iframe from the toast appearing alone.

Suggested toast copy:

```text
Incoming video call from Jay
Open Chat
```

or

```text
Incoming audio call from Jay
Join Call
```

---

# 6.13 UI Controls

Do not leave fake UI controls.

Any visible clickable UI element must either:

* Work
* Be hidden
* Be disabled with a "Coming soon" label

### Kebab Menu Handling

Suggested simple menu actions:

Conversation header kebab menu:

* View profile
* Clear local selection or close conversation
* Open active call in new tab if active call exists

Message kebab menu:

* Copy message text
* Delete own message, optional
* Cancel if too complex

Acceptance criteria:

* No visible clickable UI control should be non-functional.
* Kebab buttons either open a simple menu or are hidden.
* UI feels intentional and not unfinished.

---

## 7. Data Model

---

# 7.1 users Collection

Path:

```text
users/{userId}
```

Fields:

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

---

# 7.2 contacts Subcollection

Path:

```text
users/{userId}/contacts/{contactUserId}
```

Fields:

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

---

# 7.3 conversations Collection

Path:

```text
conversations/{conversationId}
```

For one-on-one chat, use deterministic conversation ID:

```text
userA_userB
```

Sort both user IDs alphabetically before generating the ID.

Fields:

```ts
{
  id: string;
  type: "direct";
  participantIds: string[];
  participantMap: {
    [uid: string]: true;
  };
  lastMessage?: string;
  lastMessageType?: "text" | "call";
  lastMessageAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

# 7.4 messages Subcollection

Path:

```text
conversations/{conversationId}/messages/{messageId}
```

Fields:

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

## 8. Firestore Security Rules

Rules should ensure:

* Users can read and update their own profile.
* Authenticated users can search limited public profile fields.
* Users can only read their own contacts.
* Users can only write their own contacts.
* Users can only access conversations where they are participants.
* Users can only access messages under conversations where they are participants.
* Users cannot modify another user's profile.
* Users cannot send messages to conversations they do not belong to.

### Public Searchable Profile Fields

Because user search requires finding other users, allow authenticated users to read limited public fields from `users`.

Public searchable fields:

* `uid`
* `displayName`
* `displayNameLower`
* `email`, optional depending on privacy decision
* `emailLower`, optional depending on privacy decision
* `photoURL`
* `bio`

If privacy is a concern, search by display name only and do not expose email.

---

## 9. Pages and Routes

Recommended Next.js App Router structure:

```text
/app
  /login
  /register
  /forgot-password
  /profile
  /chat

/components
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

/lib
  firebase.ts
  auth.ts
  firestore.ts
  contacts.ts
  conversations.ts
  messages.ts
  cloudinary.ts
  callProvider.ts
  calls.ts

/types
  user.ts
  contact.ts
  conversation.ts
  message.ts
  call.ts
```

Main routes:

* `/login`
* `/register`
* `/forgot-password`
* `/profile`
* `/chat`

Redirect rules:

* If not logged in, redirect to `/login`.
* If logged in but profile is incomplete, redirect to `/profile`.
* If logged in and profile is complete, redirect to `/chat`.

---

## 10. UI Layout

Desktop layout:

```text
-----------------------------------------------------
| Left Sidebar        | Chat Header                 |
| Current user/profile| Name, status, call buttons  |
| Search contacts     |-----------------------------|
| Contact list        | Message list                |
|                     |-----------------------------|
|                     | Message input               |
-----------------------------------------------------
```

### Left Sidebar Requirements

* Current user mini-profile at top or bottom.
* Search bar above contact list.
* Contact/conversation list below search.
* Search results can appear above or replace the contact list while searching.
* Contact list should not show all registered users by default.

### Mobile Layout

* Show contact list first.
* When user selects contact, show chat screen.
* Add back button to return to contact list.
* Keep call buttons accessible but not too large.
* Call dialog should be mobile-friendly.

---

## 11. VDO.Ninja Calling Approach

Use VDO.Ninja room links for audio/video calling to avoid building custom WebRTC infrastructure.

### Verified VDO.Ninja Facts

The following facts were verified against the official VDO.Ninja documentation. Do not override these with assumptions.

**Room URL structure:**

Both caller and receiver use the same URL:

```text
https://vdo.ninja/?room=ROOM_NAME
```

Rooms are persistent and do not expire. Everyone who joins the same room name auto-connects to each other automatically.

**Audio-only calls require two parameters:**

```text
https://vdo.ninja/?room=ROOM_NAME&videodevice=0&novideo
```

* `&videodevice=0` is a sender-side parameter that prevents the camera from activating.
* `&novideo` is a viewer-side parameter that suppresses video rendering.
* Using only `&novideo` is insufficient. The camera will still activate on the sender side.

**Video calls require no extra parameters:**

```text
https://vdo.ninja/?room=ROOM_NAME
```

**iframe requirements:**

```tsx
<iframe
  src={callUrl}
  allow="camera; microphone; autoplay; display-capture"
  allowFullScreen
  style={{ width: "100%", height: "100%", border: "none" }}
/>
```

**Do not use `&push` or `&view` for simple one-on-one room calls.**

### Call Provider Abstraction

All call URL logic must live in one file:

```text
/lib/callProvider.ts
```

Required implementation:

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

This abstraction makes it easy to switch to ZEGOCLOUD or another provider later.

---

## 12. MVP Scope

---

# 12.1 Must Have

* Email/password authentication
* Google Sign-In
* Register/login/logout
* User profile creation
* Avatar upload using Cloudinary or initials fallback
* Bio field
* Contact search in left sidebar
* Add contact flow
* Contact list only shows added contacts or active conversations
* One-on-one chat
* Real-time messages
* Simple read receipts
* Audio/video call using VDO.Ninja
* Embedded call dialog with new-tab fallback
* Caller auto-join after starting call
* Audio-only call must not turn on camera (requires `&videodevice=0&novideo`)
* Receiver must click before iframe loads
* Incoming call toast with deduplication
* Responsive UI
* Firebase config
* Firestore security rules
* Vercel deployment readiness

---

# 12.2 Should Have

* Online/offline indicator
* Last message preview
* Forgot password
* Email verification
* Loading states
* Empty states
* Error messages
* Basic profile modal
* Copy message text

---

# 12.3 Nice to Have

* Typing indicator
* Unread count
* Image messages
* File sharing
* Emoji picker
* Dark mode
* Group chat
* Push notifications
* Contact request approval system

---

# 12.4 Out of Scope for MVP

* Complex group chat
* Group calls
* End-to-end encryption beyond platform defaults
* Custom WebRTC signaling server
* Full contact approval workflow
* Admin panel
* Payment system
* Native mobile app
* Production-grade call ringing system

---

## 13. Group Chat Direction

Group chat is Phase 2. Do not implement for MVP.

Future group chat model:

```ts
conversations/{conversationId} {
  type: "direct" | "group";
  name?: string;
  photoURL?: string;
  participantIds: string[];
  participantMap: {
    [uid: string]: true;
  };
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastMessage?: string;
  lastMessageAt?: Timestamp;
}
```

Use `type: "direct"` for current one-on-one conversations to keep the future model compatible.

---

## 14. Environment Variables

Required Firebase variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Required Cloudinary variables if using Cloudinary:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

Optional Firebase Analytics variable:

```env
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

Important:

* Do not commit `.env.local`.
* Add `.env.local` to `.gitignore`.
* Add the same environment variables to Vercel Project Settings before deployment.

---

## 15. Deployment Requirements

The project must be deployable to Vercel.

Requirements:

* Use environment variables.
* Build should pass with `npm run build`.
* Provide README setup instructions.
* Include Firebase setup instructions.
* Include Cloudinary setup instructions if used.
* Include Vercel deployment instructions.
* Do not require a custom Node server.
* App must work locally and on Vercel.

---

## 16. README Requirements

The README should include:

* Project overview
* Tech stack
* Firebase setup steps
* Firebase Auth setup
* Firestore setup
* Cloudinary avatar setup
* Required environment variables
* How to run locally
* How to deploy to Vercel
* How contact search works
* How audio/video call works
* Why audio call requires both `&videodevice=0` and `&novideo`
* Why `&novideo` alone is insufficient for audio-only calls
* How caller auto-join works
* Why receiver must click before iframe loads (browser autoplay policy)
* How embedded call fallback works
* Known limitations
* Future improvements

---

## 17. Acceptance Criteria

The project is complete when:

### Authentication and Profile

* A new user can register.
* A user can log in and log out.
* A user can sign in with Google.
* A user can complete or edit profile.
* A user can upload avatar photo or see initials fallback.
* A user can add a short bio.

### Contacts and Search

* The left sidebar has a search bar above the contact list.
* The default contact list does not show all registered users.
* A user can search for another user by name.
* A user can add another user as contact.
* Added contacts appear in the left contact list.
* Existing conversations appear in the left panel.

### Chat

* A user can start or open a one-on-one chat with a contact.
* Messages appear in real time.
* Message bubbles are aligned correctly.
* Chat works on desktop and mobile.
* Read receipts show Sent/Seen.

### Calling

* A user can start an audio call.
* Audio call automatically opens the created room for the caller.
* Audio call does not turn on the camera.
* Audio call URL contains both `&videodevice=0` and `&novideo`.
* A user can start a video call.
* Video call automatically opens the created room for the caller.
* Video call turns on camera and microphone.
* Caller does not see an unnecessary Join step after starting the call.
* Receiver iframe does not auto-load from toast or passive message update.
* Receiver sees Join Call button first.
* Receiver iframe loads only after receiver clicks Join Call.
* Receiver can join the same call room from the chat message or toast.
* Receiver does not generate a separate room.
* Closing the call dialog stops the camera and microphone stream.
* Open in New Tab fallback works.
* Incoming call toast appears for new call messages within last 30 seconds.
* Duplicate toasts do not appear for the same call message.

### Security and Deployment

* Firebase security rules prevent unauthorized access.
* User cannot access conversations they are not part of.
* User cannot modify another user's profile.
* Project builds successfully.
* App can be deployed to Vercel.

---

## 18. Known Limitations

Document these in the README:

* User search only matches from the beginning of the display name (prefix search). Searching "jay" will not find "Mary Jay".
* User B has no notification that User A added them as a contact until User A sends a message. This is intentional for MVP simplicity.
* VDO.Ninja iframe embedding requires SSL. This is automatically handled on Vercel but must be configured for any custom domain.
* Browser autoplay policy requires the receiver to click before the call iframe loads. Silent auto-join for the receiver is not possible without a more complex setup.
* VDO.Ninja rooms do not expire automatically. Room names are unique per call session by design.

---

## 19. Suggested AI Agent Instructions

Build this project as a clean MVP. Do not over-engineer. Prioritize working authentication, user profiles, contact search, one-on-one chat, verified VDO.Ninja call implementation, responsive UI, and clean code structure.

Use Next.js with TypeScript, Firebase Auth, Firestore, Tailwind CSS, Cloudinary for avatars, and VDO.Ninja for free audio/video calling.

Before coding, read `AGENT.md` and `PROGRESS.md`. Then inspect the current project structure. Then implement only the session assigned.

Use the verified `callProvider.ts` implementation from `AGENT.md`. Do not browse VDO.Ninja docs or override the verified call URL rules.

---

## 20. Future Enhancements

After MVP, consider:

* Group chat
* Group calls
* Push notifications
* Real ringing system
* Typing indicators
* Unread counts
* Image/file messages
* Message reactions
* Dark mode
* Contact approval workflow
* Admin controls
* ZEGOCLOUD or another production-grade call SDK if the app becomes serious

---

## 21. Implementation Session Plan

Build the TsisMissed Chat MVP in focused sessions. Complete, test, and update `PROGRESS.md` after each session before moving to the next.

---

### Session 1 — Foundation

**Scope:** Set up or validate the base project structure, environment variables, Firebase connection, styling system, and deployment readiness.

**Files to Create or Modify:**

```text
package.json
.env.local.example
.gitignore
README.md
app/layout.tsx
app/page.tsx
app/login/page.tsx
app/register/page.tsx
app/chat/page.tsx
lib/firebase.ts
lib/auth.ts
types/user.ts
types/conversation.ts
types/message.ts
components/ui/*
AGENT.md
PROGRESS.md
```

**Acceptance Criteria:**

* App runs locally using `npm run dev`.
* Firebase app initializes without runtime errors.
* `.env.local.example` lists all required Firebase and Cloudinary variables.
* `.env.local` is ignored by Git.
* Login and register routes exist.
* `/chat` route exists.
* Basic responsive layout renders.
* `npm run build` passes.

**Dependencies:** None.

---

### Session 2 — Authentication and User Profile

**Scope:** Implement Firebase Authentication, Google Sign-In, user profile creation, avatar upload, bio field, and profile edit flow.

**Files to Create or Modify:**

```text
app/login/page.tsx
app/register/page.tsx
app/forgot-password/page.tsx
app/profile/page.tsx
components/AuthForm.tsx
components/ProfileForm.tsx
components/AvatarUploader.tsx
components/UserAvatar.tsx
lib/auth.ts
lib/firestore.ts
lib/cloudinary.ts
types/user.ts
```

**Acceptance Criteria:**

* User can register using email/password.
* User can log in using email/password.
* User can sign in using Google.
* User can log out.
* User document is created or updated in Firestore after registration or Google login.
* User can add and edit display name.
* User can add and edit bio.
* User can upload avatar using Cloudinary or fall back to initials.
* Profile fields include `displayNameLower` and `emailLower`.
* Incomplete profile redirects to `/profile`.
* Completed profile redirects to `/chat`.

**Dependencies:** Session 1.

---

### Session 3 — Contacts and Search

**Scope:** Implement the left sidebar search bar, private contact list behavior, user search, and add-contact flow.

**Files to Create or Modify:**

```text
components/ChatLayout.tsx
components/ConversationList.tsx
components/ContactSearch.tsx
components/SearchResultItem.tsx
components/UserAvatar.tsx
lib/contacts.ts
lib/firestore.ts
types/contact.ts
firestore.rules
```

**Acceptance Criteria:**

* Left sidebar has a search bar above the contact/conversation list.
* Default left sidebar does not show all registered users.
* User only sees added contacts or active conversations by default.
* User can search for other users by display name.
* Current logged-in user is excluded from search results.
* Search result shows avatar/initials, display name, and bio or email.
* User can click Add Contact or Message.
* Added contact appears in the contact list.
* Contact data is stored under `users/{uid}/contacts/{contactUserId}`.
* Security rules prevent users from editing another user's contacts.

**Dependencies:** Sessions 1 and 2.

---

### Session 4 — One-on-One Chat

**Scope:** Implement direct conversations, real-time messages, message bubbles, last-message preview, simple read receipts, and mobile-responsive chat layout.

**Files to Create or Modify:**

```text
components/ChatLayout.tsx
components/ConversationList.tsx
components/ChatHeader.tsx
components/MessageList.tsx
components/MessageBubble.tsx
components/MessageInput.tsx
lib/conversations.ts
lib/messages.ts
lib/firestore.ts
types/conversation.ts
types/message.ts
firestore.rules
```

**Acceptance Criteria:**

* User can open or create a direct conversation with a contact.
* Direct conversation uses deterministic ID based on sorted user IDs.
* Message sending works.
* Messages appear in real time.
* Current user messages align right.
* Other user messages align left.
* Message timestamps display correctly.
* Last message preview appears in the left panel.
* Opening a conversation marks other user's unread messages as read.
* `readBy` array is updated using Firestore `arrayUnion`.
* Sender sees Sent or Seen.
* Chat layout works on desktop and mobile.

**Dependencies:** Sessions 1, 2, and 3.

---

### Session 5 — Calling Feature

**Scope:** Implement VDO.Ninja audio/video calling using the verified call URL rules, embedded call dialog, caller auto-join, receiver click-before-load behavior, call messages, and incoming call toast.

**Files to Create or Modify:**

```text
lib/callProvider.ts
lib/calls.ts
types/call.ts
components/CallButton.tsx
components/CallDialog.tsx
components/ChatHeader.tsx
components/MessageBubble.tsx
components/IncomingCallToast.tsx
components/ToastProvider.tsx
components/ChatLayout.tsx
README.md
PROGRESS.md
```

**Critical Rules for This Session:**

* Use the verified `callProvider.ts` from `AGENT.md` exactly.
* Audio call URL must contain both `&videodevice=0` and `&novideo`.
* Video call URL must contain only `?room=ROOM_NAME`.
* Caller iframe loads immediately without a Join step.
* Receiver iframe must not auto-load. Receiver must click Join Call first.
* Receiver always uses the stored `callUrl`. Never generate a new room for the receiver.
* iframe must include `allow="camera; microphone; autoplay; display-capture"`.
* When closing the dialog, set iframe `src` to empty string before unmounting.
* Toast deduplication must use timestamp comparison and message ID tracking. Do not rely on array position.

**Acceptance Criteria:**

* `lib/callProvider.ts` uses the verified implementation exactly.
* Audio call URL contains both `videodevice=0` and `novideo`.
* Video call URL contains only the room URL.
* Caller starts audio call and is automatically loaded into the room.
* Caller starts video call and is automatically loaded into the room.
* Caller does not see an unnecessary Join button after starting a call.
* Audio call does not activate camera.
* Video call allows camera and microphone.
* Receiver does not auto-load iframe from toast or passive message update.
* Receiver sees Join Call first.
* Receiver iframe loads only after clicking Join Call.
* Receiver joins the same stored `callUrl`.
* Receiver does not generate a separate room.
* Closing the dialog stops the camera and microphone stream.
* iframe includes correct `allow` attributes and `allowFullScreen`.
* Open in New Tab fallback works.
* Incoming call toast appears for new call messages within last 30 seconds.
* Old call messages do not trigger duplicate toasts.
* Existing chat, auth, contact, and read receipt features still work.
* `npm run build` passes.

**Dependencies:** Sessions 1 through 4.

---

### Session 6 — Polish, Rules, and Deployment

**Scope:** Finish UI polish, remove fake controls, finalize security rules, update README, test Vercel deployment readiness, and document known limitations.

**Files to Create or Modify:**

```text
README.md
AGENT.md
PROGRESS.md
firestore.rules
components/*
app/*
```

**Acceptance Criteria:**

* No visible clickable UI control is non-functional.
* Kebab menus either work, are hidden, or show Coming Soon clearly.
* UI is clean on desktop and mobile.
* Firebase security rules protect profiles, contacts, conversations, and messages.
* README explains audio call requires both `&videodevice=0` and `&novideo`.
* README explains why receiver must click before iframe loads.
* README documents known limitations.
* `npm run build` passes.
* Project is ready to deploy on Vercel.

**Dependencies:** Sessions 1 through 5.
