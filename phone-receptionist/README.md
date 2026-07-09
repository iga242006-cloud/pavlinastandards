# ARIA Phone — AI Phone Receptionist

Inbound phone version of ARIA (the AI receptionist every Pavlina site ships with), built on
[Vapi](https://vapi.ai). Callers dial a real phone number, talk to a voice AI that knows the
practice's hours/services/insurance/booking process, can check calendar availability, book or
queue an appointment, and transfer to a human at the front desk.

Why Vapi: it bundles speech-to-text, the LLM, and text-to-speech behind one API and one phone
number, so there's no separate telephony server to run — this repo only needs to host the small
webhook that answers Vapi's tool calls ("check availability", "book appointment").

## How it fits together

```
Caller dials number
        │
        ▼
   Vapi (STT → LLM → TTS, using the assistant config below)
        │  tool calls (check_availability / book_appointment)
        ▼
 this server: POST /webhook/:practiceId
        │
        ▼
 Google Calendar (if configured)  ── or ──  local intake queue (data/*.json)
```

Each client practice is one JSON file in `config/practices/`. The assistant's system prompt,
tools, and voice are all generated from that file by `src/assistantConfig.js` — adding a new
practice never means writing new prompt code.

## 1. Create a Vapi account

1. Sign up at vapi.ai and open the dashboard.
2. Go to **API Keys** and copy the private key.
3. The default practice config uses Vapi's own built-in voice (`provider: "vapi"`, no separate
   account needed) and Deepgram for transcription via Vapi's built-in credits, so you can test
   end-to-end before connecting any other provider. Swap `voice` in a practice config to
   `11labs`/`playht`/etc. later for a more distinctive, branded voice.

> **Run everything in this section from your own machine or CI, not from this Claude session.**
> This session's network egress policy blocks `api.vapi.ai` outright (confirmed — not a key or
> code issue), so `scripts/create-assistant.js` cannot be run here. Clone this branch locally to
> provision the assistant.

## 2. Local setup

```bash
cd phone-receptionist
npm install
cp .env.example .env
```

Fill in `.env`:
- `VAPI_API_KEY` — from step 1.
- `PUBLIC_SERVER_URL` — see step 3.

## 3. Make this server publicly reachable

Vapi needs to reach `POST /webhook/:practiceId` over HTTPS during a live call.

- **Testing**: run `npm start`, then in another terminal `ngrok http 3000`, and set
  `PUBLIC_SERVER_URL` in `.env` to the ngrok HTTPS URL.
- **Production**: deploy this folder to Render, Railway, Fly.io, or similar, and set
  `PUBLIC_SERVER_URL` to that deployment's URL.

## 4. Configure a practice

Copy the template and fill in real details:

```bash
cp config/practices/example-practice.json config/practices/<your-practice-id>.json
```

Edit every field — name, doctors, services, hours, address, phone, insurance, languages, and
`frontDeskTransferNumber` (where "transfer me to a person" sends the call). Leave `voice` as the
built-in `vapi`/`Elliot` default to start, or point it at an 11labs/playht voice ID later.

Leave `calendar.enabled: false` until you've done step 6 — until then, booking requests are
queued locally for staff to confirm by phone (see the HIPAA note below).

## 5. Provision the assistant on Vapi

```bash
node scripts/create-assistant.js <your-practice-id>
```

This prints an assistant ID. In the Vapi dashboard, go to **Phone Numbers**, buy or import a
number (or connect an existing Twilio number), and assign it to that assistant. Call the number
to test.

Re-run the script any time you edit the practice config or `src/assistantConfig.js` to push
changes — it creates a new assistant each time; delete the old one in the dashboard once you've
repointed the phone number.

## 6. (Optional) Real calendar booking

Without this, `book_appointment` just queues the request in `data/<practiceId>-intake.json` for
staff to confirm — matching how most of these practices' websites already work (a contact form
staff calls back on).

To make ARIA book directly into a calendar:

1. Create a Google Cloud service account, generate a JSON key.
2. Set `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_SERVICE_ACCOUNT_KEY` (the private key, with
   `\n` line breaks) in `.env`.
3. Share the practice's Google Calendar with the service account's email as **Editor**.
4. In the practice's config file, set `calendar.enabled: true` and `calendar.calendarId` to that
   calendar's ID (Calendar Settings → Integrate calendar → Calendar ID).
5. Re-run `node scripts/create-assistant.js <practiceId>` — no prompt changes needed, the tool
   handlers pick this up automatically via `src/calendar.js`.

## Important: this is a scaffold, not a compliant production system

This code is a working starting point, not a finished product for a real medical practice:

- **PHI / HIPAA**: phone calls with patients can involve protected health information. Before
  connecting this to a real practice's number, you need Business Associate Agreements with every
  vendor in the call path that touches audio or transcripts (Vapi, and its sub-processors for
  the model/transcription/voice providers you select). Ask your Vapi rep about their BAA.
- **`data/*.json` intake queue** is a local file with no encryption or access control — it's
  only here so the scaffold runs end-to-end without a database. Replace it with a real,
  access-controlled system (a proper DB, or a direct write into the practice's EHR/CRM) before
  handling real patient bookings.
- **Emergency handling** is prompt-based (tells callers with emergency symptoms to hang up and
  dial 911) — test this thoroughly; it is not a substitute for a monitored clinical triage line.
