# LeadStack CRM Boilerplate

A production-ready, all-in-one CRM boilerplate styled after GoHighLevel and HubSpot. Built with Next.js 15, Firebase, Stripe, Resend, Twilio, and Tailwind CSS.

Ships with every core surface already functional — Contacts, Pipeline (drag-drop Kanban), Calendar, Tasks, Forms (with public hosted pages + iframe embed), Reports, Cmd+K global search, and email + SMS send from a contact profile.

## Tech Stack

- **Next.js 15** — App Router, Server Actions, TypeScript, Turbopack
- **Firebase** — Authentication + Cloud Firestore + Admin SDK
- **Stripe** — Subscription billing + Customer Portal + Webhooks
- **Resend** — Shared-sender email with user's email on `Reply-To`
- **Twilio** — Shared-sender SMS with segment counting
- **@dnd-kit** — Kanban drag-drop
- **@tanstack/react-table** — Contacts table
- **Tailwind CSS v4** + **shadcn/ui** — Themed with Geist Sans + Instrument Serif
- **Vercel** — One-click deployment

## What's Included

| Surface | What it does |
|---|---|
| Landing page | Marketing site (Hero, Pillars, Features, Pricing, FAQ, CTA) |
| Auth | Email/password signup + login + session cookies |
| Dashboard | Live KPIs, pipeline snapshot, recent activity, quick actions |
| Contacts | List + search, CRUD, notes + activity timeline, CSV import/export |
| Pipeline | 6-stage Kanban, drag-drop deals, lost-reason prompt |
| Calendar | Month grid, manual events, optional contact link |
| Tasks | Today / Overdue / Upcoming / Done tabs, due-today badge |
| Forms | Drag-order builder, 6 field types, public `/f/[id]`, iframe embed |
| Reports | Date-ranged KPIs, pipeline funnel, won-revenue + leads charts |
| Global search | Cmd/Ctrl + K across contacts, deals, tasks, events, forms |
| Email | From contact profile via Resend, replies routed to the user |
| SMS | From contact profile via Twilio, segment counter |
| Billing | Stripe checkout + billing portal + webhooks, Free / Pro / Scale plans |
| Settings | Profile, theme, subscription, CSV export, sign-out |

## Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project
- A Stripe account (test mode is fine for development)
- A Resend account + a verified sending domain (optional — email disables gracefully if missing)
- A Twilio account + a phone number (optional — SMS disables gracefully if missing)

## Getting Started

### 1. Use this Template

Click the green **"Use this template"** button on GitHub, then clone your new repo:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Fill in every value in `.env.local`. See the [setup sections](#firebase-setup) below for where each value comes from.

### 4. Deploy Firestore Rules

The repo ships with owner-scoped `firestore.rules`. After configuring `.firebaserc` to point at your Firebase project, deploy them:

```bash
firebase login
firebase deploy --only firestore:rules
```

Rerun this whenever you add a new collection.

### 5. Start Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Firebase Setup

1. [Firebase Console](https://console.firebase.google.com/) → create a project.
2. **Authentication → Sign-in method** → enable **Email/Password**.
3. **Firestore Database → Create** (production mode — the repo's rules restrict access).
4. **Project Settings → Your apps** → register a web app. Copy the config object values into `NEXT_PUBLIC_FIREBASE_*` env vars.
5. **Project Settings → Service accounts** → **Generate new private key**. Open the downloaded JSON and copy:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY` (wrap in double quotes in the env file; keep `\n` escapes literal)

## Stripe Setup

1. [Stripe Dashboard](https://dashboard.stripe.com/) — flip **Test mode** on.
2. **Developers → API keys**:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
3. **Product catalog → + Add product** — name "Pro Plan", pricing **Recurring, $29/month** (matches the landing page). Copy the Price ID (`price_...`) into `STRIPE_PRO_PRICE_ID`.
4. For local webhook testing (separate terminal):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Copy the `whsec_...` printed on start → `STRIPE_WEBHOOK_SECRET`.

## Email (Resend) Setup

1. [resend.com](https://resend.com) → sign up.
2. **Domains → Add Domain** — add DNS records at your domain provider, wait for verification.
3. **API Keys → Create** → `RESEND_API_KEY`.
4. Set `EMAIL_FROM` to a sender on the verified domain, e.g. `"LeadStack <notifications@yourdomain.com>"`.

Without these two vars, `/api/comms/email/send` returns `503` and the Email button on the contact profile fails with a clear error.

## SMS (Twilio) Setup

1. [console.twilio.com](https://console.twilio.com) → sign up (free trial gives a phone number + credits).
2. Copy from the dashboard:
   - Account SID → `TWILIO_ACCOUNT_SID`
   - Auth Token → `TWILIO_AUTH_TOKEN`
3. **Phone Numbers → Manage → Active Numbers** → copy your number in E.164 format → `TWILIO_FROM_NUMBER`.

**Trial caveats:** Twilio trial accounts can only SMS verified numbers and prepend a trial banner to every message. For production, upgrade and (in the US) register A2P 10DLC.

## Cookie Secrets

Generate secrets for the `next-firebase-auth-edge` middleware:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Run twice. Put the two values in `COOKIE_SECRET_CURRENT` and `COOKIE_SECRET_PREVIOUS`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with Turbopack |
| `pnpm build` | Create production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |
| `firebase deploy --only firestore:rules` | Push rules to Firebase |

## Project Structure

```
src/
├── app/
│   ├── (auth)/            Login + Signup
│   ├── (dashboard)/       Protected CRM pages (dashboard, contacts, pipeline, calendar, tasks, forms, reports, settings)
│   ├── (legal)/           Terms + Privacy
│   ├── f/[formId]/        Public hosted form page
│   └── api/
│       ├── comms/         /email/send, /sms/send  (auth-required)
│       ├── forms/[id]/    /submit  (unauthenticated)
│       ├── webhooks/      Stripe
│       └── login/logout/  Session cookies
├── components/
│   ├── ui/                shadcn/ui primitives
│   ├── auth/ landing/ dashboard/
│   ├── contacts/ pipeline/ calendar/ tasks/ forms/ reports/
│   └── search/            Cmd+K palette
├── lib/
│   ├── firebase/          Client + admin SDK
│   ├── stripe/            Checkout + portal + webhooks
│   ├── comms/             Resend + Twilio wrappers, route-auth, usage counter
│   ├── firestore/         CRUD helpers per collection
│   ├── csv.ts format.ts utils.ts
├── hooks/                 useAuth, useDueTodayCount
├── context/               AuthContext
├── types/                 Per-domain TypeScript types
└── middleware.ts          Auth gating
```

## Firestore Collections

All collections are **owner-scoped** via `firestore.rules`:

| Collection | Notes |
|---|---|
| `users/{uid}` | Profile + Stripe customer + subscription |
| `contacts/{id}` | + `notes/` and `activities/` subcollections |
| `deals/{id}` | One contact → many deals |
| `events/{id}` | Calendar events |
| `tasks/{id}` | Todos |
| `forms/{id}` | + `submissions/` subcollection (server-write-only) |
| `usage/{uid}` | Email + SMS send counters (server-write-only, owner-read) |
| `mail/{id}` | Reserved for Firebase "Trigger Email" extension |

## Deployment to Vercel

1. Push your repo to GitHub.
2. [vercel.com](https://vercel.com) → Import your repository.
3. Add **every** env var from `.env.local` to Vercel → Project Settings → Environment Variables.
4. For `FIREBASE_ADMIN_PRIVATE_KEY` on Vercel, paste the full key including the `-----BEGIN/END-----` markers. Vercel handles newlines.
5. Deploy.
6. **Stripe webhook**: in the Stripe dashboard point the webhook to `https://your-domain.vercel.app/api/webhooks/stripe` and copy the new signing secret back into Vercel env vars.
7. Update `NEXT_PUBLIC_APP_URL` to the production URL and redeploy.

## Security Notes

- The repo contains **zero embedded secrets**. Every credential is user-provided via env vars.
- `firestore.rules` enforces owner-scoped access on every collection.
- Admin SDK is `import "server-only"`-guarded so it never leaks into the client bundle.
- Comms routes (`/api/comms/*`) verify both session auth and contact ownership before every send.
- Form submission API (`/api/forms/[id]/submit`) is the only unauthenticated write path; it uses the admin SDK to bypass rules and validates the form exists + is enabled before writing.

## License

MIT
