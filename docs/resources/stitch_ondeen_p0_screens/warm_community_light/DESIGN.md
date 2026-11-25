---
name: Warm Community Light
colors:
  surface: '#fef7ff'
  surface-dim: '#ded8e1'
  surface-bright: '#fef7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f1fb'
  surface-container: '#f2ecf5'
  surface-container-high: '#ece6ef'
  surface-container-highest: '#e7e0e9'
  on-surface: '#1d1a21'
  on-surface-variant: '#494551'
  inverse-surface: '#322f36'
  inverse-on-surface: '#f5eef8'
  outline: '#7a7583'
  outline-variant: '#cbc3d3'
  surface-tint: '#6b4cad'
  primary: '#340b75'
  on-primary: '#ffffff'
  primary-container: '#4b2a8c'
  on-primary-container: '#ba9aff'
  inverse-primary: '#d2bcff'
  secondary: '#b3006b'
  on-secondary: '#ffffff'
  secondary-container: '#db1c86'
  on-secondary-container: '#fffbff'
  tertiary: '#511500'
  on-tertiary: '#ffffff'
  tertiary-container: '#762300'
  on-tertiary-container: '#ff8c63'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bcff'
  on-primary-fixed: '#24005b'
  on-primary-fixed-variant: '#523294'
  secondary-fixed: '#ffd9e4'
  secondary-fixed-dim: '#ffb0cd'
  on-secondary-fixed: '#3e0021'
  on-secondary-fixed-variant: '#8c0053'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59c'
  on-tertiary-fixed: '#390c00'
  on-tertiary-fixed-variant: '#822700'
  background: '#fef7ff'
  on-background: '#1d1a21'
  surface-variant: '#e7e0e9'
  bg-app: '#F5F3F9'
  surface-card: '#FFFFFF'
  gradient-sunset-start: '#FFC94B'
  gradient-sunset-mid: '#FF7A4A'
  gradient-sunset-end: '#E8418F'
  status-free: '#2ECC71'
  xp-track: '#EFEBF5'
  text-primary: '#1A1A1A'
  text-muted: '#7A7A7A'
  axis-knowledge: '#FFC94B'
  axis-fitness: '#2ECC71'
  axis-ummah: '#E6288E'
  axis-tazkiyyah: '#4B2A8C'
typography:
  display-xp:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  display-xp-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-tier:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-tier-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  arabic-subtext:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  section-label:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.08em
  body-main:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-muted:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  screen-edge: 20px
  card-gap: 12px
  section-margin: 24px
  internal-sm: 8px
  internal-md: 16px
  internal-lg: 20px
---

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
6. Never use red for any state indicator — use grey for empty, amber for building, green for strong
7. Arabic text is always smaller and muted, supporting the English — never dominant
