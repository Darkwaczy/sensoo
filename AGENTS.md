# AGENTS.md — Sensoo Project Guidelines

## 1. Project Overview & Vision
* **Project Name:** **Sensoo** (Consumer Anti-Counterfeit & Verification System).
* **Tagline:** *"Trusted products. Healthier people. Know what you buy. Help stop fake products and keep your community safe."*
* **Core Mission:** Protect consumers and supply chains from counterfeit and adulterated goods through real-time telemetry-backed verification, impossible-physics anomaly detection, and instant consumer safety feedback.

---

## 2. System Architecture

```
d:\ALL Job\Hackathon\
├── sensoo-mobile/          # Expo / React Native consumer mobile application
│   ├── src/app/            # Expo Router file-based screens (splash, onboarding, scanner, explore)
│   ├── src/components/     # Reusable UI elements, themed components
│   └── assets/             # Brand assets (3D Shield, logo, icons)
├── msflib.py               # KodeHauz Framework Mock/Integration (EngineCore, cluster nodes)
├── sensoo_engine.py        # Core product verification & fraud anomaly detection engine
├── core_monitor.py         # Live cluster health & telemetry dashboard ("Judge Pleaser")
├── main.py                 # Live hackathon interactive demonstration runner
└── resources/              # Presentation graphics & brand resources
```

---

## 3. Fraud Detection & Alarm Rules Engine

Every scan submitted to Sensoo **must** carry telemetry:
* `code` (string): Scanned barcode / QR identifier.
* `timestamp` (ISO-8601 UTC): Exact time of scan.
* `latitude` & `longitude` (float): High-precision GPS coordinates from `expo-location`.
* `region` (string): Geofenced administrative boundary or state (e.g., "Lagos", "Abuja", "Eket").
* `device_id` / `user_id` (string): Unique client identifier.

### The 4 Mandatory Alarms:
1. **Whitelist Validation:**
   * **Condition:** Code does not exist in authorized manufacturer batch database.
   * **Alarm Code:** `FAKE`
   * **Verdict:** Counterfeit product. Invalid manufacturer code.
2. **Lifecycle State Check (Clone / Reuse Detection):**
   * **Condition:** Code exists in database, but its lifecycle state is already marked `PURCHASED` or `RETIRED`.
   * **Alarm Code:** `ALREADY_PURCHASED`
   * **Verdict:** Duplicate scan. High probability of cloned packaging or reused label.
3. **Geo-Velocity Anomaly ("Impossible Physics"):**
   * **Condition:** The same code is scanned in two locations where the distance divided by the elapsed time gap exceeds physical travel limits:
     $$\text{Velocity} = \frac{\text{HaversineDistance}(\text{loc}_1, \text{loc}_2)}{\Delta t} > 900 \text{ km/h}$$
   * **Alarm Code:** `IMPOSSIBLE_PHYSICS`
   * **Verdict:** Impossible travel speed between scan events. Concurrently circulating counterfeit clones detected.
4. **Supply Chain Diversion (Wrong Region):**
   * **Condition:** First scan occurs outside the manufacturer's authorized delivery territory / geofenced region for that batch.
   * **Alarm Code:** `WRONG_REGION`
   * **Verdict:** Unauthorized distribution territory or supply-chain diversion detected.

### Success State:
* **Condition:** Code in whitelist, state is `ACTIVE_IN_TRANSIT` or `SHELF_READY`, within assigned region, and passes velocity checks.
* **Result:** `GENUINE` (State updates to `PURCHASED`, location history logged).

---

## 4. MSFlib Cluster Distribution & Verification Workloads

When batch verification requests or high-frequency consumer scans arrive:
1. **Sensoo Engine** verifies scan telemetry against manufacturer registries and historical geospatial scans.
2. **MSFlib (`EngineCore`)** boots multi-node clusters and distributes verification workloads across nodes concurrently.
3. **CoreMonitor** visualizes live node load, verification throughput, and fraud detection metrics for judges.

---

## 5. Development & Execution Protocols

### Mobile App (`sensoo-mobile`)
* **Working Directory:** All mobile commands **must** be executed within the `sensoo-mobile` subdirectory:
  ```powershell
  cd sensoo-mobile
  npx expo start
  ```
* **Styling & Theme:** Maintain brand design with clean modern visuals, emerald green accents (`#10B981` / `#059669`), crisp typography, and fluid screen transitions.
* **Sensors:** Use `expo-location` and camera / barcode scanner with graceful permission fallbacks.

### Backend & Demo Scripts
* **Python Scripts:** Run from root workspace (`d:\ALL Job\Hackathon`):
  ```powershell
  python main.py
  ```
* **Judge Presentation:** Keep dashboard displays colorful, clean, and real-time using terminal ASCII/ANSI gauges, clear alert emojis, and timed step delays for maximum visual impact.

---

## 6. Implementation Checklist
- [ ] Create `sensoo_engine.py` with the 4-alarm verification logic (Haversine formula, manufacturer whitelist DB, state machine, and scan history).
- [ ] Update `main.py` to demonstrate all 4 Sensoo alarm cases alongside authentic product scans routed through `msflib`.
- [ ] Remove legacy `pulse_check.py` emergency broadcast references.
- [ ] Build the interactive Scanner & Results UI in `sensoo-mobile` with GPS coordinates and instant alarm feedback cards.
