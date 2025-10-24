# Responsive Layout Visual Guide

## Desktop Layout (≥ 1280px) - NEW!

```
┌─────────────────────────────────────────────────────────────────┐
│ SIDEBAR (280px)  │           HEADER                             │
│                  ├──────────────────────────────────────────────┤
│ ┌─────────────┐ │                                               │
│ │   LOGO      │ │                                               │
│ └─────────────┘ │                                               │
│                  │                                               │
│ ┌─────────────┐ │          MAIN CONTENT AREA                   │
│ │🏠 Main      │ │     (Fills remaining space)                  │
│ └─────────────┘ │                                               │
│ ┌─────────────┐ │  ┌────────────┐  ┌────────────┐             │
│ │🎯 Sim/AI    │ │  │  Card 1    │  │  Card 2    │             │
│ └─────────────┘ │  └────────────┘  └────────────┘             │
│ ┌─────────────┐ │  ┌────────────┐  ┌────────────┐             │
│ │📚 Lessons   │ │  │  Card 3    │  │  Card 4    │             │
│ └─────────────┘ │  └────────────┘  └────────────┘             │
│ ┌─────────────┐ │                                               │
│ │🧮 Calc      │ │  (Scrolls if needed)                         │
│ └─────────────┘ │                                               │
│ ┌─────────────┐ │                                               │
│ │👤 Profile   │ │                                               │
│ └─────────────┘ │                                               │
│                  │                                               │
│  (Sidebar       │                                               │
│   scrolls if    │                                               │
│   needed)       │                                               │
└─────────────────┴───────────────────────────────────────────────┘

KEY FEATURES:
• 280px fixed left sidebar
• Full viewport width (100vw)
• Full viewport height (100vh)
• No bottom tab bar
• Multi-column grid layouts (2-4 columns)
• Hover effects enabled
```

## Tablet Layout (768px - 1279px)

```
┌──────────────────────────────────┐
│          HEADER                  │
├──────────────────────────────────┤
│                                  │
│                                  │
│        MAIN CONTENT              │
│    (Full width, scrollable)      │
│                                  │
│  ┌───────────┐  ┌───────────┐  │
│  │  Card 1   │  │  Card 2   │  │
│  └───────────┘  └───────────┘  │
│  ┌───────────┐  ┌───────────┐  │
│  │  Card 3   │  │  Card 4   │  │
│  └───────────┘  └───────────┘  │
│                                  │
│                                  │
│                                  │
├──────────────────────────────────┤
│    TAB BAR (Bottom Navigation)   │
│  🏠   🎯   📚   🧮   👤          │
└──────────────────────────────────┘

KEY FEATURES:
• Full width (100vw)
• Bottom tab bar navigation
• 2-column grids
• Touch-optimized
```

## Mobile Layout (< 768px)

```
┌─────────────────┐
│     HEADER      │
├─────────────────┤
│                 │
│  MAIN CONTENT   │
│  (Full width)   │
│                 │
│  ┌───────────┐ │
│  │  Card 1   │ │
│  └───────────┘ │
│  ┌───────────┐ │
│  │  Card 2   │ │
│  └───────────┘ │
│  ┌───────────┐ │
│  │  Card 3   │ │
│  └───────────┘ │
│                 │
│  (Scrolls)      │
│                 │
├─────────────────┤
│   TAB BAR       │
│  🏠 🎯 📚 🧮 👤 │
└─────────────────┘

KEY FEATURES:
• Full width (100vw)
• Single column layout
• Bottom tab bar
• Compact spacing
• 44px touch targets
```

## Navigation Behavior

### Desktop (≥ 1280px)
```
┌─────────────┐
│   SIDEBAR   │  ← Always visible
│             │  ← Fixed position
│  🏠 Active  │  ← Highlighted state
│  🎯         │
│  📚         │
│  🧮         │
│  👤         │
└─────────────┘

TAB BAR: Hidden (display: none)
```

### Mobile & Tablet (< 1280px)
```
SIDEBAR: Hidden (desktop only)

┌──────────────────────────────────┐
│     🏠      🎯      📚      🧮      👤     │  ← Always visible
│   Active                             │  ← At bottom
└──────────────────────────────────┘
```

## Screen Size Breakpoints

```
┌────────────────┬──────────────────────────────────────┐
│  Device Type   │  Width Range         │  Layout       │
├────────────────┼──────────────────────────────────────┤
│  Phone Small   │  < 480px            │  1 column     │
│  Phone Large   │  480px - 767px      │  1 column     │
│  Tablet Port   │  768px - 1023px     │  2 columns    │
│  Tablet Land   │  1024px - 1279px    │  2 columns    │
│  Desktop       │  1280px - 1599px    │  2-3 columns  │  ← SIDEBAR
│  Large Desktop │  1600px - 1919px    │  3-4 columns  │  ← SIDEBAR
│  Full HD+      │  ≥ 1920px           │  3-4 columns  │  ← SIDEBAR
└────────────────┴──────────────────────────────────────┘
```

## Grid Layout Transformations

### Home Screen Feature Links

**Mobile:**
```
┌──────────────┐
│   Card 1     │
├──────────────┤
│   Card 2     │
├──────────────┤
│   Card 3     │
├──────────────┤
│   Card 4     │
├──────────────┤
│   Card 5     │
└──────────────┘
```

**Desktop (1280px+):**
```
┌────────────┬────────────┐
│  Card 1    │  Card 2    │
├────────────┼────────────┤
│  Card 3    │  Card 4    │
├────────────┼────────────┤
│  Card 5    │            │
└────────────┴────────────┘
```

**Large Desktop (1600px+):**
```
┌─────────┬─────────┬─────────┐
│ Card 1  │ Card 2  │ Card 3  │
├─────────┼─────────┼─────────┤
│ Card 4  │ Card 5  │         │
└─────────┴─────────┴─────────┘
```

### Simulator Split View

**Mobile:**
```
┌──────────────┐
│              │
│  Simulator   │
│              │
├──────────────┤
│              │
│   Play AI    │
│              │
└──────────────┘
```

**Desktop:**
```
┌──────────┬──────────┐
│          │          │
│Simulator │ Play AI  │
│          │          │
└──────────┴──────────┘
```

### Lessons Layout

**Mobile:**
```
┌──────────────┐
│ Foundations  │
├──────────────┤
│ Instruments  │
├──────────────┤
│   Market     │
├──────────────┤
│  Practical   │
└──────────────┘
```

**Desktop (1280px+):**
```
┌────────────┬────────────┐
│Foundations │Instruments │
├────────────┼────────────┤
│   Market   │ Practical  │
└────────────┴────────────┘
```

**Large Desktop (1920px+):**
```
┌──────┬──────┬──────┬──────┐
│Found │Instr │Market│Pract │
└──────┴──────┴──────┴──────┘
```

## Device Detection Classes

The following classes are automatically added to `<html>` and `<body>`:

```css
/* Device Type */
.device-mobile
.device-tablet  
.device-desktop

/* Screen Size */
.device-small-mobile        /* < 480px */
.device-medium-mobile       /* 480-767px */
.device-tablet-portrait     /* 768-1023px */
.device-tablet-landscape    /* 1024-1279px */
.device-desktop-small       /* 1280-1599px */
.device-desktop-medium      /* 1600-1919px */
.device-desktop-large       /* ≥ 1920px */

/* Orientation */
.orientation-portrait
.orientation-landscape
```

## Key CSS Breakpoint

The most important breakpoint is **1280px** - this is where:
- ✅ Sidebar navigation appears
- ❌ Bottom tab bar disappears
- ✅ Multi-column grids activate
- ✅ Desktop-optimized spacing applies

```css
@media (min-width: 1280px) {
  /* Desktop sidebar layout */
  .app {
    display: grid;
    grid-template-columns: 280px 1fr;
  }
  
  .sidebar {
    display: flex; /* Show sidebar */
  }
  
  .tabbar {
    display: none; /* Hide tab bar */
  }
}
```

## Viewport Usage

### Before (Old Design):
```
Desktop (1920px wide):
[    empty    ] [ 420px app ] [    empty    ]
      ↑              ↑              ↑
   wasted         content        wasted
```

### After (New Design):
```
Desktop (1920px wide):
[ 280px sidebar ][ full-width content        ]
       ↑                    ↑
  navigation          fills entire space
```

**Result:** 100% viewport utilization on all devices!
