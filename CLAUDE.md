# LeadStack CRM Boilerplate

## Project Overview
A production-ready, all-in-one CRM boilerplate styled after GoHighLevel and HubSpot, scoped for small teams. Built as a teaching tool for a Claude Code course — students clone this template and extend it (add integrations, team seats, custom fields, workflows, etc.).

The boilerplate ships with every core surface already functional: contacts, pipeline, calendar, tasks, forms (with public hosted pages + iframe embed), reports, global search, and shared-sender email + SMS. All external dependencies are user-provided credentials; the repo contains no embedded secrets.

## Tech Stack
- **Framework:** Next.js 15 (App Router, Turbopack) with TypeScript
- **Auth:** Firebase Authentication (email/password) + `next-firebase-auth-edge` session cookies
- **Database:** Cloud Firestore (owner-scoped security rules)
- **Payments:** Stripe Checkout + Billing Portal + Webhooks
- **Email:** Resend (shared-sender, LeadStack owns the account; cost baked into plan price)
- **SMS:** Twilio (same shared-sender model)
- **Kanban:** `@dnd-kit/core` (draggable deals across stages)
- **Tables:** `@tanstack/react-table` (contacts list)
- **Styling:** Tailwind CSS v4 + shadcn/ui + Geist Sans + Instrument Serif (display accents)
- **Theming:** next-themes (light / dark / system)
- **Toasts:** sonner
- **Deployment:** Vercel

## Core Features (all shipped)
- **Contacts** — list + search, add/edit modal, profile with notes + unified activity timeline, CSV import/export
- **Pipeline / Kanban** — `@dnd-kit` 6-stage board (New → Contacted → Qualified → Proposal → Won / Lost), deal cards with value + days-in-stage, lost-reason prompt
- **Calendar** — manual events, month grid with click-to-add, optional contact linking, activity write on create
- **Tasks** — Today / Overdue / Upcoming / Done, due-today badge in sidebar, linkable to contacts
- **Forms** — drag-order field builder, 6 field types, `mapsTo` contact fields, public page at `/f/[id]`, iframe embed, auto-creates contact + optional deal on submit
- **Reports** — date-range KPIs, pipeline funnel, won-revenue area chart, leads-by-source donut, inline SVG (no chart library)
- **Cmd+K search** — global palette across contacts, deals, tasks, events, forms
- **Email + SMS** — from a contact profile, shared LeadStack sender with user's email on `Reply-To` so replies bypass the app
- **Billing** — Stripe checkout + customer portal + webhooks, Free / Pro / Scale plans
- **Settings** — profile edit, theme, subscription, CSV export, sign-out

## Project Structure
```
src/
  app/
    (auth)/              Login + Signup pages
    (dashboard)/         Protected CRM pages
      dashboard/         Home (KPIs + pipeline snapshot + recent activity)
      dashboard/settings Profile + subscription + data + account
      contacts/          List + [id] profile
      pipeline/          Kanban board
      calendar/          Month-grid event calendar
      tasks/             Task filter tabs
      forms/             Admin list + [id] builder
      reports/           Date-ranged analytics
    (legal)/             Terms of Service + Privacy Policy
    f/[formId]/          Public hosted form (unauthenticated)
    api/
      comms/email/send/  Send email (auth required, uses Resend)
      comms/sms/send/    Send SMS (auth required, uses Twilio)
      forms/[id]/submit/ Public form submission (unauthenticated)
      webhooks/stripe/   Stripe subscription webhook
      login/ logout/     Session cookie endpoints
  components/
    ui/                  shadcn/ui primitives
    auth/                Login + signup forms
    landing/             Marketing page (Hero, Pillars, Features, Pricing, etc.)
    dashboard/           Sidebar + Header (dynamic title + Cmd+K trigger)
    contacts/            Table, profile pieces, activity timeline, send-email/sms dialogs
    pipeline/            Board, deal card, new-deal + lost-reason dialogs
    calendar/            Month view + event dialog
    tasks/               Task item + task dialog
    forms/               Public form renderer
    reports/             SVG chart primitives
    search/              Cmd+K command palette
    settings/            (reserved for future integration panels)
  lib/
    firebase/            Client + admin SDK setup (admin uses "server-only" guard)
    stripe/              Checkout + customer portal + webhook handlers
    comms/               Resend + Twilio wrappers, route-auth + usage counter
    firestore/           CRUD helpers per collection (contacts, deals, tasks, events, forms, activities, users, mail)
    csv.ts               CSV parse + serialize + contact-field fuzzy matcher
    format.ts            Date / relative-time / currency formatters
    utils.ts             cn() class merger
  hooks/                 useAuth, useDueTodayCount, etc.
  context/               AuthContext provider
  types/                 Contacts, deals, events, tasks, forms, activities, UserDoc, SubscriptionStatus
  middleware.ts          Auth gating (next-firebase-auth-edge)
```

## Firestore Collections
| Collection | Owner-scoped | Notes |
|---|---|---|
| `users/{uid}` | yes | User profile + Stripe customer + subscription status |
| `contacts/{id}` | yes | Source of truth for a lead / customer |
| `contacts/{id}/notes/{id}` | inherits | Free-text notes |
| `contacts/{id}/activities/{id}` | inherits | Typed events (pipeline_moved, booking_created, task_completed, form_submitted, email_sent, sms_sent) |
| `deals/{id}` | yes | One contact → many deals; flat collection for cross-contact queries |
| `events/{id}` | yes | Calendar events, optional `contactId` link |
| `tasks/{id}` | yes | Todos, optional contact/deal/event links |
| `forms/{id}` | yes | Form config |
| `forms/{id}/submissions/{id}` | server-write-only | Inbound form submissions (admin SDK) |
| `usage/{uid}` | server-write-only, owner-read | Email + SMS send counters (for future plan quotas) |
| `mail/{id}` | server-only | Reserved for Firebase "Trigger Email" extension if enabled |

## Key Architecture
- **Firebase Client SDK** (`lib/firebase/client.ts`) — browser only
- **Firebase Admin SDK** (`lib/firebase/admin.ts`) — server only (`import "server-only"` guard)
- **Middleware** — protects every route except `PUBLIC_PATHS` (`/`, `/login`, `/signup`, `/terms`, `/privacy`, `/f/*`, `/api/forms/*`). Attaches `x-user-uid` + `x-user-email` to authenticated requests.
- **Comms routes** — `/api/comms/*` require auth; `requireUid()` + `requireContactOwner()` helpers in `lib/comms/route-auth.ts` enforce ownership before any send.
- **Public form submission** — `/api/forms/[id]/submit` uses admin SDK to bypass client-side Firestore rules; validates required fields, creates contact, optionally creates deal, writes `form_submitted` activity.
- **Activity timeline** — merges free-text notes + typed activities, sorted by `createdAt` desc. Icon + label mapped in `activity-timeline.tsx::activityVisuals()`.
- **Shared-sender comms** — user clicks Send email on a contact; Resend sends with `From: EMAIL_FROM` (verified LeadStack domain), `Reply-To: <user's email>`. Replies bypass LeadStack and land in the user's inbox.
- **Usage counters** — every `/send` bumps `usage/{uid}.email` / `.sms` + a `YYYY-MM` sub-bucket. No enforcement in MVP; hook for future plan-tier quotas.

## Commands
- `pnpm dev` — dev server (Turbopack)
- `pnpm build` — production build
- `pnpm start` — production server
- `pnpm lint` — ESLint
- `pnpm format` — Prettier
- `firebase deploy --only firestore:rules` — redeploy rules after any collection change

## Environment Variables

Every single credential is user-provided. Nothing ships embedded. Store in `.env.local` (local) or Vercel env vars (production). See `.env.example` for the template.

### Required for the app to boot
| Var | Source |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project Settings → Web app config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | same |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | same |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | same |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | same |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | same |
| `FIREBASE_ADMIN_PROJECT_ID` | Firebase Console → Project Settings → Service accounts → Generate key (JSON) |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | from service account JSON |
| `FIREBASE_ADMIN_PRIVATE_KEY` | from service account JSON (keep as single-line with `\n` escapes, wrapped in double quotes) |
| `COOKIE_SECRET_CURRENT` | `openssl rand -base64 32` |
| `COOKIE_SECRET_PREVIOUS` | same (different value) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` locally, your production URL in prod |

### Required for billing
| Var | Source |
|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys (test mode for dev) |
| `STRIPE_SECRET_KEY` | same |
| `STRIPE_WEBHOOK_SECRET` | `stripe listen --forward-to localhost:3000/api/webhooks/stripe` prints this |
| `STRIPE_PRO_PRICE_ID` | Stripe Dashboard → Product catalog → create "Pro Plan" at `$29/month` recurring, copy the `price_...` ID |

### Required for email (disables cleanly if missing)
| Var | Source |
|---|---|
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys |
| `EMAIL_FROM` | A sender on a Resend-verified domain, e.g. `"LeadStack <notifications@yourdomain.com>"` |

Without these two vars, `/api/comms/email/send` returns **503** and the Email button in the contact profile still renders but the send fails cleanly.

### Required for SMS (disables cleanly if missing)
| Var | Source |
|---|---|
| `TWILIO_ACCOUNT_SID` | [console.twilio.com](https://console.twilio.com) dashboard |
| `TWILIO_AUTH_TOKEN` | same |
| `TWILIO_FROM_NUMBER` | A phone number owned by the Twilio account (trial or purchased) |

Without these three, `/api/comms/sms/send` returns 503.

---

## Onboarding Guide (for Claude Code)

When a user asks you to help them set up this project, or if they seem new and haven't run the app yet, follow the procedure below. This is designed for beginners who may have never used a terminal before.

### Phase 1: Check Prerequisites

Run these checks automatically and report what's installed vs missing:

1. `git --version` — need 2.30+
2. `node --version` — need 18+
3. `pnpm --version` — install with `npm install -g pnpm` if missing
4. `firebase --version` — install with `npm install -g firebase-tools` if missing
5. `stripe --version` — optional, install with `winget install Stripe.StripeCLI` (Windows) or `brew install stripe/stripe-cli/stripe` (Mac) for local webhook testing

After installing anything new, remind the user to close and reopen the terminal so PATH updates.

### Phase 2: Install Dependencies

1. Run `pnpm install` from the project root
2. Verify `node_modules` was created

### Phase 3: Configure Environment

1. If `.env.local` does not exist, copy `.env.example` to `.env.local`.
2. Generate cookie secrets automatically and write them to `.env.local`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
   Run twice — paste results into `COOKIE_SECRET_CURRENT` and `COOKIE_SECRET_PREVIOUS`.
3. Set `NEXT_PUBLIC_APP_URL=http://localhost:3000`.

Then walk through each external service. For each, explain what the user does in the browser and what values to paste back. Write values directly into `.env.local` as they're supplied.

#### Firebase Client SDK
Tell the user:
> Go to https://console.firebase.google.com and create a project (or reuse one).
> Then Project Settings → Your apps → click the web icon (`</>`) and register a web app.
> You'll see a `firebaseConfig` object. Paste the whole object here and I'll extract the values.

When they paste, write into `.env.local`:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Then remind them to:
> Enable **Authentication → Sign-in method → Email/Password**.
> Create a **Firestore Database → Start in production mode** (our rules restrict access — test mode isn't needed).

#### Firebase Admin SDK
> Firebase Console → Project Settings → Service accounts → **Generate new private key**. Open the JSON file it downloads and paste the contents here.

Extract and write:
- `FIREBASE_ADMIN_PROJECT_ID` ← from `project_id`
- `FIREBASE_ADMIN_CLIENT_EMAIL` ← from `client_email`
- `FIREBASE_ADMIN_PRIVATE_KEY` ← from `private_key`, wrapped in double quotes in the env file (keep `\n` escapes literal — Node's `replace(/\\n/g, '\n')` unwraps them at runtime).

**Treat the JSON as a secret.** Don't save it in the repo, don't paste it in chat logs that are shared. After you've extracted the three fields, delete the downloaded JSON.

#### Deploy Firestore rules
The repo already has `.firebaserc` and `firebase.json` configured. Confirm the project in `.firebaserc` matches the user's Firebase project ID. If not, edit `.firebaserc` to match. Then run:
```bash
firebase login    # only on first setup
firebase deploy --only firestore:rules
```

This must be re-run whenever new collections are added or rules change.

#### Stripe
> Go to https://dashboard.stripe.com — make sure **Test mode** is ON (toggle top-right).
> Developers → API keys. Paste the publishable + secret keys here.

Write:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`

> Now create a product: Product catalog → **+ Add product**. Name it "Pro Plan", pricing **Recurring, $29/month** (to match the landing-page pricing). Save. Copy the Price ID (starts with `price_`) and paste here.

Write:
- `STRIPE_PRO_PRICE_ID`

Webhook secret (separate terminal):
```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
Copy the `whsec_...` that prints on start. Write to:
- `STRIPE_WEBHOOK_SECRET`

#### Resend (email)
> Go to https://resend.com, sign up, then **Domains → Add Domain**. Add DNS records to your domain's DNS provider, wait for verification (minutes to hours).
> Then **API Keys → Create API Key → Full access**. Paste the key here.

Write:
- `RESEND_API_KEY`
- `EMAIL_FROM` — must be on a verified domain. Example: `"LeadStack <notifications@yourdomain.com>"`.

If the user doesn't own a domain yet, they can still test with Resend's sandbox domain — `EMAIL_FROM="onboarding@resend.dev"` works for test sends but will be flagged as untrusted in production.

#### Twilio (SMS)
> Go to https://console.twilio.com, sign up (free trial gives a phone number + credits).
> From the dashboard, copy **Account SID** and **Auth Token**.
> Under **Phone Numbers → Manage → Active Numbers**, copy your trial or purchased number in E.164 format (`+15551234567`).

Write:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`

**Trial-account caveats:** Twilio trial accounts can only send to verified phone numbers and prepend a "Sent from a Twilio trial account" banner. For real usage, upgrade the account and (in the US) register A2P 10DLC.

### Phase 4: Start the App

1. Run `pnpm dev`.
2. Open http://localhost:3000.
3. Walk through verification:
   - **Landing page** renders at `/` — Hero, Features, Pricing, etc.
   - **Theme toggle** switches light/dark.
   - **Signup** at `/signup` creates a user. Check Firebase Console → Authentication that the user appears.
   - **Dashboard** renders at `/dashboard` showing the "Getting Started" empty state.
   - **Add a contact** → it appears in `/contacts`.
   - **Open a deal** on that contact → drag it across pipeline stages.
   - **Create a calendar event** linked to the contact → check the timeline.
   - **Create a form** → copy the public link → submit it in an incognito tab → verify a new contact appears.
   - **Cmd/Ctrl + K** opens global search.
   - **Send email** from the contact profile (requires Resend vars). Verify inbox + blue "Email sent" activity.
   - **Send SMS** from the contact profile (requires Twilio vars). Verify phone + violet "SMS sent" activity.
   - **Upgrade** from `/#pricing` → Stripe checkout with test card `4242 4242 4242 4242`.

### Phase 5: Deploy to Vercel (when ready)

1. Push to GitHub.
2. On https://vercel.com → Import repository.
3. Add **all** env vars from `.env.local` to Vercel → Project → Settings → Environment Variables.
4. For `FIREBASE_ADMIN_PRIVATE_KEY`, paste the full key including the `-----BEGIN/END-----` markers. Vercel handles the newlines automatically.
5. Deploy.
6. Update the Stripe webhook endpoint (Stripe dashboard → Webhooks) to point to `https://your-domain.vercel.app/api/webhooks/stripe` and copy the new signing secret into Vercel env vars.
7. Update `NEXT_PUBLIC_APP_URL` in Vercel env vars to the production URL.
8. Redeploy.

### Troubleshooting Tips

Common issues and fixes:
- **pnpm not found** — `npm install -g pnpm`, restart terminal.
- **Wrong directory** — make sure you're in the folder with `package.json`.
- **Blank page / 500 errors** — `.env.local` likely has a missing or malformed value. Read it; look for empty keys.
- **Auth not working** — in Firebase Console confirm Email/Password provider is enabled.
- **"Permission denied" in Firestore** — `firebase deploy --only firestore:rules` wasn't run, or `.firebaserc` points to the wrong project.
- **Port 3000 in use** — `pnpm dev -- -p 3001`.
- **Private key issues** — `FIREBASE_ADMIN_PRIVATE_KEY` must be in double quotes, with literal `\n` escapes (not real newlines).
- **Stripe webhook not firing** — `stripe listen` needs to be running in a second terminal for local testing.
- **Resend 403 at send time** — the `EMAIL_FROM` address is on a domain that isn't verified in Resend. Check Resend → Domains.
- **Twilio "unverified number" error** — trial accounts can only SMS phones you've verified in Twilio → Phone Numbers → Verified Caller IDs.
- **Comms buttons disabled** — contact has no email or no phone. Edit the contact, add the field, save.
- **Cmd+K doesn't open** — make sure you're on a `/dashboard` / `/contacts` / etc. page (not the public landing page).
