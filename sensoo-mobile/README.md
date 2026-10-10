# Sensoo Mobile 📱🛡️

Sensoo is Nigeria's frontline consumer verification, clinical safety, and anti-counterfeit intelligence mobile app. Built with Expo, React Native, TypeScript, and FastAPI.

## 🚀 Running the App

```bash
# Start Expo development server with tunnel (for physical device testing)
npx expo start --tunnel
```

## 🗺️ Key Screens Directory

| Screen | File | Description |
| :--- | :--- | :--- |
| **Home Dashboard** | `src/app/home.tsx` | Live scan stream, recent verifications, and real-time alerts |
| **Barcode Scanner** | `src/app/scanner.tsx` | Camera scanning with sweeping laser reticle |
| **Live Verification** | `src/app/checking.tsx` | 4-step cryptographic & registry check connected to Render API |
| **Verdict Screen** | `src/app/result.tsx` | Dynamic result (Authentic, Counterfeit, Clone/Reused, Impossible Travel) |
| **NAFDAC Sentinel** | `src/app/sentinel.tsx` | Real-time regulatory portal, live threat clusters, radar, and dossier generator |
| **Dual-Brain AI** | `src/app/agent.tsx` | Gemini 3.1 + Nigerian Sovereign N-ATLaS (Pidgin, Yoruba, Hausa, Igbo) |
| **Voice Assistant** | `src/app/voice-assistant.tsx` | Foreground voice assistant settings with wake-word calibration |

## 🧪 Live Demo Test Barcodes

- **`UNL-FAST-99`** ➔ `AUTHENTIC` (Dettol Antiseptic verified by Reckitt)
- **`UNL-9X4-B2P`** ➔ `ALREADY_PURCHASED` (Clone / Recycled packaging detected)
- **`SNS-SPEED-9999`** ➔ `IMPOSSIBLE_TRAVEL` (Geo-Velocity Anomaly between Lagos & London)
- **`SNS-BABY-1099`** ➔ `WRONG_REGION` (Supply chain diversion outside authorized territory)
- Any unregistered barcode ➔ `COUNTERFEIT` (Not registered in whitelist)
