# DESIGN.md

## TsisMissed — Design System Specification

TsisMissed is a Filipino gossip-themed chat app. The name is a pun on "tsismis" (gossip).
The design should feel playful, warm, social, and a little cheeky — like chatting with your
barkada (friend group). Not corporate dark. Not serious. Fun and alive.

---

## 1. Design Personality

- **Vibe:** Late night barkada group chat energy. Warm, intimate, slightly chaotic.
- **Tone:** Playful but readable. Gossip-y but not garish.
- **Reference feeling:** Like Viber meets a Filipino komiks color palette.
- **Not:** Cold, corporate, monochrome, or overly minimal.

---

## 2. Color Palette

### Primary Background
- **App background:** `#0D0A1A` — very deep purple-black, warmer than pure black
- **Sidebar background:** `#120E22` — slightly lighter purple-black
- **Card / panel background:** `#1A1530` — dark purple surface

### Accent Colors — the gossip palette
- **Primary accent (Hot pink / Tsismosa pink):** `#F72585` — hot pink, the main brand color
- **Secondary accent (Electric violet):** `#7209B7` — deep purple for gradients and highlights
- **Tertiary accent (Cyan pop):** `#4CC9F0` — bright cyan for online indicators and highlights
- **Warm accent (Mango yellow):** `#F8961E` — used sparingly for notifications and badges

### Text Colors
- **Primary text:** `#F0E6FF` — soft lavender white, easier on eyes than pure white
- **Secondary text:** `#9D8EC0` — muted purple-gray
- **Muted text:** `#5C5080` — for timestamps, labels, hints
- **Accent text (on dark):** `#F72585` — hot pink for names, links, highlights

### Message Bubble Colors
- **Sent bubble (current user):** `#7209B7` to `#F72585` — purple to pink gradient
- **Sent bubble text:** `#FFFFFF`
- **Received bubble:** `#1A1530` — dark purple surface
- **Received bubble text:** `#F0E6FF`
- **Received bubble border:** `1px solid #2D2550`

### Functional Colors
- **Online indicator:** `#4CC9F0` — cyan
- **Unread badge:** `#F72585` — hot pink
- **Error:** `#FF4D6D`
- **Success:** `#2DC653`
- **Border (subtle):** `#2D2550`
- **Border (active/hover):** `#F72585` at 40% opacity

### Gradients
- **Brand gradient:** `linear-gradient(135deg, #7209B7, #F72585)`
- **Bubble gradient (sent):** `linear-gradient(135deg, #7209B7 0%, #F72585 100%)`
- **Sidebar header gradient:** `linear-gradient(180deg, #1A1530 0%, #120E22 100%)`
- **Active item highlight:** `linear-gradient(90deg, rgba(247,37,133,0.15) 0%, transparent 100%)`

---

## 3. Typography

- **Font family:** `'Inter', system-ui, sans-serif` — clean and readable
- **App name / Logo text:** bold, hot pink `#F72585`, use `tracking-tight`

### Scale
| Use | Size | Weight | Color |
|---|---|---|---|
| App name in sidebar | `text-xl` | `font-bold` | `#F72585` |
| Contact display name | `text-sm` | `font-semibold` | `#F0E6FF` |
| Message text | `text-sm` | `font-normal` | `#F0E6FF` |
| Timestamp | `text-xs` | `font-normal` | `#5C5080` |
| Section label | `text-xs uppercase tracking-widest` | `font-semibold` | `#5C5080` |
| Bio / email | `text-xs` | `font-normal` | `#9D8EC0` |
| Empty state heading | `text-sm` | `font-semibold` | `#9D8EC0` |
| Empty state subtext | `text-xs` | `font-normal` | `#5C5080` |
| Button text | `text-sm` | `font-semibold` | varies |

---

## 4. Component Styles

### Buttons

**Primary button (e.g. Send, Save, Sign In):**
```
background: linear-gradient(135deg, #7209B7, #F72585)
text: #FFFFFF
border: none
border-radius: 9999px (fully rounded)
padding: px-6 py-2
font-weight: semibold
hover: opacity-90 scale-[1.02] transition-all
```

**Secondary button (e.g. Add Contact):**
```
background: transparent
border: 1px solid #F72585
text: #F72585
border-radius: 9999px
padding: px-4 py-1.5 text-xs
hover: bg-[#F72585]/10
```

**Ghost button (e.g. icon buttons in header):**
```
background: transparent
text: #9D8EC0
hover: text-[#F0E6FF] bg-white/5
border-radius: rounded-full
size: h-8 w-8
```

**Danger button:**
```
background: transparent
border: 1px solid #FF4D6D
text: #FF4D6D
border-radius: 9999px
hover: bg-[#FF4D6D]/10
```

### Input Fields
```
background: #1A1530
border: 1px solid #2D2550
border-radius: rounded-xl
text: #F0E6FF
placeholder: #5C5080
padding: px-4 py-2.5
focus: border-[#F72585] ring-1 ring-[#F72585]/30 outline-none
```

### Search Bar
```
background: #120E22
border: 1px solid #2D2550
border-radius: 9999px (pill shape)
icon: Search icon in #5C5080, left side pl-10
focus: border-[#F72585]/50
```

### Contact / Conversation List Item
**Default:**
```
background: transparent
border: 1px solid transparent
border-radius: rounded-xl
padding: p-3
hover: bg-white/5 border-[#2D2550]
transition: transition-all duration-150
```

**Active / Selected:**
```
background: linear-gradient(90deg, rgba(247,37,133,0.15) 0%, transparent 100%)
border-left: 3px solid #F72585
border-radius: rounded-xl
```

### Message Bubbles

**Sent (current user):**
```
background: linear-gradient(135deg, #7209B7, #F72585)
text: #FFFFFF
border-radius: rounded-2xl rounded-br-sm
max-width: max-w-[70%]
padding: px-4 py-2.5
align: ml-auto (right side)
```

**Received:**
```
background: #1A1530
border: 1px solid #2D2550
text: #F0E6FF
border-radius: rounded-2xl rounded-bl-sm
max-width: max-w-[70%]
padding: px-4 py-2.5
align: mr-auto (left side)
```

**Read receipt (Sent/Seen):**
```
text-xs text-[#5C5080] mt-1 text-right
Seen: text-[#4CC9F0] (cyan glow feeling)
```

### Avatars
```
border-radius: rounded-full
background (initials fallback): linear-gradient(135deg, #7209B7, #F72585)
text (initials): #FFFFFF font-bold
border: 2px solid #2D2550
sizes:
  sm: w-8 h-8 text-xs
  md: w-10 h-10 text-sm
  lg: w-14 h-14 text-base
```

**Online indicator dot:**
```
w-2.5 h-2.5
background: #4CC9F0
border: 2px solid #0D0A1A
border-radius: rounded-full
position: absolute bottom-0 right-0
```

### Cards / Panels
```
background: #1A1530
border: 1px solid #2D2550
border-radius: rounded-2xl
padding: p-4
```

### Toast Notifications
```
background: #1A1530
border: 1px solid #F72585 at 40% opacity
border-radius: rounded-2xl
text: #F0E6FF
accent: #F72585
shadow: 0 4px 24px rgba(247,37,133,0.15)
```

### Call Message Bubble (in chat)
```
background: #1A1530
border: 1px solid #7209B7 at 50% opacity
border-radius: rounded-2xl
icon: phone or video in #F72585
text: #9D8EC0
Join Call button: secondary button style (pink outline, pill)
```

---

## 5. Layout

### Main Layout
```
display: flex h-screen overflow-hidden
background: #0D0A1A
```

### Sidebar
```
width: w-[300px] lg:w-[320px]
background: #120E22
border-right: 1px solid #2D2550
display: flex flex-col
```

### Sidebar Header
```
height: h-16
padding: px-4
display: flex items-center justify-between
border-bottom: 1px solid #2D2550
App name: "TsisMissed" in font-bold text-xl text-[#F72585]
```

### Chat Area Header
```
height: h-16
background: #120E22
border-bottom: 1px solid #2D2550
padding: px-4
display: flex items-center gap-3
```

### Message List Area
```
background: #0D0A1A
flex: 1
overflow-y: auto
padding: p-4
gap between messages: space-y-2
```

### Message Input Area
```
background: #120E22
border-top: 1px solid #2D2550
padding: p-4
input: full rounded-xl bg-[#1A1530]
send button: gradient pill button
```

### Spacing Scale
```
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 24px
2xl: 32px
```

### Border Radius Scale
```
inputs: rounded-xl (12px)
buttons: rounded-full (pill)
bubbles: rounded-2xl (16px) with one corner modified
avatars: rounded-full
cards: rounded-2xl (16px)
list items: rounded-xl (12px)
```

---

## 6. Empty States

Empty states should feel warm and playful, not sterile.

**No contacts yet:**
```
Icon: large speech bubble or sparkle icon in #5C5080
Heading: "No tsismis yet!" — text-sm font-semibold text-[#9D8EC0]
Subtext: "Search for friends above to start the chika." — text-xs text-[#5C5080]
```

**No messages in conversation:**
```
Icon: chat bubble icon in #5C5080
Heading: "Start the tsismis!" — text-sm font-semibold text-[#9D8EC0]
Subtext: "Say hi and get the chika going." — text-xs text-[#5C5080]
```

**No search results:**
```
Text: "Wala kaming nahanap. Try another name?" — text-sm text-[#9D8EC0]
```

---

## 7. Micro-copy (Filipino-English flavor)

Use these throughout the UI for personality:

| Element | Copy |
|---|---|
| Search placeholder | "Hanapin ang ka-tsismis mo..." |
| Message input placeholder | "Mag-type ng tsismis..." |
| Empty contacts | "No tsismis yet!" |
| Empty chat | "Start the tsismis!" |
| No search results | "Wala kaming nahanap." |
| Add contact button | "Add" |
| Sending state | "Sending..." |
| Seen receipt | "Seen ✓" |
| Sent receipt | "Sent" |
| Join call button | "Sumali sa tawag" |
| Audio call label | "Voice Call" |
| Video call label | "Video Call" |
| Profile bio placeholder | "Ikwento mo ang sarili mo..." |
| Online status | "Online" |

---

## 8. Animations and Transitions

- **All hover states:** `transition-all duration-150 ease-out`
- **Button press:** `active:scale-[0.97] transition-transform duration-75`
- **Message appear:** `animate-in fade-in slide-in-from-bottom-1 duration-200`
- **Toast appear:** slide in from bottom right
- **Contact list item hover:** smooth background color transition
- **No heavy animations** — keep it snappy and responsive

---

## 9. Tailwind Config Additions

Add these to `tailwind.config.ts`:

```ts
theme: {
  extend: {
    colors: {
      tsismis: {
        bg: '#0D0A1A',
        sidebar: '#120E22',
        surface: '#1A1530',
        border: '#2D2550',
        pink: '#F72585',
        purple: '#7209B7',
        cyan: '#4CC9F0',
        mango: '#F8961E',
        text: '#F0E6FF',
        muted: '#9D8EC0',
        hint: '#5C5080',
      }
    },
    backgroundImage: {
      'tsismis-gradient': 'linear-gradient(135deg, #7209B7, #F72585)',
      'bubble-gradient': 'linear-gradient(135deg, #7209B7 0%, #F72585 100%)',
      'active-item': 'linear-gradient(90deg, rgba(247,37,133,0.15) 0%, transparent 100%)',
    }
  }
}
```

---

## 10. Do Not

- Do not use pure white `#FFFFFF` as a background anywhere
- Do not use cold gray tones — all grays should have a purple or warm tint
- Do not make the UI feel corporate or minimal
- Do not remove the Filipino micro-copy — it is part of the brand personality
- Do not use flat unstyled message bubbles — the gradient sent bubble is essential
- Do not use green as the primary accent — it conflicts with the hot pink brand
