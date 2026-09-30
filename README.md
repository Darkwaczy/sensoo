<div align="center">

<br/>
<img src="sensoo-mobile/assets/logo.png" alt="Sensoo Logo" width="240" />
<br/><br/>

**Real-time product verification and anti-counterfeit detection engine.**

Built for the KodeHauz@10 Hackathon &middot; Decennium Sprint

[![React Native](https://img.shields.io/badge/React_Native-Expo_57-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactnative.dev)
[![KodeHauz MSFlib](https://img.shields.io/badge/Engine-KodeHauz_MSFlib-0E3B20?style=flat-square)](https://github.com/mavlon00/sensoo)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.1.0-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Gemini](https://img.shields.io/badge/Gemini-3.1_Flash_Lite-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![N-ATLaS](https://img.shields.io/badge/NCAIR-N--ATLaS-006B3F?style=flat-square)](https://huggingface.co/NCAIR1/N-ATLaS)

</div>

---

## Overview

Counterfeit medicines, packaged foods, and cosmetics are a major public safety crisis in Nigeria and broader African markets. Existing verification systems rely on static scratch-off SMS codes that counterfeiters easily clone, reuse, or print onto fake packaging in bulk.

**Sensoo** solves this by pairing product verification codes with **instant geospatial and temporal telemetry**, powered by the **KodeHauz MSFlib** verification engine. When a consumer or merchant scans a product, the client records GPS coordinates and UTC timestamps. The backend validates whether the scan respects physical laws and manufacturer supply-chain boundaries before certifying authenticity.

---

## Sensoo Agentic AI — Dual-Brain Consumer Safety Intelligence

Sensoo includes a fully conversational **Agentic AI assistant** that consumers can talk to (via voice or text) to understand scan results, get clinical safety guidance, find nearby hospitals, and report suspicious products — all in their native Nigerian language.

### What the AI Agent Can Do

| Capability | Description |
|:---|:---|
| **Explain a Scan** | Breaks down why a product was flagged (counterfeit barcode, impossible travel speed, cloned packaging, wrong region) in plain, non-technical language |
| **Clinical Safety Triage** | If a consumer already took a counterfeit medicine: asks what they took, how much, and when — then provides immediate safety steps and urges hospital evaluation |
| **Find Nearby Help** | Shows accredited clinics and hospitals (LUTH Surulere, Reddington, Ikeja General) with distance, rating, and one-tap call |
| **Report a Product** | Guides the consumer through filing a suspicious product report, dispatched to NAFDAC Sentinel threat clusters |
| **Voice Interaction** | Full voice input (speech-to-text) and voice output (text-to-speech) — the consumer can speak their question and hear the AI reply out loud |
| **5 Nigerian Languages** | Responds fluently in **English**, **Nigerian Pidgin**, **Yorùbá**, **Hausa**, and **Igbo** |

### Dual-Brain Architecture

The AI uses two intelligence layers working together:

```
Consumer speaks/types question
        │
        ▼
┌────────────────────────────────────────────────────────────┐
│                    sensooAiService.ts                       │
│                 (Frontend AI Orchestrator)                  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  BRAIN 1: Google Gemini 3.1 Flash Lite (Primary)     │  │
│  │  → Counterfeit forensics, drug toxicology,           │  │
│  │    clinical safety reasoning, contextual dialogue    │  │
│  │                                                      │  │
│  │  FALLBACK: Gemini 2.5 Flash Lite                     │  │
│  │  → Auto-switches if primary model is unavailable     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  BRAIN 2: NCAIR1/N-ATLaS (Nigerian Sovereign AI)    │  │
│  │  → Nigerian language detection & fluent response     │  │
│  │    generation in Pidgin, Yorùbá, Hausa, Igbo         │  │
│  │  → Offline-capable local vernacular safety cache     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  Context injected per query:                               │
│  • Product name, scanned code, verification status         │
│  • User location, selected language                        │
│  • Conversation history (multi-turn memory)                │
└────────────────────────────────────────────────────────────┘
        │
        ▼
  Voice speaks answer aloud + displays text on screen
```

### Technology Stack

| Layer | Technology | Purpose |
|:---|:---|:---|
| **Nigerian Language Processing** | [NCAIR1/N-ATLaS](https://huggingface.co/NCAIR1/N-ATLaS) (Hugging Face) | Fluent responses in Yorùbá, Hausa, Igbo, and Nigerian Pidgin using Nigeria's sovereign AI model |
| **Core Reasoning** | Google Gemini 3.1 Flash Lite (primary) / Gemini 2.5 Flash Lite (fallback) | Counterfeit forensics, drug toxicology analysis, clinical safety guidance |
| **Voice Synthesis** | expo-speech (device neural TTS) | Reads AI responses aloud through device speakers |
| **Voice Input** | Web Speech Recognition API | Listens to spoken questions from consumers in market environments |
| **Verification Engine** | KodeHauz MSFlib + FastAPI backend | 4-alarm product verification with geo-velocity anomaly detection |

### How the Fallback Chain Works

The AI never leaves the consumer without an answer:

1. **Try Gemini 3.1 Flash Lite** → Full contextual response with product forensics
2. **If 3.1 fails → Try Gemini 2.5 Flash Lite** → Same quality, different model endpoint
3. **If both fail → N-ATLaS Local Cache** → Pre-built fluent responses in all 5 languages, available offline — the consumer always gets a clinically accurate safety response even without internet

### Example AI Interactions

**English — Explaining a counterfeit scan:**
> "This Paracetamol 500mg was flagged as counterfeit. The barcode does not match any authorized NAFDAC manufacturer records. Do not consume this product. If you already took it, drink clean water and visit the nearest accredited clinic."

**Nigerian Pidgin — Clinical safety triage:**
> "🚨 OYA LISTEN: If you don already drink this medicine, stop am immediately! Drink plenty clean water. If your eye dey turn you or belle dey pain you, sharp-sharp make you go LUTH hospital for Surulere or call 112 emergency now-now."

**Yorùbá — Product alert:**
> "⚠️ Oogun yi jẹ ayederu. Koodu ati nọmba re ko ba iwe NAFDAC mu rara. E jọwọ, ẹ ma ṣe lo oogun yi tabi ta fun ẹnikẹni!"

---

## Detection Rules Engine

Every scan submitted via the client evaluates four core heuristics:

| Rule | Trigger Condition | Alarm Code |
| :--- | :--- | :--- |
| **Whitelist Validation** | Scanned code does not exist in the manufacturer batch database. | `INVALID_CODE` |
| **Clone & Reuse Check** | Code exists, but its lifecycle state is already `PURCHASED_RETIRED`. | `ALREADY_PURCHASED` |
| **Impossible Physics** | Travel speed between consecutive scans exceeds physical travel limits: <br> `velocity = haversine_distance(loc1, loc2) / elapsed_time > 900 km/h` | `IMPOSSIBLE_PHYSICS` |
| **Regional Diversion** | First scan occurs outside the manufacturer's designated delivery region. | `WRONG_REGION` |

### Lifecycle State Machine

```
[REGISTERED] -> [SHIPPED] -> [IN_STOCK] -> [PURCHASED_RETIRED]
                   |             |
           (Merchant scan)  (Consumer scan)
```

Once a consumer successfully verifies a product, the code is retired. If that same barcode is ever scanned again anywhere else in the country, the system flags an immediate clone alarm.

---

## Repository Structure

```
sensoo/
├── backend/
│   ├── main.py               # FastAPI application with /scan and /feed routes
│   ├── sensoo_core.py        # Verification heuristics and Haversine distance math
│   ├── msflib.py             # In-memory persistence and telemetry registry
│   └── requirements.txt      # API dependencies
│
├── sensoo-mobile/
│   ├── src/app/              # Expo Router file-based screens
│   │   ├── home.tsx          # Consumer dashboard with scan history & profile
│   │   ├── scanner.tsx       # Barcode/QR camera scanner
│   │   ├── result.tsx        # Verification result screen (AUTHENTIC / FAKE)
│   │   ├── agent.tsx         # Sensoo AI Voice Agent (10 sub-screens)
│   │   └── sentinel.tsx      # NAFDAC regulatory threat cluster dashboard
│   ├── src/services/
│   │   └── sensooAiService.ts  # Dual-Brain AI orchestrator (Gemini + N-ATLaS)
│   ├── assets/               # Production assets (3D graphics, brand assets, icons)
│   └── package.json          # Mobile dependencies and run scripts
│
├── AGENTS.md                 # Project guidelines & fraud detection rules
├── .gitignore
└── README.md
```

---

## Running Locally

### 1. Verification API (Backend)

The backend is built with FastAPI and runs on Python 3.10+.

```bash
cd backend

# Create and activate environment
python -m venv .venv
source .venv/bin/activate       # macOS/Linux
# .venv\Scripts\activate        # Windows

# Install dependencies and start server
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Interactive API docs will be available at `http://localhost:8000/docs`.

**Live Deployment:** https://sensoo-api.onrender.com  
**Swagger Docs:** https://sensoo-api.onrender.com/docs

### 2. Consumer Mobile App (Frontend)

The mobile application is built with Expo (React Native) and TypeScript.

```bash
cd sensoo-mobile

# Install packages
npm install

# Start development bundler
npx expo start
```

* Press **`w`** in the terminal to open the web preview in your browser.
* Scan the terminal QR code with the **Expo Go** app on iOS or Android.

### 3. Environment Variables (Mobile)

Create `sensoo-mobile/.env` (never commit this file):

```env
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
EXPO_PUBLIC_HF_NATLAS_MODEL=NCAIR1/N-ATLaS
EXPO_PUBLIC_SENSOO_API_URL=https://sensoo-api.onrender.com
```

---

## API Contract

**Base URL:** `https://sensoo-api.onrender.com`

### 1. Scan Product

```http
POST /scan
Content-Type: application/json
```

**Request Payload:**
```json
{
  "role": "consumer",
  "code": "UNL-9X4-B2P",
  "lat": 6.5244,
  "lng": 3.3792,
  "timestamp": "2026-10-02T14:30:00Z",
  "device_id": "expo-device-abc123"
}
```

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `role` | string | ✅ | Always `"consumer"` for mobile app scans |
| `code` | string | ✅ | Scanned barcode / QR code string |
| `lat` | float | ✅ | GPS latitude from device location |
| `lng` | float | ✅ | GPS longitude from device location |
| `timestamp` | string | ✅ | ISO-8601 UTC scan timestamp |
| `device_id` | string | ⚠️ Recommended | Unique device identifier for clone detection across phones |

**Authentic Response:**
```json
{
  "status": "AUTHENTIC",
  "reason": "Scan accepted – state now PURCHASED_RETIRED",
  "alarms": [],
  "new_state": "PURCHASED_RETIRED",
  "product_name": "Paracetamol 500mg",
  "manufacturer": "Emzor Pharma",
  "batch": "EMZ-2026-0847"
}
```

**Flagged Response (Impossible Travel Speed):**
```json
{
  "status": "FAKE",
  "reason": "Impossible Physics – 850 km in 0.2 h (4250 km/h)",
  "alarms": ["IMPOSSIBLE_PHYSICS"],
  "new_state": "IN_STOCK",
  "product_name": "Paracetamol 500mg",
  "manufacturer": "Emzor Pharma",
  "batch": "EMZ-2026-0847"
}
```

**Flagged Response (Unknown Code):**
```json
{
  "status": "FAKE",
  "reason": "Code not found in manufacturer registry",
  "alarms": ["INVALID_CODE"],
  "new_state": null,
  "product_name": null,
  "manufacturer": null,
  "batch": null
}
```

| Response Field | Type | Description |
|:---|:---|:---|
| `status` | string | `"AUTHENTIC"` or `"FAKE"` |
| `reason` | string | Human-readable explanation for the verdict |
| `alarms` | string[] | Array of triggered alarm codes: `INVALID_CODE`, `ALREADY_PURCHASED`, `IMPOSSIBLE_PHYSICS`, `WRONG_REGION` |
| `new_state` | string \| null | Updated lifecycle state after scan |
| `product_name` | string \| null | ⚠️ **Needed by frontend** — Product display name |
| `manufacturer` | string \| null | ⚠️ **Needed by frontend** — Manufacturer name |
| `batch` | string \| null | ⚠️ **Needed by frontend** — Batch/serial number |

> **⚠️ Note:** Fields marked "Needed by frontend" (`product_name`, `manufacturer`, `batch`) are displayed on the mobile result screen. If not yet implemented in the backend, the frontend will use fallback display values.

### 2. Surveillance Feed

```http
GET /feed?limit=20
```

Returns recent scan logs with coordinates and alarm statuses for regulatory oversight and NAFDAC audit dashboards.

**Response:**
```json
[
  {
    "code": "UNL-9X4-B2P",
    "role": "consumer",
    "lat": 6.5244,
    "lng": 3.3792,
    "timestamp": "2026-10-02T14:30:00Z",
    "status": "AUTHENTIC",
    "alarms": []
  }
]
```

---

## Mobile App Screens

| Screen | File | Description |
|:---|:---|:---|
| Splash & Onboarding | `splash.tsx`, `onboarding.tsx` | Brand intro, permission requests |
| Home Dashboard | `home.tsx` | Scan history, profile, quick actions |
| Barcode Scanner | `scanner.tsx` | Camera-based barcode/QR scanning → calls `POST /scan` |
| Verification Result | `result.tsx` | Displays AUTHENTIC/FAKE verdict with product details |
| AI Voice Agent | `agent.tsx` | 10-screen conversational AI assistant with voice I/O |
| NAFDAC Sentinel | `sentinel.tsx` | Regulatory threat cluster dashboard → uses `GET /feed` |

### AI Voice Agent Sub-Screens (agent.tsx)

1. **Agent Home** — Greeting + action cards + text input bar
2. **Contextual Suggestion** — Post-scan AI dialogue
3. **Voice Listening** — Live mic input + AI voice response + audio playback
4. **Explain Scan** — Detailed breakdown of why a product was flagged
5. **Safety Guidance** — Clinical triage questionnaire
6. **Triage Help** — Emergency dosage assessment
7. **Scan Details** — Full scan metadata view
8. **Nearby Clinics** — Map/list of accredited hospitals
9. **Report Product** — Submit suspicious product to NAFDAC
10. **Report Confirmed** — Submission acknowledgment

---

## Frontend → Backend Integration Points

The mobile app needs to call the backend at these points:

| Mobile Screen | Backend Endpoint | What Happens |
|:---|:---|:---|
| `scanner.tsx` → `result.tsx` | `POST /scan` | After camera captures barcode, send scan payload, display verdict |
| `sentinel.tsx` | `GET /feed` | Load recent scan surveillance data for threat cluster map |
| `agent.tsx` | *N/A (uses Gemini AI)* | AI voice agent uses Google Gemini API directly, not the backend |

---

## Team

* **Mavlon** ([@mavlon00](https://github.com/mavlon00)) &mdash; Backend architecture, FastAPI endpoints, KodeHauz MSFlib engine, data layer
* **Kamalu** ([@Darkwaczy](https://github.com/Darkwaczy)) &mdash; Mobile client, verification UI, Agentic AI integration, voice agent

---

Developed for **KodeHauz@10** &middot; 2026
