# OnDeen Design System
## DESIGN.md — for use in Google Stitch

### App identity
OnDeen is a UK-based Islamic community and spiritual growth platform for Muslims. The visual language is warm, soft, and light — premium but approachable. It must feel culturally appropriate for a Muslim audience across age groups and genders.

---

## Colour palette

### Background
- App background: `#F5F3F9` — pale lavender-tinted off-white. Never pure white. Never dark.
- Card surface: `#FFFFFF` — pure white cards on the lavender background.

### Primary accent — the sunset gradient
Used exclusively on: primary CTAs, the XP ring fill, streak flame, featured milestone moments.
- Gradient: `#FFC94B` → `#FF7A4A` → `#E8418F` (left to right, or bottom to top for vertical fills)
- Never use this gradient as a background. Only on buttons, progress fills, and reward moments.

### Secondary colours
- Deep purple: `#4B2A8C` — secondary primary actions, tier names, Arabic text
- Magenta/pink: `#E6288E` — active nav tabs, favourite heart state, accent highlights
- Free green: `#2ECC71` — FREE pricing badge only
- Muted text: `#7A7A7A`
- Primary text: `#1A1A1A`

### Gamification-specific colours
- XP ring track (empty): `#EFEBF5` — pale lavender
- XP ring fill: sunset gradient `#FFC94B → #FF7A4A → #E8418F`
- Streak flame: sunset gradient
- Axis bars:
  - Knowledge: `#FFC94B` (warm yellow)
  - Fitness: `#2ECC71` (green)
  - Ummah: `#E6288E` (magenta)
  - Tazkiyyah: `#4B2A8C` (deep purple)
- XP delta text ("+320 XP"): `#2ECC71`

---

## Typography
- Font stack: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif`
- All caps section labels: font-weight 700, letter-spacing 0.08em, font-size 11–12px
- Tier name: font-weight 700, font-size 22–24px, colour `#4B2A8C`
- Arabic tier text: font-weight 400, font-size 16px, colour `#7A7A7A`, displayed below English tier name
- Body text: font-weight 400, font-size 15px, colour `#1A1A1A`
- Secondary/muted text: font-weight 400, font-size 13px, colour `#7A7A7A`
- XP number (large): font-weight 700, font-size 32–36px, colour `#1A1A1A`

---

## Component patterns

### Cards
- Background: `#FFFFFF`
- Border radius: 16–20px
- Shadow: `0 2px 12px rgba(0,0,0,0.06)`
- Padding: 20px

### Buttons
- Primary CTA: full-width rounded pill, height 52px, background = sunset gradient (#FFC94B → #FF7A4A → #E8418F), text white font-weight 600
- Secondary CTA: full-width rounded pill, height 52px, border 1.5px solid #4B2A8C, text #4B2A8C, background transparent
- Skip/tertiary: text-only, colour #7A7A7A, no border, no background

### Progress / XP ring
- Circular ring, stroke-width 10–12px
- Track colour: #EFEBF5
- Fill colour: sunset gradient, fills clockwise from top
- Centre of ring: large XP number + small "XP" label beneath it
- Ring diameter: 160–180px for summary screen hero

### Streak flame
- Rendered as a flame icon using the sunset gradient colours
- States: strong (full gradient), dimmed (50% opacity), ember (greyscale with hint of amber)
- One check-in from full flame: flame has a subtle outer glow

### Star ratings (feedback)
- Star fill: #FFC94B (warm gold) when selected
- Star outline: #D5D5D5 when unselected
- Size: 36–40px tap target

### Input / text fields
- Background: #F5F3F9
- Border radius: 12px
- Border: 1px solid #E0DBF0 at rest, #4B2A8C on focus
- Padding: 14px 16px

### Navigation bar
- Background: #FFFFFF
- Active tab: icon + label in #E6288E
- Inactive tab: icon + label in #7A7A7A
- 4 tabs: Home, Calendar, Bookings, Profile

---

## Spacing system
- Base unit: 8px
- Screen horizontal padding: 20px
- Card gap: 12px
- Section spacing: 24px
- Element internal spacing: 8–16px

---

## Rules — never break these
1. Background is always light — never dark mode, never neon-on-black
2. Sunset gradient is reserved for primary CTAs and featured reward moments only
3. All corners are rounded — nothing sharp anywhere in the app
4. Cards are white on the lavender background with soft shadow
5. Generous whitespace — the app breathes, never dense or cluttered
6. Never use red for any state indicator — use grey for quiet/empty, amber for building, green for strong
7. Arabic text is always smaller and muted, supporting the English — never dominant

---

## Screen-specific notes

### Gamification / summary screens
- These live inside the same light aesthetic as the rest of the app
- Rewarding moments use the sunset gradient more prominently (XP ring, flame, level-up banner)
- A tier-change moment can have a subtle radial bloom behind the tier name
- Never go dark mode for gamification — no neon, no dark background
- Overall feeling: warm celebration, not aggressive gaming

### Feedback screens
- Anonymous banner clearly visible at top
- Star ratings use gold fill (#FFC94B)
- Submit button uses sunset gradient (primary CTA)
- Skip is text-only, de-emphasised, muted grey
