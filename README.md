<!-- Sensoo Product Verification System -->
<div align="center">

<br/>
<img src="sensoo-mobile/assets/logo.png" alt="Sensoo Logo" width="240" />
<br/><br/>

**Real-Time Product Verification, Anti-Counterfeit Telemetry & Agentic AI Safety System**

Built for the KodeHauz@10 Hackathon &middot; Decennium Sprint

[![React Native](https://img.shields.io/badge/React_Native-Expo_52+-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactnative.dev)
[![KodeHauz MSFlib](https://img.shields.io/badge/Engine-KodeHauz_MSFlib_v0.2.1-0E3B20?style=flat-square)](https://github.com/mavlon00/sensoo-app-final)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.143.0-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-gpt--4.1--mini_%2B_Responses_API-412991?style=flat-square&logo=openai&logoColor=white)](https://platform.openai.com)
[![Google Gemini](https://img.shields.io/badge/Gemini-3.8_Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![N-ATLaS](https://img.shields.io/badge/NCAIR-N--ATLaS-006B3F?style=flat-square)](https://huggingface.co/NCAIR1/N-ATLaS)
[![Groq](https://img.shields.io/badge/Groq-Whisper_Large_v3_Turbo-F55036?style=flat-square)](https://groq.com)
[![Cartesia](https://img.shields.io/badge/Cartesia-Sonic_TTS-7C3AED?style=flat-square)](https://cartesia.ai)
[![EMDEX API](https://img.shields.io/badge/Registry-EMDEX_Nigeria-107C41?style=flat-square)](https://sandbox.emdexapi.com)

</div>

---

## 📖 Executive Summary

**Sensoo** is an enterprise-grade anti-counterfeit product verification platform built to shield consumers, pharmacists, and supply chain operators across Nigeria and emerging markets from counterfeit medications, adulterated consumer goods, and cloned packaging.

Powered natively by the **KodeHauz `msflib` framework (v0.2.1)**, Sensoo pairs product barcodes with real-time geospatial and temporal telemetry. Every scan is evaluated by MSFlib rule engines to detect cloned labels, regional supply chain diversion, and impossible flight-speed travel anomalies before certifying authenticity.

---

## 🏗️ Architecture & Monorepo Structure

```
sensoo/ (branch: main)
├── sensoo-backend/                  # KodeHauz MSFlib FastAPI Backend Server
│   ├── app/
│   │   ├── actions.py               # MSFlib ModelAction 4-Alarm Verification Engine
│   │   ├── ai_router.py             # MSFlib AI API Transport Router (/api/v1/ai/*)
│   │   ├── online_db_service.py     # Real-Time EMDEX & Global Barcode Gateway
│   │   ├── db.py                    # SQLModel Database Engine & Session Provider
│   │   ├── main.py                  # FastAPI Entrypoint, MSFlib Auth, EventBus Emitter
│   │   ├── models.py                # MSFlib ModelBase Schema Definitions
│   │   ├── router.py                # Sensoo Core API Router (/api/v1/*)
│   │   └── settings.py              # Environment & MSFlib Keystore Configuration
│   ├── msflib/                      # KodeHauz MSFlib Core & Auth Module Extensions
│   ├── requirements.txt             # Backend Dependencies (FastAPI, SQLModel, httpx)
│   ├── Procfile                     # Production Process Manager
│   └── render.yaml                  # Render Cloud Deployment Blueprint
│
├── sensoo-mobile/                   # Consumer Mobile Application (Expo / React Native)
│   ├── src/
│   │   ├── app/                     # Expo Router Navigation (Home, Scanner, Agent, Alerts)
│   │   ├── components/              # Verified Verdict Cards, Telemetry Badges, Maps
│   │   └── services/
│   │       ├── authService.ts       # Authentication & OTP Email Verification
│   │       ├── cartesiaTtsService.ts# Cartesia Sonic Low-Latency Voice Synthesis
│   │       ├── sensooAiService.ts   # Dual-Brain Agentic AI (N-ATLaS & Gemini/OpenAI)
│   │       ├── sensooApiService.ts  # Multi-Engine Barcode & Vision Search Pipeline
│   │       └── voiceAssistantService.ts # Groq Whisper Hands-Free "Hey Sensoo" Commander
│   ├── assets/                      # App Icons, 3D Shields, Brand Badges
│   └── package.json                 # Dependencies (React Native, Expo, Lucide, Cartesia)
└── README.md
```

---

## ⚡ KodeHauz MSFlib Framework Integration (v0.2.1)

The backend is architected natively around the **KodeHauz `msflib` framework**:

| MSFlib Component | Architectural Role in Sensoo |
| :--- | :--- |
| **`msflib.models.ModelBase`** | Base schema inheritance for `ProductCode` and `ScanTelemetryRecord` tables, delivering automated UUID primary keys, UTC timestamps, and JSON serialization. |
| **`msflib.actions.ModelAction`** | Transaction-safe CRUD abstraction powering `VerificationAction` to execute database queries and trigger verification alarm workflows. |
| **`msflib.auth`** | Native authentication router providing `/api/v1/auth` endpoints (`/register`, `/login`, `/me`, `/refresh`, `/logout`), JWT session tokens, keystore-backed revocation, and password hashing. |
| **`msflib.eventbus.bind_app_emitter`** | Binds the MSFlib asynchronous event emitter to the FastAPI instance for broadcasting real-time scan telemetry events. |
| **`msflib.ai_api`** | Standardized AI transport specification defining `/api/v1/ai/ask`, `/api/v1/ai/search`, and `/api/v1/ai/status`. |

---

## 🔍 Multi-Tier Barcode, Vision & AI Search Pipeline

When a product is scanned, Sensoo executes an asynchronous multi-tier search pipeline to resolve exact brand names, active ingredients, and authentic product images:

1. **OpenAI Live Camera Vision OCR (`gpt-4.1-mini`)**  
   Analyzes live camera frames in ~1.5s to read physical labels, batch codes, NAFDAC registration numbers, active ingredients, and blister pack typography directly from the camera viewfinder.
2. **OpenAI Live Web Search (`/v1/responses` + Brave Search API)**  
   Queries real-time web indexes and Nigerian pharmaceutical registries using OpenAI's `web_search_preview` tool and structured JSON extraction to ground barcodes without hallucinations.
3. **Groq Browser Search (`openai/gpt-oss-20b` / `llama-3.3-70b`)**  
   Provides sub-second live browser search execution for international GTINs, consumer packaged goods, and regional manufacturers.
4. **Official Health Registries & Online Databases**  
   - **EMDEX Nigeria Pharmaceutical Database API (`sandbox.emdexapi.com`)**: Verifies approved pharmaceutical brands, dosage forms, active pharmaceutical ingredients (APIs), and registered Nigerian importers.
   - **NAFDAC Greenbook Index**: Cross-references authentic regulatory approvals for prescription and OTC medications.
   - **Global Barcode Index (Open Food Facts & GS1)**: Real-time lookups supporting Nigerian `615` country-code GTIN-13/14 barcodes.

---

## 🛡️ The 4 Mandatory Security Alarms (MSFlib Rules)

Every scan payload `{ code, role, lat, lng, timestamp, device_id, region }` is evaluated against 4 real-time security rules in `VerificationAction`:

```
               [ Product Scan Payload ]
                          │
         ┌────────────────┴────────────────┐
         ▼                                 ▼
   [ Code In DB / EMDEX / GS1? ]     [ Status == 'PURCHASED'? ]
         │ (No)                            │ (Yes)
         ▼                                 ▼
   🚨 ALARM 1:                       🚨 ALARM 2:
   Invalid / Unregistered Code       Cloned Packaging Reuse
         │                                 │
         └────────────────┬────────────────┘
                          │
         ┌────────────────┴────────────────┐
         ▼                                 ▼
   [ Velocity > 900 km/h? ]          [ Scanned Outside Region? ]
         │ (Yes)                            │ (Yes)
         ▼                                 ▼
   🚨 ALARM 3:                       🚨 ALARM 4:
   Geo-Velocity Anomaly              Supply Chain Diversion
```

1. **Invalid Code:** Code does not exist in manufacturer registries, EMDEX, or verified GS1 indexes.
2. **Already Purchased (Clone Reuse):** Code is valid, but its lifecycle state is marked `PURCHASED` or `RETIRED`. Indicates cloned packaging in circulation.
3. **Geo-Velocity Anomaly ("Impossible Physics"):** Calculates travel velocity between consecutive scans using the **Haversine formula**:
   $$\text{Velocity} = \frac{\text{HaversineDistance}(\text{loc}_1, \text{loc}_2)}{\Delta t} > 900 \text{ km/h}$$
   Flags physical clones circulating concurrently in distant cities.
4. **Supply Chain Diversion (Wrong Region):** Scanned outside the manufacturer's designated distribution territory.

---

## 🎙️ Hands-Free In-Place Voice Assistant ("Hey Sensoo")

Sensoo includes a voice-first assistant designed for busy pharmacists, warehouse staff, and consumers on the move:

* **Groq Whisper Turbo (`whisper-large-v3-turbo`)**:  
  Sub-second speech-to-text with customized phonetics recognizing Nigerian pronunciations, NAFDAC, GS1, and Sensoo brand aliases (`"Hey Sensoo"`, `"Hey Senso"`, `"Sensu"`).
* **Cartesia Sonic TTS (`sonic-multilingual`)**:  
  Generates ultra-low-latency, crystal-clear vocal responses directly on device speakers.
* **In-Place Voice Commander (Zero Navigation Distraction)**:  
  Unlike traditional assistants that jarringly redirect the user to a chat screen, Sensoo speaks and acts **in-place**:
  - *"Hey Sensoo"* &rarr; Assistant greets the user vocally and prompts hands-free shortcuts.
  - *"Scan product"* &rarr; Launches the camera barcode scanner immediately.
  - *"Check history"* &rarr; Switches to recent scans in-place.
  - *"Show alerts"* &rarr; Opens community counterfeit drug warnings in-place.

---

## 🤖 Dual-Brain Agentic AI System

Sensoo coordinates two specialized AI models to provide culturally grounded safety guidance:

* **Brain 1 — `NCAIR1/N-ATLaS` (Sovereign Language Core):**  
  Understands Nigerian cultural context, local open-air markets (**Idumota**, **Balogun**, **Ariaria**, **Alaba**, **Wuse**), and indigenous languages (**Nigerian Pidgin**, **Yorùbá**, **Hausa**, **Igbo**).
* **Brain 2 — `OpenAI gpt-4.1-mini` & `Google Gemini 3.8 Flash` (Reasoning & Action Core):**  
  Executes clinical safety triage when counterfeit medication ingestion is suspected, and dispatches autonomous tools:
  - `trigger_camera_scan`: Automatically arms the camera scanner.
  - `submit_fraud_report`: Files telemetry dossiers to NAFDAC Sentinel surveillance.
  - `find_nearby_clinics`: Geo-locates accredited healthcare facilities.

---

## ✉️ Transactional Communications & Security (Resend)

* **Direct Email Verification**: Dispatches branded OTP authentication emails directly to user inboxes via Resend API.
* **Official Welcome Letter**: Issues an official Sensoo Consumer Protection certificate upon successful onboarding.

---

## 📡 API Reference & Endpoints

**Live Production Base URL:** `https://sensoo-app-final-2.onrender.com`  
**Interactive Swagger Docs:** `https://sensoo-app-final-2.onrender.com/docs`

### Core Verification & Telemetry

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/scan` | Evaluates scan payload against MSFlib 4-Alarm rules and records telemetry. |
| `POST` | `/api/v1/register` | Registers new authentic product barcodes into the manufacturer database. |
| `GET` | `/api/v1/feed` | Returns real-time scan activity feed for surveillance telemetry maps. |
| `POST` | `/api/v1/report` | Submits a counterfeit or suspicious product report. |
| `GET` | `/api/v1/reports` | Lists submitted counterfeit reports. |
| `GET` | `/api/v1/health` | Service health status check. |

### MSFlib Authentication (`/api/v1/auth`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Registers a new account using MSFlib Account model. |
| `POST` | `/api/v1/auth/login` | OAuth2 password bearer token authentication. |
| `GET` | `/api/v1/auth/me` | Retrieves the authenticated account profile. |
| `POST` | `/api/v1/auth/refresh` | Refreshes active JWT session token. |
| `POST` | `/api/v1/auth/logout` | Revokes the active session token in the keystore. |

### MSFlib AI Transport Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/ai/ask` | Health and safety RAG guidance enriched with live EMDEX lookups. |
| `POST` | `/api/v1/ai/search` | Semantic similarity search across EMDEX and verified product indexes. |
| `GET` | `/api/v1/ai/status` | Returns MSFlib AI module and vector store status. |

---

## 🚀 Local Development Setup

### 1. Backend Setup (`sensoo-backend`)

```powershell
# Navigate to backend directory
cd sensoo-backend

# Install Python dependencies
pip install -r requirements.txt

# Run backend development server
uvicorn app.main:app --reload --port 8000
```

### 2. Mobile App Setup (`sensoo-mobile`)

```powershell
# Navigate to mobile directory
cd sensoo-mobile

# Install packages
npm install

# Configure environment variables (.env)
# EXPO_PUBLIC_API_URL=https://sensoo-app-final-2.onrender.com/api/v1
# EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key
# EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key
# EXPO_PUBLIC_GROQ_API_KEY=your_groq_key
# EXPO_PUBLIC_CARTESIA_API_KEY=your_cartesia_key
# EXPO_PUBLIC_RESEND_API_KEY=your_resend_key
# EXPO_PUBLIC_HF_NATLAS_MODEL=NCAIR1/N-ATLaS

# Start Expo development server
npx expo start
```

* Press **`w`** for web browser preview or scan the QR code with **Expo Go** on Android / iOS.

---

## 📜 License & Credits

Built for the **KodeHauz@10 Hackathon Decennium Sprint**.  
Powered by **KodeHauz MSFlib Framework**, **OpenAI**, **EMDEX Nigeria**, **NCAIR N-ATLaS**, **Google Gemini**, **Groq Whisper**, and **Cartesia AI**.
