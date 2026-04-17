# Design Tokens Reference

All tokens live in `src/styles/globals.css` under a single `@theme` block. Tailwind v4 exposes them as utility classes automatically (e.g. `--color-ink` → `bg-ink`, `text-ink`, `border-ink`).

**Source of truth:** `STYLE.md` (which supersedes `PLAN.md` on all token values).

---

## Colors

| Token | Value | Purpose |
|---|---|---|
| `--color-ink` | `#0F1419` | Primary text, primary button bg, deep section bg |
| `--color-ink-soft` | `#3A4148` | Lead copy, nav links at rest, card body copy |
| `--color-muted` | `#6B7278` | Eyebrows, metadata, captions, descriptions |
| `--color-line` | `#E5E3DD` | Hairline borders, dividers (1px only) |
| `--color-paper` | `#FAF9F6` | Page background (warm off-white) |
| `--color-surface` | `#FFFFFF` | Card / panel backgrounds on paper |
| `--color-accent` | `#B8863A` | Brass — divider line, hero `<em>`, "text us" button |
| `--color-accent-dark` | `#8A6428` | Brass on paper — eyebrows, service numbers |
| `--color-live` | `#5FD97C` | The 6×6 green dot in the phone CTA pill only |
| `--color-emergency` | `#B13B2E` | Reserved; not used as a button variant |
| `--color-success` | `#3B7A3F` | Form success messages |
| `--color-paper-60` | `rgb(250 249 246 / 0.6)` | Secondary text on ink surfaces |
| `--color-paper-15` | `rgb(255 255 255 / 0.15)` | Dividers on ink surfaces |

---

## Typography

### Font stacks

| Token | Stack | Used for |
|---|---|---|
| `--font-sans` | Inter Variable → Inter → system-ui | Body, nav, buttons, eyebrows |
| `--font-display` | Cal Sans → Satoshi Variable → Inter | H1, H2 only |
| `--font-mono` | SF Mono → Menlo → Cascadia Code | Browser URL pill mockup only |

### Type scale

| Token | Value | Used for |
|---|---|---|
| `--text-9` | 0.5625rem | Logo subtitle |
| `--text-10` | 0.625rem | Hero badge |
| `--text-11` | 0.6875rem | Eyebrows, hero tag, trust descriptions, service numbers |
| `--text-12` | 0.75rem | Browser URL, "Learn more →", cta-strip sub |
| `--text-13` | 0.8125rem | Nav links, buttons, service body, cta-phone |
| `--text-14` | 0.875rem | Services-head description, logo-caption h3 |
| `--text-15` | 0.9375rem | Body default, logo name |
| `--text-16` | 1rem | Hero lead paragraph |
| `--text-18` | 1.125rem | Service card H3 |
| `--text-22` | 1.375rem | Trust metric numbers |
| `--text-28` | 1.75rem | Section titles, cta-strip big-phone |
| `--text-32` | 2rem | CTA strip H2 |
| `--text-36` | 2.25rem | Services-head H2 |
| `--text-52` | 3.25rem | Hero H1 |

### Letter-spacing

| Token | Value | Used for |
|---|---|---|
| `--tracking-hero` | -0.029em | 52px hero H1 |
| `--tracking-h2` | -0.022em | 36px services H2 |
| `--tracking-h2-sm` | -0.016em | 32px cta-strip H2 and 28px titles |
| `--tracking-h3` | -0.017em | 18px service H3 |
| `--tracking-logo` | -0.013em | 15px logo name |
| `--tracking-button` | 0.023em | 13px button labels |
| `--tracking-caps-1` | 0.083em | 12px caps labels |
| `--tracking-caps-2` | 0.167em | 11px eyebrows |
| `--tracking-caps-3` | 0.273em | 11px section labels, hero tag (widest) |

### Line-heights

| Token | Value | Used for |
|---|---|---|
| `--leading-hero` | 1.05 | H1 |
| `--leading-display` | 1.15 | H2s |
| `--leading-tight` | 1.2 | CTA strip H2 |
| `--leading-body` | 1.6 | Body, lead copy, service cards |
| `--leading-snug` | 1.5 | Logo caption, small card copy |
| `--leading-note` | 1.55 | Notes section paragraphs |

---

## Spacing

| Token | Value | Used for |
|---|---|---|
| `--spacing-section` | 6rem (96px) | Hero bottom, services top, cta-strip |
| `--spacing-section-lg` | 5.5rem (88px) | Hero top, services full |
| `--spacing-section-md` | 4.5rem (72px) | Brand-section, mockup-wrapper bottom margin |
| `--spacing-section-sm` | 3rem (48px) | Section-title bottom margin |

Mobile: multiply each by 0.7 (round to nearest 0.25rem).

---

## Radii

| Token | Value | Used for |
|---|---|---|
| `--radius-sharp` | 2px | Buttons, phone CTA pill |
| `--radius-card` | 4px | Cards: logo-card, service, note, browser-url |
| `--radius-frame` | 8px | Large framing: mockup-wrapper only |

Never use Tailwind defaults like `rounded-lg` or `rounded-xl` directly.

---

## Container

| Token | Value |
|---|---|
| `--container-max` | 1200px |
| `--container-px` | 2rem (32px desktop; 1rem mobile) |

---

## Component utilities (defined in `@layer components`)

| Class | Purpose |
|---|---|
| `.card` | White surface with line border, card radius |
| `.card-dark` | Ink surface for dark logo card |
| `.service-cell` | Service grid cell (no individual radius; grid owns hairlines) |
| `.field-label` | Form label above input |
| `.field-input` / `.field-textarea` / `.field-select` | Form controls with hover/focus states |
| `.field-error` | Inline validation error message |
| `.field-success` | Form success message |
| `.field-honeypot` | Offscreen spam trap (not `display:none`) |
| `.skip-link` | Accessible skip-to-content (reveals on focus) |
| `.prose-brand` | Tailwind Typography overrides for brand colors |
