# ActionDesk

An intelligent workspace that transforms scattered business communication into
organized actions — emails, WhatsApp messages, invoices, and voice notes all
become the same thing: an **Action Card**.

## Stack

- **Next.js 14** (App Router) — single project, frontend + backend API routes
- **Tailwind CSS** — design tokens match the Frontend Design Bible (slate +
  blue, Linear/Notion/Stripe inspired)
- **Groq API** — real LLM calls for extraction (`openai/gpt-oss-120b`) and
  optional voice transcription (`whisper-large-v3`)
- In-memory data store (`lib/store.js`) — good enough for a demo; swap for a
  real DB later (see the Database Design doc if you write one)

## Setup

```bash
npm install
cp .env.local.example .env.local
# edit .env.local and paste your Groq API key
npm run dev
```

Open http://localhost:3000.

The key is only ever read on the server (inside API routes) — it's never
sent to the browser.

## What's mocked vs. real

| Piece | Status |
|---|---|
| Gmail / WhatsApp connectors | **Mocked** — `Sync Gmail` / `Sync WhatsApp` send canned sample messages (`lib/mockSources.js`) |
| AI extraction (text → Action Card) | **Real** — calls the Groq API with the prompt in `lib/groq.js` |
| Voice transcription | **Real**, with a "paste transcript" fallback for demos without an audio file |
| Invoice text extraction | **Real** for `.txt`; basic `.pdf` text extraction via `pdf-parse` |
| Database | In-memory only — resets when the server restarts |

## Pages

- `/` — Dashboard ("Morning Brief"): greeting, KPI cards, Today's Focus (top
  3 pending actions), Recent Activity
- `/action-center` — every Action Card, filterable by category / priority /
  status, with the **AI Assist** menu on each card
- `/imports` — paste text, upload an invoice, paste a voice transcript, or
  sync a channel
- `/insights` — category / source breakdown, pending payments, upcoming
  deadlines
- `/business-memory` — resolved actions, kept for reference
- `/settings` — workspace info, Groq status, reset demo data

## The golden rule

Every source — Gmail, WhatsApp, invoice, voice note — is normalized by
`lib/groq.js` + `lib/schema.js` into the same shape:

```json
{
  "title": "Invoice from ABC Traders",
  "source": "Gmail",
  "category": "Invoice",
  "priority": "High",
  "summary": "...",
  "deadline": "...",
  "recommended_action": "...",
  "status": "Pending"
}
```

That's what keeps the frontend simple: one `ActionCard` component renders
everything, regardless of where it came from.

## Next steps / where to extend

- Swap `lib/store.js` for a real database (SQLite is the easiest first step)
- Replace `lib/mockSources.js` with real Gmail / WhatsApp Business API calls
  — the extraction pipeline downstream doesn't need to change
- Wire the `AI Assist` menu actions (`lib/aiAssist.js`) up to real side
  effects (send email, create calendar event, etc.) instead of the current
  prototype behavior
