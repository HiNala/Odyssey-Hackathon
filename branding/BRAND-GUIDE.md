# Odyssey Arena — Brand Guide

## Brand Identity

**Odyssey Arena** is a live AI battle simulation powered by Odyssey-2 Pro. The brand communicates futuristic innovation, interactive gameplay, and premium quality through a glassmorphic visual language.

---

## Logo

### Primary Logo (`logo.png`)
- Full logo with emblem + "ODYSSEY ARENA" text
- Use on: splash screens, presentation slides, marketing materials
- Dark background preferred for maximum impact

### App Icon (`app-icon.png`)
- Square icon with dual glassmorphic shields
- Use on: app icon, favicon, social media avatar
- Works at all sizes from 16px to 1024px

### Splash Screen (`splash-screen.png`)
- Full mockup showing the two-phone arena layout
- Use on: hackathon slides, README hero image, demo videos

---

## Color Palette

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Deep Navy** | `#0F172A` | Dark backgrounds, app chrome |
| **Charcoal** | `#1E293B` | Secondary backgrounds, cards |
| **Electric Blue** | `#38BDF8` | Player 1 accents, primary actions |
| **Violet** | `#8B5CF6` | Player 2 accents, secondary actions |

### Accent Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Amber** | `#F59E0B` | Player 1 identity, warnings |
| **Purple** | `#8B5CF6` | Player 2 identity |
| **Emerald** | `#34D399` | Success states, winning |
| **Rose** | `#FB7185` | Danger, critical hits |

### Glass Effect Colors

| Name | Value | Usage |
|------|-------|-------|
| **Glass BG** | `rgba(255, 255, 255, 0.10)` | Panel backgrounds |
| **Glass Border** | `rgba(255, 255, 255, 0.20)` | Panel borders |
| **Glass Highlight** | `rgba(255, 255, 255, 0.05)` | Inner highlights |
| **Glass Blur** | `blur(24px)` | Backdrop blur |

### Background Gradient

```css
background: linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 25%, #F9A8D4 75%, #FBCFE8 100%);
```

---

## Typography

### Font Stack

```css
font-family: 'Geist Sans', -apple-system, 'Segoe UI', Roboto, sans-serif;
```

### Type Scale

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| **Display** | 4xl (36px) | Bold | "ODYSSEY ARENA" title |
| **Heading** | 2xl (24px) | Semibold | Section headers |
| **Subhead** | lg (18px) | Medium | Card titles |
| **Body** | base (16px) | Regular | General text |
| **Caption** | sm (14px) | Regular | Labels, hints |
| **Micro** | xs (12px) | Regular | Status indicators |

---

## Glassmorphism Spec

### Standard Glass Panel

```css
background: rgba(255, 255, 255, 0.10);
backdrop-filter: blur(24px);
border: 1px solid rgba(255, 255, 255, 0.20);
border-radius: 16px;
box-shadow:
  0 8px 32px rgba(0, 0, 0, 0.12),
  inset 0 1px 0 rgba(255, 255, 255, 0.05);
```

### Phone Frame

```css
background: rgba(15, 23, 42, 0.80);
border-radius: 40px;
border: 1px solid rgba(255, 255, 255, 0.10);
box-shadow:
  0 25px 50px rgba(0, 0, 0, 0.4),
  inset 0 1px 0 rgba(255, 255, 255, 0.05);
```

---

## Asset Files

```
branding/
├── BRAND-GUIDE.md      # This file
├── logo.png            # Full logo (emblem + text, dark bg)
├── splash-screen.png   # Two-phone arena mockup
└── app-icon.png        # Square app icon (dual shields)
```

Also available in the Next.js app:

```
odyssey-arena/public/
├── logo.png            # For <img> tags and OG images
├── splash.png          # For loading screens
└── icon.png            # For favicon and app icon
```

---

## Usage Guidelines

- Always use the logo on dark backgrounds (#0F172A or darker)
- Maintain clear space around the logo (at least 1x the emblem height)
- Don't stretch, rotate, or recolor the logo
- For light backgrounds, use the text "ODYSSEY ARENA" alone in dark text
- Keep the glassmorphic aesthetic consistent across all touchpoints
- Player 1 is always blue/amber, Player 2 is always purple/violet
