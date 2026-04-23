# LeadStack CRM Setup Guide

This guide maps to **Modules 1–5** of the course. By the end of Module 5, your LeadStack CRM will be fully running locally and deployed live. Module 6 is where you extend LeadStack for your own use case.

**Claude Code handles most of the setup for you.** Once you have VS Code, the Claude Code extension, and the repo cloned (Module 1), just open the Claude Code chat panel and type `help me set up this project`. It will guide you through the rest.

The sections below explain what happens at each module, in case you want to understand the details or troubleshoot.

---

## Table of Contents

- [Module 1: Getting Started](#module-1-getting-started)
- [Module 2: Preparing the Environment](#module-2-preparing-the-environment)
- [Module 3: The Backend](#module-3-the-backend)
- [Module 4: Payments + Comms](#module-4-payments--comms)
- [Module 5: Run Locally + Push to Live](#module-5-run-locally--push-to-live)
- [Troubleshooting](#troubleshooting)

---

## Module 1: Getting Started

*Install Tools, Clone, Claude Code*

### Step 1 — Get your boilerplate copy

Before writing a single line of code, you need your own copy of the LeadStack CRM boilerplate.

**1. Create a free GitHub account**

GitHub is where your code lives. You need a free account to receive and store your copy of the boilerplate.

Sign up at [github.com](https://github.com)

1. Enter your email address and choose a password
2. Pick a username — this will be public, keep it professional
3. Verify your email when prompted
4. You can skip all the optional setup steps

**2. Send your GitHub username to Ben**

Once you have your account, DM your GitHub username to Ben so you can be granted access to the private repo.

### Step 2 — Install your tools

You need two things: VS Code (your code editor) and Claude Code (your AI coding assistant). Once these are installed, Claude Code will handle everything else.

**1. Install VS Code**

Download it at [code.visualstudio.com](https://code.visualstudio.com)

1. Click **Download for Windows** (or Mac)
2. Run the installer — accept all defaults
3. Open VS Code when it's done

**2. Install the Claude Code extension**

1. In VS Code, click the Extensions icon in the left sidebar (or press `Ctrl+Shift+X`)
2. Search for **Claude Code**
3. Click **Install** on the one by Anthropic
4. You'll need an Anthropic account — create one at [console.anthropic.com](https://console.anthropic.com) if you don't have one
5. Follow the prompts to sign in

**3. Open the project**

1. In VS Code, press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type **"Clone Git Repository"** and select it
3. Paste your repo URL — this is the URL of your own copy from Step 1, found on your GitHub profile
4. Pick a folder (e.g., Documents) and click **Select as Repository Destination**
5. When prompted, click **Open** to open the project

> **If the clone fails**, make sure you've completed Step 1 and accepted the GitHub invitation from Ben — then try again.

**4. Let Claude Code set everything up**

1. Open the Claude Code chat panel in VS Code
2. Type:

```
help me set up this project
```

3. Claude Code reads the project's `CLAUDE.md` file and will:
   - Check if Git, Node.js, pnpm, and the Firebase CLI are installed (and install what's missing)
   - Install the project dependencies
   - Create your environment config file
   - Walk you through setting up Firebase, Stripe, Resend, and Twilio — one at a time
   - Deploy the Firestore security rules to your Firebase project
   - Start the app when everything's ready

Just follow along — Claude Code will tell you exactly what to do at each step and where to go in your browser. When it asks you to paste something, paste it right into the chat.

---

## Module 2: Preparing the Environment

*Dependencies, Environment Config, Secrets*

**What Claude Code does automatically (no input needed):**

- Checks if Git, Node.js, pnpm, and the Firebase CLI are installed — installs what's missing
- Runs `pnpm install` to install project dependencies
- Creates `.env.local` from `.env.example` if it doesn't exist
- Generates two cookie secrets and writes them to `.env.local`
- Sets `NEXT_PUBLIC_APP_URL=http://localhost:3000`

### All config ends up in `.env.local`

Every value is written into a single file: **`.env.local`**. Nothing is hidden in other config files. If you ever need to check or change a value, that's the only place to look.

**This file is safe and private.** The `.gitignore` ignores all `.env*` files except `.env.example` (which only has empty placeholders). Your keys and secrets will never be committed to GitHub.

### Cookie Secrets

Claude Code generates these automatically. If you ever need to regenerate manually:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Run it twice — one for `COOKIE_SECRET_CURRENT`, one for `COOKIE_SECRET_PREVIOUS`.

---

## Module 3: The Backend

*Firebase — Auth + Database + Security Rules*

Claude Code will prompt you for values from Firebase. Here's what you'll do in your browser:

### Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Sign in with a Google account
3. Click **"Create a project"** — name it whatever you like (e.g., `leadstack-app`)
4. You can disable Google Analytics (not needed)
5. Click **"Create project"** and wait for it to finish

### Firebase Client Config

Where to find it: Firebase Console > Project Settings (gear icon) > Your apps > Web app

If you haven't registered a web app yet:
1. Click the web icon (`</>`)
2. Enter a nickname (e.g., `leadstack-web`)
3. Skip Firebase Hosting setup
4. Click **Register app**

You'll see a `firebaseConfig` object like this:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

Paste the whole thing to Claude Code. It maps to these `.env.local` values:

| Config key | Env variable |
|-----------|-------------|
| `apiKey` | `NEXT_PUBLIC_FIREBASE_API_KEY` |
| `authDomain` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |
| `storageBucket` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `NEXT_PUBLIC_FIREBASE_APP_ID` |

### Firebase Admin (Service Account)

Where to find it: Firebase Console > Project Settings > Service accounts > Generate new private key

This downloads a JSON file. Open it and paste the contents to Claude Code. It extracts:

| JSON key | Env variable |
|---------|-------------|
| `project_id` | `FIREBASE_ADMIN_PROJECT_ID` |
| `client_email` | `FIREBASE_ADMIN_CLIENT_EMAIL` |
| `private_key` | `FIREBASE_ADMIN_PRIVATE_KEY` |

**Important:** The private key in `.env.local` must be wrapped in double quotes with `\n` for newlines.

**Treat the JSON as a secret.** After Claude Code has extracted the three fields, delete the downloaded JSON.

### Enable Auth & Create Firestore

These are quick toggles in the Firebase Console:

**Authentication:**
1. Click **Authentication** in the sidebar > **Get started**
2. Enable **Email/Password** (toggle on, save)

**Firestore:**
1. Click **Firestore Database** in the sidebar > **Create database**
2. Select **Start in production mode** — LeadStack ships with strict owner-scoped rules we deploy in the next step, so you don't need test mode
3. Pick the closest server location > **Enable**

### Deploy Firestore Security Rules

LeadStack's `firestore.rules` enforces that every user can only read/write their own data. Claude Code will deploy these rules for you after you've connected Firebase:

```bash
firebase login
firebase deploy --only firestore:rules
```

The repo already includes `.firebaserc` and `firebase.json` — Claude Code will update `.firebaserc` to point at your project ID if needed.

> **Rerun `firebase deploy --only firestore:rules` any time you add a new Firestore collection.**

---

## Module 4: Payments + Comms

*Stripe for billing, Resend for email, Twilio for SMS*

Claude Code will prompt you for these values next.

### Stripe API Keys

Where to find them: Stripe Dashboard > Developers > API keys (make sure Test mode is ON)

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com) and create an account if you haven't
2. Make sure **Test mode** is ON (toggle in the top-right corner)
3. Go to Developers > API keys

| Key | Env variable |
|-----|-------------|
| Publishable key (`pk_test_...`) | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Secret key (`sk_test_...`) | `STRIPE_SECRET_KEY` |

### Stripe Product & Price

1. Stripe Dashboard > Product catalog > **+ Add product**
2. Name: `Pro Plan` (or whatever you like)
3. Pricing: **Recurring**, $29/month (to match the pricing on the landing page)
4. Save, then copy the **Price ID** (`price_...`)

| Value | Env variable |
|-------|-------------|
| Price ID | `STRIPE_PRO_PRICE_ID` |

### Stripe Webhook Secret (for local testing)

1. Open a **separate terminal** (keep your main terminal free)
2. Run `stripe login` — a browser window opens, click **Allow access**
3. Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Copy the webhook signing secret (`whsec_...`)

| Value | Env variable |
|-------|-------------|
| Signing secret | `STRIPE_WEBHOOK_SECRET` |

**Keep that terminal running** while testing payments locally.

> **Don't have Stripe CLI?** Claude Code can install it for you, or run `winget install Stripe.StripeCLI` (Windows) and restart your terminal.

### Resend (Email)

LeadStack uses [Resend](https://resend.com) as its email sender. This is the "shared-sender" model — you own the Resend account, your LeadStack users send email from your verified domain, and their email address lands on the `Reply-To:` header so replies bypass LeadStack and go straight to them.

1. Go to [https://resend.com](https://resend.com) and create an account
2. Go to **Domains → Add Domain** and add your sending domain. You'll get a set of DNS records (SPF, DKIM, DMARC) to add at your DNS provider. Verification usually takes a few minutes.
3. Go to **API Keys → Create API Key** and give it Full Access. Copy the key (`re_...`)

| Value | Env variable |
|-------|-------------|
| API key | `RESEND_API_KEY` |
| Verified sender | `EMAIL_FROM` — e.g. `"LeadStack <notifications@yourdomain.com>"` |

**Don't own a domain yet?** You can test with Resend's sandbox: `EMAIL_FROM="onboarding@resend.dev"`. Sandbox sends work for testing but get flagged as untrusted in production.

**Email is optional.** If `RESEND_API_KEY` or `EMAIL_FROM` is missing, the `/api/comms/email/send` route returns a 503 and the **Send email** button on a contact profile surfaces a clean error. The rest of the app works normally.

### Twilio (SMS)

LeadStack uses [Twilio](https://www.twilio.com) for SMS. Same shared-sender model — you own the Twilio account, your users send from your purchased number.

1. Go to [https://console.twilio.com](https://console.twilio.com) and sign up (free trial includes a phone number + credits)
2. From the dashboard, copy your **Account SID** and **Auth Token**
3. Go to **Phone Numbers → Manage → Active Numbers** and copy your trial or purchased number in E.164 format (`+15551234567`)

| Value | Env variable |
|-------|-------------|
| Account SID | `TWILIO_ACCOUNT_SID` |
| Auth Token | `TWILIO_AUTH_TOKEN` |
| Phone number (E.164) | `TWILIO_FROM_NUMBER` |

**Trial account caveats:** Twilio trial accounts can only send SMS to phone numbers you've verified under **Phone Numbers → Verified Caller IDs**, and every message gets prepended with a "Sent from a Twilio trial account" banner. For real usage, upgrade the account and (in the US) register A2P 10DLC.

**SMS is optional.** If any of the three Twilio vars are missing, `/api/comms/sms/send` returns a 503 and the **Send SMS** button fails with a clean error. The rest of the app works normally.

---

## Module 5: Run Locally + Push to Live

*Launch Locally, Verify Everything, Deploy to Vercel*

### Launch Locally

Claude Code will start the dev server for you by running `pnpm dev`. Open [http://localhost:3000](http://localhost:3000) in your browser and verify each feature:

### Verification Checklist

1. **Landing page** — you should see the LeadStack landing page with hero, pillars, features, comparison, pricing, and FAQ
2. **Theme toggle** — click the sun/moon icon in the navbar to switch light/dark
3. **Legal pages** — click "Terms of Service" and "Privacy Policy" in the footer
4. **Sign up** — go to `/signup` and create an account (email and password)
5. **Log in** — go to `/login` and sign in
6. **Dashboard** — after login, you should see the CRM home with the Getting Started empty state
7. **Add a contact** — click `Contacts` in the sidebar > **Add Contact** — fill in name + email + phone
8. **Add a deal** — click `Pipeline` > **New Deal**, pick the contact you just created, drop it into any stage
9. **Drag the deal** across stages — drop it into **Lost** to see the "Lost reason" dialog
10. **Add a calendar event** — click `Calendar` > pick a day > create an event linked to the contact
11. **Add a task** — click `Tasks` > **New Task**, link to the same contact, give it a due date today
12. **Create a form** — click `Forms` > **New Form**, customize fields, copy the public link
13. **Submit the form** — open the public link in an incognito tab, fill it in, submit. A new contact appears in your CRM with a `form_submitted` activity
14. **Global search** — press `Ctrl/Cmd + K` anywhere in the app, type the contact's name, hit enter
15. **Reports** — click `Reports` > the KPIs, funnel, and charts should populate with the data you just entered
16. **Send email** (needs Resend configured) — on the contact profile, click **Email**, send a test message. Check your inbox for the `Reply-To:` header to be your email
17. **Send SMS** (needs Twilio configured) — click **SMS**, send a test message (to a Twilio-verified number if on the trial account)
18. **CSV export** — click `Contacts` > **Export** > opens a download of all contacts
19. **Stripe checkout** — go back to the `/` marketing page, click Subscribe on the Pro plan. Use test card: `4242 4242 4242 4242` (any future date, any CVC)

### Deploy to Vercel

When you're ready to go live:

1. Create an account at [https://vercel.com](https://vercel.com) (sign up with GitHub)
2. Click **Add New... > Project** and import your repository
3. Add all your `.env.local` variables to the Vercel Environment Variables section
4. For `FIREBASE_ADMIN_PRIVATE_KEY` on Vercel, paste the full key including the `-----BEGIN/END PRIVATE KEY-----` markers. Vercel handles the newlines automatically
5. Change `NEXT_PUBLIC_APP_URL` to your Vercel domain (e.g., `https://my-app.vercel.app`)
6. Click **Deploy**

**For production Stripe webhooks:**
1. Stripe Dashboard > Developers > Webhooks > **Add endpoint**
2. URL: `https://your-app.vercel.app/api/webhooks/stripe`
3. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy the new signing secret and update `STRIPE_WEBHOOK_SECRET` in Vercel

**For production Resend:**
- Make sure your sending domain is fully verified in Resend (sandbox `onboarding@resend.dev` is test-only)

**For production Twilio:**
- Upgrade from trial if you want to send to non-verified numbers
- In the US, register A2P 10DLC through the Twilio console to avoid carrier filtering

If everything works locally and on Vercel, you're done! Your LeadStack CRM boilerplate is fully set up. You're ready for Module 6 — extending LeadStack for your own use case.

---

## Troubleshooting

### Prerequisites

| Problem | Solution |
|---------|----------|
| `pnpm: command not found` | Run `npm install -g pnpm`, then restart your terminal |
| `git: command not found` | Install Git from https://git-scm.com/download/win, restart VS Code |
| `node: command not found` | Install Node.js LTS from https://nodejs.org, restart VS Code |
| `firebase: command not found` | Run `npm install -g firebase-tools`, restart your terminal |
| `stripe: command not found` | Run `winget install Stripe.StripeCLI`, restart terminal |

### Running the App

| Problem | Solution |
|---------|----------|
| `ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND` | You're in the wrong folder. `cd` to the folder with `package.json` |
| `Module not found: Can't resolve ...` | Run `pnpm install` again |
| Blank page or console errors | Check `.env.local` — make sure every value is filled in |
| Port 3000 already in use | Run `pnpm dev -- -p 3001` |

### Firebase

| Problem | Solution |
|---------|----------|
| Auth not working | Check that Email/Password is enabled in Firebase Console |
| `FIREBASE_ADMIN_PRIVATE_KEY` errors | Make sure the value is wrapped in double quotes in `.env.local` and the `\n` escapes are literal |
| `Missing or insufficient permissions` | The Firestore rules haven't been deployed. Run `firebase deploy --only firestore:rules` — and rerun this any time a new collection is added |
| `firebase deploy` says "no project" | Edit `.firebaserc` so `"default"` matches your Firebase project ID, then retry |

### Stripe

| Problem | Solution |
|---------|----------|
| Checkout not redirecting | Verify all 4 Stripe env vars are filled in and correct |
| Webhooks not received locally | Make sure `stripe listen` is running in a separate terminal |
| `openssl` not recognized | Use `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` instead |

### Email (Resend)

| Problem | Solution |
|---------|----------|
| "Email is not configured on this deployment" (503) | `RESEND_API_KEY` or `EMAIL_FROM` is missing from `.env.local`. Restart the dev server after adding them |
| Resend returns 403 at send time | Your `EMAIL_FROM` address is on a domain that isn't verified in Resend. Go to Resend → Domains and finish the DNS verification |
| Email sent but not received | Check the recipient's spam folder. For production, add SPF/DKIM/DMARC DNS records correctly |

### SMS (Twilio)

| Problem | Solution |
|---------|----------|
| "SMS is not configured on this deployment" (503) | One of `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` is missing. Restart after adding them |
| "The number +1... is unverified" | Trial Twilio accounts can only SMS numbers you've verified in Twilio → Phone Numbers → Verified Caller IDs |
| Messages show "Sent from a Twilio trial account" | That's the trial banner — upgrade your Twilio account to remove it |
| US SMS silently dropped | Register A2P 10DLC through the Twilio console — required for US long-code SMS |

### Global Search / Comms UI

| Problem | Solution |
|---------|----------|
| `Ctrl/Cmd + K` doesn't open anything | You need to be on a dashboard page (any `/dashboard`, `/contacts`, `/pipeline`, etc. route), not the public landing page |
| Send email / SMS buttons are greyed out | The contact doesn't have an email or phone saved. Click **Edit** on the contact, add the missing field |
