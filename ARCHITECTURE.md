# ARCHITECTURE.md — StackSpend System Design

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Cold Visitor Lands                           │
│                        (tweet, HN, Product Hunt)                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Landing Page (Hero) │
                    │  "Audit My Stack"    │
                    └──────────────┬───────┘
                                   │
                                   ▼
        ┌──────────────────────────────────────────────────┐
        │        Input Form (Client-Side Validation)       │
        │  • Which tools? (8 options)                       │
        │  • Which plan?                                    │
        │  • Monthly spend / seats                          │
        │  • Team size / use case                           │
        │  • Form state: localStorage (persists across reload)
        └──────────────────────┬───────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────────┐
        │     Audit Engine (Hardcoded Rules - Client)      │
        │  • PRICING_DATA: lookup correct plan pricing     │
        │  • Rule 1: Are they on right plan for team size? │
        │  • Rule 2: Could they downgrade?                 │
        │  • Rule 3: Is there a cheaper alternative?       │
        │  • Rule 4: Could credits beat retail?            │
        │  • Output: Array of recommendations               │
        └──────────────────────┬───────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────────┐
        │        Results Page (Visual, Shareable)          │
        │  • Hero: Total monthly + annual savings           │
        │  • Per-tool breakdown (current → recommended)    │
        │  • Why each recommendation (1 sentence each)      │
        │  • If >$500/mo savings: Credex CTA (prominent)   │
        │  • If <$100/mo or optimal: "You're good"         │
        └──────────────────────┬───────────────────────────┘
                               │
                      ┌────────┴────────┐
                      ▼                 ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │  LLM Summary Request │  │   Email Capture      │
        │  (Anthropic API)     │  │  + Lead Storage      │
        │  • Personalized 100w │  │  (Supabase/Firebase) │
        │    summary of audit  │  │  + Transactional Email
        └──────────────────────┘  └──────────────────────┘
                      │                 │
                      └────────┬────────┘
                               ▼
        ┌──────────────────────────────────────────────────┐
        │     Generate Shareable URL + OG Tags             │
        │  • /audit/[unique-id]                            │
        │  • Strips email/company (public version)          │
        │  • Shows: tools, savings, summary                 │
        │  • OG meta tags for Twitter/LinkedIn preview      │
        │  • "Viral loop" — easy share                      │
        └──────────────────────────────────────────────────┘
```

## Data Flow (Step by Step)

1. **User Input** → Form state stored in localStorage (JSON object with tool selections, spend, team size)
2. **Audit Trigger** → User clicks "Audit" button → function runs locally
3. **Rule Engine** → For each tool:
   - Look up pricing from `auditEngine/rules.ts` (hardcoded)
   - Compare current spend vs. recommended plan
   - Check for cheaper alternatives in same category
   - Calculate monthly + annual savings
4. **Results Generation** → Array of recommendations + total savings → display on results page
5. **LLM Enrichment** → Send audit results to Anthropic API → get personalized summary
6. **Lead Capture** → User enters email → POST to `/api/leads` → stored in Supabase
7. **Transactional Email** → Resend sends confirmation email with results PDF link
8. **Shareable URL** → POST creates a `Audit` record in DB, returns unique URL → user shares `/audit/[id]` on Twitter/LinkedIn

---

## Tech Stack Choices

### Frontend: **Next.js 15 + TypeScript + Tailwind CSS**
- **Why Next.js?**
  - API routes built-in (`/api/*`) — no separate backend needed for MVP
  - Server Components for fast rendering + better SEO
  - File-based routing (clean structure)
  - Built-in image optimization + code splitting
  - Ships to Vercel in one command
  - Instant deployment feedback

- **Why TypeScript?**
  - Audit logic has many conditions — types catch errors early
  - Form validation is easier with types (tool names, plan names)
  - Refactoring later is safer

- **Why Tailwind + shadcn/ui?**
  - Fastest styling path (utility classes)
  - shadcn/ui gives us accessible, pre-built components (buttons, forms, modals)
  - No CSS to write — fewer bugs

### Backend: **Next.js API Routes + Supabase**
- **Supabase** (PostgreSQL cloud DB)
  - Free tier sufficient for MVP
  - Real-time subscriptions (could show live audits later)
  - Built-in auth if we add login later
  - Simple SQL queries for lead storage

- **Email:** Resend (free tier, 100 emails/day)
  - Easiest transactional email (better than SMTP)
  - Great docs, TypeScript support

- **LLM:** Anthropic API (Claude Sonnet 4)
  - Free credits available for students/builders
  - Preferred over OpenAI (you have relationship with Anthropic)
  - Fallback to hardcoded template if API fails

### Deployment: **Vercel**
- Next.js is Vercel's framework
- One-click deploy from GitHub
- Automatic HTTPS, serverless functions, edge middleware
- Free tier for hobby projects

---

## Why This Stack?

| Concern | Choice | Why |
|---------|--------|-----|
| Speed to ship | Next.js | TypeScript + built-in API routes = fewer decisions |
| Database | Supabase | Easier than Firebase for this use case, free tier generous |
| Email | Resend | Simpler than Mailgun/SES, free for MVP |
| Styling | Tailwind + shadcn | Components pre-made, visually polished in hours |
| Deploy | Vercel | Native support for Next.js, 1-click from GitHub |
| LLM | Anthropic | Free credits, better alignment with Credex |

---

## Key Architecture Decisions

### 1. Audit Logic Lives on Client (Not Server)
- **Why:** Audit rules are deterministic (pricing lookup + math)
- **Benefit:** No latency, no server cost, audits happen instantly
- **Risk:** Logic is visible to users, but that's OK — we *want* transparency
- **Trade-off:** If rules change, users refresh page to get new logic

### 2. Form State in localStorage (Not Database)
- **Why:** Users should not have to log in or fill form twice
- **Benefit:** Seamless UX — clear form, hit Audit, see results
- **Trade-off:** We can't track "abandoned audits," but that's low priority

### 3. Results Page Generated Client-Side First, Then Shareable via DB
- **Why:** Instant feedback (audit runs locally) → then optionally capture email + create public URL
- **Benefit:** Fast for users, lead capture is a secondary action (not required for value)
- **Trade-off:** Shareable URL requires a backend hit, so lazy loading is fine

### 4. LLM Summary is Optional (Graceful Fallback)
- **Why:** API could be down or rate-limited
- **Benefit:** Users still get useful results without LLM
- **Trade-off:** Less personalization if API fails, but honest > over-promising

---

## Scaling to 10k Audits/Day

If StackSpend went viral and hit 10k audits/day, what breaks?

### Current Bottlenecks:
1. **Supabase free tier:** 50k records/month limit → hits ~1.5k audits/day
   - **Fix:** Upgrade to Pro ($25/mo) → unlimited queries
   - **Or:** Archive old audits to cold storage (S3)

2. **Resend free tier:** 100 emails/day limit → hits immediately
   - **Fix:** Move to Sendgrid/Mailgun pay-as-you-go (~$0.50 per email)

3. **Anthropic API rate limits:** ~3 requests/minute on free tier
   - **Fix:** Batch summarization (process summaries in background queue)
   - **Or:** Switch to Claude Batch API for cheaper processing

4. **Vercel serverless function timeouts:** 10-30s limits (default)
   - **Fix:** Move heavy LLM calls to background job (Bull queue on Redis)
   - **Use Vercel Cron functions** to process summaries overnight

### Optimized Architecture for 10k/day:
```
Form Input → localStorage → Audit Engine (client) → Results Page
                                                         ├─ If email capture:
                                                         │  POST /api/leads (fast)
                                                         │  → Supabase (write)
                                                         │  → Bull Job Queue (async)
                                                         │
                                                         └─ Bull Worker (Redis):
                                                            • Call Anthropic API
                                                            • Generate PDF
                                                            • Send email (Sendgrid)
```

This way: user gets results instantly, lead is captured immediately, but heavy lifting happens async.

---

## Next Steps (Day 2+)

1. **Build form component** (`components/AuditForm.tsx`)
   - Tool selector, plan picker, spend input
   - Team size + use case dropdowns
   - localStorage sync

2. **Implement audit engine** (`lib/auditEngine.ts`)
   - Pure function: `auditUserStack(input) → recommendations[]`
   - Hardcoded rules based on PRICING_DATA.md
   - Tests for each rule

3. **Results page** (`app/results/page.tsx`)
   - Display recommendations visually
   - Calculate total savings
   - Highlight Credex CTA if >$500/mo savings

4. **Email capture modal** + API route (`/api/leads`)
   - POST to Supabase
   - Send transactional email

5. **Shareable audit URL** + OG tags
   - Generate unique ID for each audit
   - Create public results page (`/audit/[id]`)
