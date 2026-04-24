# Right of Entry Lock & Security

Marketing website for Right of Entry Lock & Security — a disabled veteran-owned locksmith and security services business serving Williamsburg, Toano, and James City County, VA.

**Stack:** Astro 6 · React 18 · Tailwind CSS v4 · TypeScript (strict) · GitHub Pages + Cloudflare Worker contact API

## Local development

### Prerequisites

- Node 20 LTS (use `nvm use` with the included `.nvmrc`)
- `gitleaks` for secret scanning pre-commit hook (`brew install gitleaks`)

### Setup

```bash
npm install
```

### Commands

| Command | Action |
|---|---|
| `npm run dev` | Start local dev server at `http://localhost:4321` |
| `npm run build` | Build production site to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run TypeScript strict-mode check (`tsc --noEmit`) |

### Security

All commits are scanned by a `gitleaks` pre-commit hook. If you do not have `gitleaks` installed, run:

```bash
brew install gitleaks
```

The hook blocks commits containing detected secrets. This is intentional — the repo is public.

The GitHub Actions `gitleaks.yml` workflow runs a server-side scan on every push as a second layer.

## Deployment

Pushes to `main` deploy to GitHub Pages via the Actions workflow in `.github/workflows/deploy.yml` (added in Story 1.2).

The site targets `https://rightofentrylock.com` once the custom domain is configured (Story 1.3).

The contact form backend is deployed separately as a Cloudflare Worker in [`workers/contact-form-handler`](./workers/contact-form-handler). Build-time configuration for the frontend endpoint uses `PUBLIC_CONTACT_FORM_ENDPOINT`.

Full setup steps for Cloudflare, Resend, and GitHub Actions secrets live in [`docs/contact-form-worker.md`](./docs/contact-form-worker.md).

## Maintenance mode

Site availability is controlled by [`src/content/site-settings.json`](./src/content/site-settings.json).

```json
{
  "site_enabled": "true"
}
```

Set `"site_enabled": "false"` to put the entire site into maintenance mode. In maintenance mode, the shared layout replaces all public routes with a branded maintenance screen and suppresses contact details, service-marketing content, and LocalBusiness structured data.

Because this Astro site is built as static output, changing the JSON value requires a rebuild and redeploy before the live site updates.

## Project plan

See `PLAN.md` for the full story-by-story build plan and `STYLE.md` for the design system and token reference.
