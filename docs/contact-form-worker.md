# Contact Form Worker Setup

This story keeps the marketing site on GitHub Pages and deploys the form backend separately to Cloudflare Workers. The frontend posts to `PUBLIC_CONTACT_FORM_ENDPOINT`, which should point at the Worker path `/api/contact`.

## 1. Resend setup

1. Create or log in to your Resend account.
2. Add a sending domain. Use a dedicated subdomain such as `mail.rightofentrylock.com` or `notify.rightofentrylock.com`.
3. If your DNS is on Cloudflare, use Resend's Cloudflare auto-connect flow. If you prefer manual setup, copy the SPF and DKIM records Resend gives you into Cloudflare DNS.
4. Add a DMARC TXT record after SPF and DKIM are passing. Start with a monitoring policy such as `v=DMARC1; p=none; rua=mailto:dmarc@rightofentrylock.com;`.
5. Wait until the domain shows as verified in Resend.
6. Create an API key with send access.

Recommended values for this project:

- `FROM_EMAIL`: `Right of Entry Lock & Security <website@mail.rightofentrylock.com>`
- `TO_EMAIL`: the business inbox that should receive submissions

## 2. Cloudflare Worker setup

1. Make sure the production domain is managed in Cloudflare.
2. In the repo, install the worker toolchain:

```bash
cd workers/contact-form-handler
npm install
```

3. Authenticate Wrangler:

```bash
npx wrangler login
```

4. Create the production and preview KV namespaces used for rate limiting:

```bash
npx wrangler kv namespace create RATE_LIMITS
npx wrangler kv namespace create RATE_LIMITS --preview
```

5. Copy the returned namespace IDs into [workers/contact-form-handler/wrangler.toml](/Users/interlinked/Projects/locksmith/workers/contact-form-handler/wrangler.toml).
6. Set the Worker secrets:

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TO_EMAIL
npx wrangler secret put FROM_EMAIL
```

7. Review the committed non-secret Worker vars:

- `ALLOWED_ORIGINS` in `wrangler.toml` should include:
  - `https://rightofentrylock.com`
  - `https://www.rightofentrylock.com`
  - `https://dad2jrn.github.io`
  - `http://localhost:4321`
- Add or remove origins there if your preview/build URLs differ.

8. Deploy the worker:

```bash
npx wrangler deploy
```

9. Record the Worker URL and confirm `POST https://<worker-host>/api/contact` is reachable.

Recommended production endpoint options:

- Quickest: `https://contact-form-handler.<your-subdomain>.workers.dev/api/contact`
- Cleaner production setup: add a Worker custom domain such as `https://contact.rightofentrylock.com/api/contact`

If you use a custom domain, add it in Cloudflare under `Workers & Pages` -> your worker -> `Settings` -> `Domains & Routes` -> `Add Custom Domain`.

## 3. GitHub configuration

### Repository variables

Set this repository variable so the Astro build knows where to post:

- `PUBLIC_CONTACT_FORM_ENDPOINT`: full HTTPS URL ending in `/api/contact`

Example:

```text
https://contact.rightofentrylock.com/api/contact
```

### Repository secrets

Add these repository secrets in GitHub under `Settings` -> `Secrets and variables` -> `Actions`:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_WORKER_RESEND_API_KEY`
- `CLOUDFLARE_WORKER_TO_EMAIL`
- `CLOUDFLARE_WORKER_FROM_EMAIL`

The workflow in [.github/workflows/deploy-contact-worker.yml](/Users/interlinked/Projects/locksmith/.github/workflows/deploy-contact-worker.yml) uses those secrets to deploy the worker and push the Worker secrets into Cloudflare.

### Frontend build workflow

The GitHub Pages workflow should expose `PUBLIC_CONTACT_FORM_ENDPOINT` during the site build. Without that variable, the form falls back to `/api/contact`, which only works if the site and API are served from the same origin.

## 4. Verification checklist

1. Submit the live contact form from `http://localhost:4321/contact` after setting `PUBLIC_CONTACT_FORM_ENDPOINT` locally, or from the deployed site after the next Pages build.
2. Confirm the Worker returns `{ "success": true }`.
3. Confirm the email reaches the inbox configured in `TO_EMAIL`.
4. Confirm a honeypot submission returns `200` and does not send mail.
5. Submit 11 times from the same IP within an hour and confirm the 11th response is `429`.

## 5. Local development

For local Astro work, point the frontend at the deployed Worker:

```bash
PUBLIC_CONTACT_FORM_ENDPOINT="https://contact.rightofentrylock.com/api/contact" npm run dev
```

If you want to run the Worker locally too:

```bash
cd workers/contact-form-handler
npm run dev
```

Then point Astro at the local Worker URL printed by Wrangler.
