<!-- Sensoo Product Verification System -->
<div align="center">

<br/>
<img src="sensoo-mobile/assets/logo.png" alt="Sensoo Logo" width="240" />
<br/><br/>

**Real-Time Product Verification & Anti-Counterfeit Telemetry System**

Built for the KodeHauz@10 Hackathon &middot; Decennium Sprint

[![React Native](https://img.shields.io/badge/React_Native-Expo_52+-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactnative.dev)
[![KodeHauz MSFlib](https://img.shields.io/badge/Engine-KodeHauz_MSFlib_v0.2.1-0E3B20?style=flat-square)](https://github.com/mavlon00/sensoo-app-final)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.143.0-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![EMDEX API](https://img.shields.io/badge/Registry-EMDEX_Nigeria-107C41?style=flat-square)](https://sandbox.emdexapi.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Gemini](https://img.shields.io/badge/Gemini-3.8_Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![N-ATLaS](https://img.shields.io/badge/NCAIR-N--ATLaS-006B3F?style=flat-square)](https://huggingface.co/NCAIR1/N-ATLaS)

</div>

---

## Executive Summary

**Sensoo** is a full-stack anti-counterfeit verification platform that protects consumers and supply chains from fake pharmaceuticals, toxic cosmetics, and adulterated consumer goods across Nigeria and emerging markets.

By pairing product codes with **real-time geospatial and temporal telemetry**, Sensoo evaluates scans against **KodeHauz MSFlib engine rules** to detect cloned labels, regional diversion, and impossible flight-speed travel anomalies before certifying authenticity.

---

## 🏗️ Architecture & Monorepo Structure

```
sensoo/ (branch: main)
├── sensoo-backend/            # KodeHauz MSFlib FastAPI Backend Server
│   ├── app/
│   │   ├── actions.py         # MSFlib ModelAction 4-Alarm Verification Engine
│   │   ├── ai_router.py       # MSFlib AI API Transport Router (/api/v1/ai/*)
│   │   ├── online_db_service.py # Real-Time EMDEX & Global Barcode API Gateway
│   │   ├── db.py              # SQLModel Database Engine & Session Provider
│   │   ├── main.py            # FastAPI Entry Point with CORS & EventBus Emitter
│   │   ├── models.py          # MSFlib ModelBase Schema Definitions
│   │   ├── router.py          # Sensoo API Router (/api/v1/*)
│   │   └── settings.py        # Environment & Configuration Settings
│   ├── requirements.txt       # Dependencies (FastAPI, SQLModel, httpx, uvicorn)
│   ├── Procfile               # Deployment Process Manager
│   └── render.yaml            # Render Cloud Deployment Blueprint
│
├── sensoo-mobile/             # Consumer Mobile Application (Expo / React Native)
│   ├── src/
│   │   ├── app/               # Expo Router File-Based Navigation (Scanner, Agent, Feed)
│   │   ├── components/        # Reusable UI Elements, Verdict Cards, Maps
│   │   └── services/          # Sensoo API Service, Dual-Brain AI Service, Voice Service
│   ├── assets/                # Logos, 3D Shields, Product Images
│   └── package.json           # Dependencies (React Native, Expo, Lucide)
└── README.md
```

---

## ⚡ KodeHauz MSFlib Framework Integration

The backend is built natively on top of the **KodeHauz `msflib` framework (v0.2.1)**:

| MSFlib Component | Architectural Role in Sensoo |
| :--- | :--- |
| **`msflib.models.ModelBase`** | Base schema inheritance for `ProductCode` and `ScanTelemetryRecord` tables, providing automated primary keys, timestamps, and JSON serialization. |
| **`msflib.actions.ModelAction`** | Encapsulates transaction-safe CRUD data access and extends verification execution logic in `VerificationAction`. |
| **`msflib.eventbus.bind_app_emitter`** | Binds the `msflib` event emitter to the FastAPI application instance for real-time telemetry broadcasts. |
| **`msflib.ai_api`** | Standardized AI transport specification defining `/api/v1/ai/ask`, `/api/v1/ai/search`, and `/api/v1/ai/status`. |

---

## 🌐 Real-Time Online Database Integrations

In addition to local database verification, `sensoo-backend` queries online databases in real time whenever an unseeded barcode or drug is scanned:

1. **EMDEX Nigeria Pharmaceutical Database API (`sandbox.emdexapi.com`)**
   * Verifies registered pharmaceutical brand names, active ingredients, dosage strengths, and licensed manufacturers in Nigeria.
2. **Global Consumer Barcode Registry API (`world.openfoodfacts.org`)**
   * Real-time GTIN / EAN-13 barcode lookups for packaged foods, beverages, cosmetics, and household items.

---

## 🛡️ The 4 Mandatory Security Alarms

When a scan payload `{ code, role, lat, lng, timestamp, device_id, region }` is received at `/api/v1/scan`, it is evaluated against 4 alarm rules:

1. **Invalid Code:** Code does not exist in manufacturer database, EMDEX registry, or Global Barcode index.
2. **Already Purchased (Clone Reuse):** Code exists, but its lifecycle state is marked `PURCHASED` or `RETIRED`. High probability of cloned packaging.
3. **Geo-Velocity Anomaly ("Impossible Physics"):** Calculates travel velocity between consecutive scans using the **Haversine formula**:
   $$\text{Velocity} = \frac{\text{HaversineDistance}(\text{loc}_1, \text{loc}_2)}{\Delta t} > 900 \text{ km/h}$$
   Flags concurrent clone distribution circulating in distant cities.
4. **Supply Chain Diversion (Wrong Region):** Scanned outside the manufacturer's authorized distribution region.

---

## 🤖 Dual-Brain Agentic AI System

Sensoo features a voice and text conversational assistant with **Dual-Brain Orchestration**:

* **Brain 1 — `NCAIR1/N-ATLaS` (Sovereign Language Core):**
  Understands Nigerian cultural context, local markets (Idumota, Balogun, Ariaria, Alaba, Wuse), and indigenous Nigerian languages (**Pidgin**, **Yorùbá**, **Hausa**, **Igbo**).
* **Brain 2 — `Gemini 3.1 / 2.5 Flash Lite` (Reasoning & Action Core):**
  Parses intents, performs clinical safety triage if counterfeit medication was ingested, and executes autonomous UI tool calls:
  * `trigger_camera_scan`: Automatically launches the camera barcode scanner.
  * `submit_fraud_report`: Automatically files a dossier to NAFDAC Sentinel surveillance.

---

## 📡 API Reference & Endpoints

**Live Production Base URL:** `https://sensoo-app-final-2.onrender.com`  
**Interactive Swagger Docs:** `https://sensoo-app-final-2.onrender.com/docs`

### Core Verification & Telemetry

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/scan` | Submits scan telemetry (`code, lat, lng, device_id`) and returns verification status & alarms. |
| `POST` | `/api/v1/register` | Registers new genuine product barcodes into the manufacturer registry. |
| `GET` | `/api/v1/feed` | Returns live scan telemetry activity feed for NAFDAC-style monitoring maps (`?limit=50`). |
| `GET` | `/api/v1/health` | Health check endpoint returning backend service status. |

### MSFlib AI Transport Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/ai/ask` | Accepts health or safety queries and returns MSFlib RAG guidance enriched with live EMDEX lookups. |
| `POST` | `/api/v1/ai/search` | Performs real-time similarity search over EMDEX and verified product indices. |
| `GET` | `/api/v1/ai/status` | Returns MSFlib AI engine module and vector backend status. |

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
# EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
# EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key

# Start Expo development server
npx expo start
```

* Press **`w`** for web browser preview or scan the QR code with **Expo Go** on Android / iOS.

---

## 📜 License & Credits

Built for the **KodeHauz@10 Hackathon Decennium Sprint**.  
Powered by the **KodeHauz MSFlib Framework**, **EMDEX Nigeria**, **NCAIR N-ATLaS**, and **Google Gemini**.
