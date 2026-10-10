# 🗺️ Sensoo Monorepo Architecture & Screen Map

## 1. Project Organization (Clean Monorepo)

```
d:\ALL Job\Hackathon\
│
├── 📁 sensoo-backend/                 # [LIVE FASTAPI BACKEND]
│   ├── Procfile                       # Render deployment process command
│   ├── requirements.txt               # Backend dependencies (fastapi, uvicorn, msflib, sqlmodel)
│   └── app/
│       ├── main.py                    # App entry point, CORS, and demo seed products
│       ├── router.py                  # Endpoints: POST /scan, GET /feed, POST /register, GET /health
│       ├── actions.py                 # Fraud logic: Whitelist check, Clone check, Velocity anomaly
│       ├── models.py                  # SQLModel schemas for database & scan telemetry
│       ├── online_db_service.py       # EMDEX Nigeria API & OpenFoodFacts Barcode Registry
│       ├── ai_router.py               # RAG queries & clinical safety
│       ├── db.py                      # SQLite / Postgres database engine
│       └── settings.py                # Configuration & environment variables
│
├── 📁 sensoo-mobile/                  # [EXPO REACT NATIVE CLIENT]
│   ├── assets/                        # Icons, shields, and product demo assets
│   ├── src/
│   │   ├── app/                       # Expo Router screens (see Section 2 below)
│   │   ├── components/                # Themed text & view components
│   │   ├── constants/                 # Theme tokens & colors
│   │   ├── hooks/                     # use-color-scheme & use-theme
│   │   └── services/
│   │       ├── sensooApiService.ts    # Live connection to Render backend (/scan, /feed, /health)
│   │       ├── sensooAiService.ts     # Dual-Brain AI (Gemini 3.1 + N-ATLaS Nigerian LLM)
│   │       └── voiceAssistantService.ts # Voice command engine & Groq Whisper transcription
│   ├── app.json                       # Expo configuration
│   ├── eas.json                       # EAS Build & APK profiles
│   └── package.json                   # Dependencies
│
├── render.yaml                        # Automated cloud deployment for Render
├── sensoo.jks                         # Android release signing keystore
└── requirements.txt                   # Root pointer to sensoo-backend/requirements.txt
```

---

## 2. Mobile Screen Catalog (`sensoo-mobile/src/app/`)

All 40 screens are cataloged below by user flow and stage demo purpose:

### 🏆 A. Primary Stage Demo Screens (The 1M Prize Presentation)
| Screen | Path | Purpose |
| :--- | :--- | :--- |
| **Home Dashboard** | `home.tsx` | Main hub displaying Live Scans feed, real-time alerts, quick scan button |
| **Scanner** | `scanner.tsx` | Fullscreen camera view with reticle laser animation for physical barcode scanning |
| **Live Verification** | `checking.tsx` | Animated 4-step cryptographic & registry check connected to Render API |
| **Result** | `result.tsx` | Dynamic scenario screen (Authentic, Counterfeit, Clone/Reused, Impossible Travel) |
| **NAFDAC Sentinel** | `sentinel.tsx` | Regulatory intelligence portal, live cluster map, threat radar, and case dossier |
| **Agentic AI** | `agent.tsx` | Dual-Brain AI Chat (Gemini 3.1 + Nigerian Sovereign N-ATLaS Pidgin/Yoruba/Hausa/Igbo) |
| **Voice Assistant** | `voice-assistant.tsx` | Foreground voice assistant settings & wake-word calibration |

### 🚀 B. Onboarding & Permissions
| Screen | Path | Purpose |
| :--- | :--- | :--- |
| `index.tsx` | `/` | App entry point & splash initialization |
| `get-started.tsx` | `/get-started` | Welcome screen & value proposition |
| `onboarding.tsx` | `/onboarding` | 3-step carousel explaining verification, warnings, and NAFDAC reports |
| `camera-permission.tsx` | `/camera-permission` | Clean permission request for device camera |
| `location-permission.tsx` | `/location-permission` | Clean permission request for GPS fraud geo-velocity detection |

### 🔍 C. Scan Scenarios & History
| Screen | Path | Purpose |
| :--- | :--- | :--- |
| `scan-history.tsx` | `/scan-history` | Timeline view of repeat scans across Nigerian locations |
| `saved-to-history.tsx` | `/saved-to-history` | Confirmation when a scan is saved to user bookmarks |
| `verification-unavailable.tsx` | `/verification-unavailable` | Real offline / network failure screen (zero fake fallback) |
| `product-not-found.tsx` | `/product-not-found` | Displayed when barcode format is unrecognized |
| `scan-failed.tsx` | `/scan-failed` | Guidance when camera lighting or barcode focus fails |

### 🚨 D. NAFDAC Fraud Reporting (9 Incident Screens)
| Screen | Path | Purpose |
| :--- | :--- | :--- |
| `report-product.tsx` | `/report-product` | Primary incident intake form (seller, market location, reason) |
| `report-submitted.tsx` | `/report-submitted` | Regulatory case tracking number and confirmation |
| `report-details.tsx` | `/report-details` | Detailed dossier view of an active report |
| `report-status.tsx` | `/report-status` | Enforcement timeline (Under Review -> Action Taken -> Closed) |
| `report-edit.tsx` | `/report-edit` | Update report information or add photos |
| `report-updated.tsx` | `/report-updated` | Confirmation of report edits |
| `report-review-complete.tsx` | `/report-review-complete` | Regulator review notification |
| `report-closed.tsx` | `/report-closed` | Enforcement resolution summary |
| `report-delete.tsx` | `/report-delete` | Withdraw a report |

### ⚙️ E. Settings, Regional Info & Legal
| Screen | Path | Purpose |
| :--- | :--- | :--- |
| `profile.tsx` | `/profile` | Account settings, app version, language selection |
| `notifications.tsx` | `/notifications` | Live push notifications for counterfeit detections |
| `personal-info.tsx` | `/personal-info` | Consumer / Merchant profile data |
| `location-region.tsx` | `/location-region` | Geofence region selector (Lagos, Kano, Abuja, etc.) |
| `regional-info.tsx` | `/regional-info` | Information on supply chain territorial diversion |
| `privacy-security.tsx` | `/privacy-security` | Zero-knowledge biometric voiceprint settings |
| `about-sensoo.tsx` | `/about-sensoo` | Mission, GS1 partnership, and NAFDAC Sentinel background |
| `how-it-works.tsx` | `/how-it-works` | Technical explanation of the 4 Sensoo anti-fraud alarms |
| `help-support.tsx` | `/help-support` | FAQ and contact info |
| `send-feedback.tsx` | `/send-feedback` | Direct feedback form |
| `privacy-policy.tsx` | `/privacy-policy` | Official NDPR & GDPR compliant privacy policy |
| `terms-of-service.tsx` | `/terms-of-service` | Terms of service |
| `acknowledgements.tsx` | `/acknowledgements` | Open source & regulatory attribution |

---

## 3. Real Backend Test Codes (For Live Demo)

| Code | Expected Live Verdict | Reason Shown to Judges |
| :--- | :--- | :--- |
| **`UNL-FAST-99`** | `AUTHENTIC` | **Dettol Antiseptic** verified in manufacturer registry |
| **`UNL-9X4-B2P`** | `ALREADY_PURCHASED` | **Already Purchased / Clone Detection** (duplicate reuse) |
| **`SNS-SPEED-9999`** | `IMPOSSIBLE_TRAVEL` | **Geo-Velocity Anomaly** (concurrent scans in Lagos & London) |
| **`SNS-BABY-1099`** | `WRONG_REGION` | **Supply Chain Diversion** (authorized for Kano, scanned in Lagos) |
| **`ANY-RANDOM-BARCODE`** | `COUNTERFEIT` | **Unregistered Product** (not in national whitelist) |
