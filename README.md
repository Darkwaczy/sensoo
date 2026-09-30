# 🛡️ Sensoo — Real Products. Safer Lives.

> **Anti-Counterfeit & Telemetry-Backed Product Verification System for Nigeria**  
> *Developed for the KodeHauz@10 Hackathon (Decennium Sprint)*

---

## 📌 1. Project Overview & Vision

Counterfeit pharmaceuticals, cosmetics, and packaged consumables pose a catastrophic threat to public health and consumer trust across Nigeria and emerging markets. 

**Sensoo** is a real-time, consumer-first verification platform powered by geospatial telemetry and impossible-physics anomaly detection. By capturing device GPS coordinates, UTC timestamps, and manufacturer batch registries at the exact second a barcode or QR code is scanned, Sensoo instantly differentiates genuine goods from circulating packaging clones, supply-chain diversions, and counterfeit products.

* **Tagline:** *"Trusted products. Healthier people. Know what you buy. Help stop fake products and keep your community safe."*

---

## 🏗️ 2. System Architecture

The repository is organized into a clean full-stack monorepo:

```
sensoo/
├── backend/                  # Python FastAPI Verification Server
│   ├── main.py               # REST API endpoints (/scan, /feed, /health)
│   ├── sensoo_core.py        # Core anomaly detection & Haversine velocity rules engine
│   ├── msflib.py             # High-speed data persistence & cluster registry mock
│   └── requirements.txt      # Python dependencies (FastAPI, Uvicorn, Pydantic)
│
├── sensoo-mobile/            # React Native / Expo Consumer Mobile App
│   ├── src/app/              # Expo Router file-based screens (Splash, Onboarding, Scanner, Results, Profile)
│   ├── src/components/       # Reusable UI components & custom theme primitives
│   ├── src/constants/        # Colors, fonts, and layout constants
│   ├── assets/               # Brand assets (3D Shield, wave graphics, icons)
│   └── package.json          # Node dependencies & Expo runtime scripts
│
├── .gitignore                # Production git ignore rules
└── README.md                 # System documentation & setup guide
```

---

## 🚨 3. Fraud Detection & The 4 Mandatory Alarms

Every scan submitted from the Sensoo mobile application transmits high-precision telemetry:
* `code` (string): Scanned alphanumeric code (e.g., `UNL-9X4-B2P`).
* `lat` & `lng` (float): High-precision GPS coordinates from device location sensors.
* `role` (string): `consumer` or `merchant`.
* `timestamp` (ISO-8601 UTC): Verified scan event timestamp.

The backend engine processes this telemetry through **4 mandatory fraud detection rules**:

| # | Alarm Code | Condition | Verdict |
|---|---|---|---|
| 1 | `INVALID_CODE` | Code does not exist in authorized manufacturer batch registry | **Counterfeit Product.** Fake label / unregistered barcode. |
| 2 | `ALREADY_PURCHASED` | Code exists in registry, but its lifecycle state is already `PURCHASED_RETIRED` | **Clone Packaging Reuse.** A genuine container or QR code was duplicated or refilled. |
| 3 | `IMPOSSIBLE_PHYSICS` | Same code scanned in two locations where $\text{Velocity} = \frac{\text{Distance}}{\Delta t} > 900\text{ km/h}$ | **Impossible Travel Speed.** Concurrently circulating counterfeit clones detected in different cities. |
| 4 | `WRONG_REGION` | First scan occurs outside the manufacturer's authorized delivery territory | **Supply Chain Diversion.** Unauthorized distribution territory breach. |

### ✅ Authentic State
When a code is in the registry, within its valid lifecycle (`SHIPPED` / `IN_STOCK`), matches its designated territory, and passes the velocity checks:
* **Result:** `AUTHENTIC`
* **Lifecycle Update:** Advances to `PURCHASED_RETIRED` upon consumer scan to permanently protect future buyers from clone attacks.

---

## 🚀 4. Getting Started

### Prerequisites
* **Node.js** (v18 or higher) & **npm**
* **Python** (v3.9 or higher)
* **Expo Go** app (optional, for physical iOS/Android testing)

---

### Backend Setup (FastAPI)

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Launch the API server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

5. Access interactive Swagger API docs at:
   👉 **http://localhost:8000/docs**

---

### Mobile App Setup (React Native / Expo)

1. Navigate to the `sensoo-mobile` folder:
   ```bash
   cd sensoo-mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Testing Options:
   * Press **`w`** in the terminal to launch the **Web preview** in your browser.
   * Scan the terminal QR code using **Expo Go** on an Android or iOS device.

---

## 📡 5. API Reference

### 1. Verify Product Scan
* **Endpoint:** `POST /scan`
* **Description:** Verifies scanned barcode/QR against the registry, applies telemetry heuristics, and returns safety verdict.

**Request Body:**
```json
{
  "role": "consumer",
  "code": "UNL-9X4-B2P",
  "lat": 6.5244,
  "lng": 3.3792,
  "timestamp": "2026-10-02T15:30:00Z"
}
```

**Response (Authentic):**
```json
{
  "status": "AUTHENTIC",
  "reason": "Scan accepted – state now PURCHASED_RETIRED",
  "alarms": [],
  "new_state": "PURCHASED_RETIRED"
}
```

**Response (Impossible Physics Clone):**
```json
{
  "status": "FAKE",
  "reason": "Impossible Physics – 850 km in 0.2 h (4250 km/h)",
  "alarms": ["IMPOSSIBLE_PHYSICS"],
  "new_state": "IN_STOCK"
}
```

---

### 2. Live Surveillance Feed
* **Endpoint:** `GET /feed?limit=20`
* **Description:** Real-time stream of recent scans for the NAFDAC / regulatory surveillance dashboard.

---

### 3. Health Check
* **Endpoint:** `GET /health`
* **Response:** `{"status": "ok", "service": "sensoo"}`

---

## 👥 Contributors

* **Mavlon** ([@mavlon00](https://github.com/mavlon00)) — Backend Architecture & Verification Engine
* **Kamalu** ([@Darkwaczy](https://github.com/Darkwaczy)) — Mobile Application & User Experience

---

## 📄 License
This project is proprietary and developed for the **KodeHauz@10 Hackathon**. All rights reserved.
