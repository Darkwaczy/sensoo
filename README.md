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

</div>

---

## Overview

Counterfeit medicines, packaged foods, and cosmetics are a major public safety crisis in Nigeria and broader African markets. Existing verification systems rely on static scratch-off SMS codes that counterfeiters easily clone, reuse, or print onto fake packaging in bulk.

**Sensoo** solves this by pairing product verification codes with **instant geospatial and temporal telemetry**, powered by the **KodeHauz MSFlib** verification engine. When a consumer or merchant scans a product, the client records GPS coordinates and UTC timestamps. The backend validates whether the scan respects physical laws and manufacturer supply-chain boundaries before certifying authenticity.

---

## Detection Rules Engine

Every scan submitted via the client evaluates four core heuristics:

| Rule | Trigger Condition | Result |
| :--- | :--- | :--- |
| **Whitelist Validation** | Scanned code does not exist in the manufacturer batch database. | `INVALID_CODE` &mdash; Product is counterfeit. |
| **Clone & Reuse Check** | Code exists, but its lifecycle state is already `PURCHASED_RETIRED`. | `ALREADY_PURCHASED` &mdash; Packaging reuse or cloned label. |
| **Impossible Physics** | Travel speed between consecutive scans exceeds physical travel limits: <br> `velocity = haversine_distance(loc1, loc2) / elapsed_time > 900 km/h` | `IMPOSSIBLE_PHYSICS` &mdash; Clones circulating concurrently in multiple locations. |
| **Regional Diversion** | First scan occurs outside the manufacturer's designated delivery region. | `WRONG_REGION` &mdash; Supply chain leak or unauthorized territory. |

### Lifecycle State Machine

```
[REGISTERED] -> [SHIPPED] -> [IN_STOCK] -> [PURCHASED_RETIRED]
                   |             |
           (Merchant scan)  (Consumer scan)
```

Once a consumer successfully verifies a product, the code is retired. If that same barcode is ever scanned again anywhere else in the country, the system flags an immediate clone alarm.

---

## KodeHauz MSFlib Engine Integration

Sensoo leverages the **KodeHauz MSFlib (EngineCore)** layer (`backend/msflib.py`) to manage high-throughput product tracking and anomaly detection:

* **Batch & Region Geofencing:** Factory batch registrations record assigned distribution territories and initial batch metadata.
* **Scan Telemetry Ledger:** High-precision GPS coordinates, UTC timestamps, and scan roles are recorded atomically to track the complete product journey.
* **State Lifecycle Mediation:** Validates transitions between `SHIPPED`, `IN_STOCK`, and `PURCHASED_RETIRED` states, ensuring atomic retirement upon consumer purchase.
* **Surveillance Feed:** Powers real-time audit feeds consumed by regulatory monitoring dashboards (e.g. NAFDAC surveillance).

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
│   ├── src/app/              # Expo Router file-based screens (Scanner, Onboarding, Results)
│   ├── src/components/       # UI building blocks and styled primitives
│   ├── assets/               # Production assets (3D graphics, brand assets, icons)
│   └── package.json          # Mobile dependencies and run scripts
│
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

---

## API Contract

### Scan Product

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
  "timestamp": "2026-10-02T14:30:00Z"
}
```

**Authentic Response:**
```json
{
  "status": "AUTHENTIC",
  "reason": "Scan accepted – state now PURCHASED_RETIRED",
  "alarms": [],
  "new_state": "PURCHASED_RETIRED"
}
```

**Flagged Response (Impossible Travel Speed):**
```json
{
  "status": "FAKE",
  "reason": "Impossible Physics – 850 km in 0.2 h (4250 km/h)",
  "alarms": ["IMPOSSIBLE_PHYSICS"],
  "new_state": "IN_STOCK"
}
```

### Surveillance Feed

```http
GET /feed?limit=20
```

Returns recent scan logs with coordinates and alarm statuses for regulatory oversight and NAFDAC audit dashboards.

---

## Team

* **Mavlon** ([@mavlon00](https://github.com/mavlon00)) &mdash; Backend architecture, FastAPI endpoints, data layer
* **Kamalu** ([@Darkwaczy](https://github.com/Darkwaczy)) &mdash; Mobile client, verification UI, interaction design

---

Developed for **KodeHauz@10** &middot; 2026
