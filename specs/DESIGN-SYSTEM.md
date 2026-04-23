# RC Operator Signals — Design System

## Brand Colors

### RevenueCat Brand
- **RC Pink/Red (primary):** `#EE5A60`
- **RC Pink Dark (hover/pressed):** `#D94A50`
- **RC Pink Light (bg tint):** `#FEF2F2`

### Neutrals
- **Ink:** `#0F1419`
- **Ink Soft:** `#3B4252`
- **Ink Muted:** `#64748B`
- **Ink Light:** `#94A3B8`
- **Border:** `#E5E7EB`
- **Border Soft:** `#F1F2F4`
- **Surface:** `#FFFFFF`
- **Background:** `#FAFAFA`

### Dark Mode
- **Ink:** `#E2E8F0`
- **Ink Soft:** `#CBD5E1`
- **Ink Muted:** `#94A3B8`
- **Ink Light:** `#64748B`
- **Border:** `#334155`
- **Border Soft:** `#1E293B`
- **Surface:** `#1E293B`
- **Background:** `#0F172A`

### Semantic
- **Positive:** `#059669` (light) / `#34D399` (dark)
- **Negative:** `#DC2626` (light) / `#F87171` (dark)
- **Warning:** `#D97706` (light) / `#FBBF24` (dark)
- **Info:** `#0E78A6` (light) / `#38BDF8` (dark)

### Chart Palette (ordered)
1. `#EE5A60` (RC pink — primary series)
2. `#0E78A6` (blue — secondary)
3. `#059669` (green — positive)
4. `#8B5CF6` (purple — tertiary)
5. `#D97706` (amber — warning)
6. `#64748B` (grey — neutral)

## Typography

- **Font stack:** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- **Mono:** `"JetBrains Mono", "SF Mono", "Fira Code", monospace`
- **Numeric:** `font-feature-settings: 'tnum'` on all numbers

### Scale
| Token | Size | Weight | Use |
|-------|------|--------|-----|
| `--text-xs` | 11px | 400–500 | Chip labels, badges |
| `--text-sm` | 12.5px | 400–500 | Subtitles, captions, axis labels |
| `--text-base` | 14px | 400 | Body, signal detail |
| `--text-md` | 15px | 500–600 | Card titles, nav items |
| `--text-lg` | 18px | 600 | Section headers |
| `--text-xl` | 22px | 600 | KPI values |
| `--text-2xl` | 26px | 600 | Page titles |
| `--text-hero` | 32px | 700 | Hero metric |

## Spacing

- Base unit: `4px`
- Scale: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`
- Card padding: `16px 18px` (compact) / `20px 24px` (standard)
- Section gap: `24px`
- Page padding: `32px 40px`

## Radius

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | 6px | Chips, badges, pills |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards, modals |
| `--radius-xl` | 16px | Hero sections |
| `--radius-full` | 999px | Avatars, dots |

## Shadows

- **Subtle:** `0 1px 2px rgba(15, 23, 42, 0.04)`
- **Card:** `0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)`
- **Elevated:** `0 4px 12px rgba(15, 23, 42, 0.08)`
- **Modal:** `0 12px 40px rgba(15, 23, 42, 0.15)`

## Sidebar

- **Expanded width:** `220px`
- **Collapsed width:** `56px`
- Transition: `width 200ms ease`
- Icons: 18×18px, `stroke-width: 1.75`
- Active state: `background: var(--rc-pink-light); color: var(--rc-pink);`
- Collapsed: icons only, tooltip on hover

## Dark Mode

- Toggle via `<html data-theme="dark">` class
- All colors via CSS custom properties
- Charts: lighter stroke, darker grid
- User preference: `prefers-color-scheme` media query as default, manual toggle persisted in `localStorage`
