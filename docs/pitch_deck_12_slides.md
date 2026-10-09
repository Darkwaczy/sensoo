# Sensoo — Hackathon Pitch Deck (12 Slides)

**KodeHauz @ 10 Hackathon**  
_Theme: Trusted Products. Healthier People._

---

## Slide 1: The Title & Hook

- **Slide Title:** **SENSOO**
- **Subtitle:** Protecting Everyday Consumers from Deadly Counterfeits Through Real-Time Telemetry & Impossible-Physics Anomaly Detection.
- **Tagline:** _"Trusted Products. Healthier People. Know what you buy before it harms your family."_
- **Presenter Info:** Team Sensoo | Built with Expo React Native & MSFLib / FastAPI.
- **Visual Cue / Imagery:** Split screen — on the left, an ominous counterfeit drug bottle with faded packaging; on the right, the gleaming Sensoo 3D emerald verification shield displaying _"VERIFIED GENUINE"_.

---

## Slide 2: The Silent Crisis (The Problem)

- **Slide Title:** **Counterfeits Are Killing Us — And Getting Smarter Every Day**
- **The Reality on the Ground:**
  - Over **100,000 deaths annually in Africa** are linked to fake pharmaceuticals (WHO data).
  - In Nigeria, counterfeiters don't just copy cheap aspirin — they replicate pediatric syrups, life-saving antimalarials, baby foods, cosmetics, and packaged food staples.
  - Billions of Naira are spent annually by government agencies like NAFDAC fighting syndicates, yet fake packaging looks **100% indistinguishable** to the naked human eye.
- **The Emotional Punch:**
  > _"Today it is a stranger in the news. Tomorrow, it is the malaria syrup you bought down the street for your child. Counterfeiting is not just economic fraud — it is corporate homicide."_

---

## Slide 3: Why Legacy Solutions Failed

- **Slide Title:** **The Failure of the "Scratch & SMS" Era**
- **The Status Quo:**
  1. **Friction:** Scratching a silver panel, typing a 12-digit code into SMS, waiting 3 minutes for a response while standing awkwardly before a vendor.
  2. **Airtime Penalties:** Rural & low-income shoppers won't spend ₦30-₦50 airtime just to check a ₦500 packet of paracetamol.
  3. **The Counterfeiter Workaround:** Syndicates buy genuine packets, clone the identical scratch PIN onto **10,000 fake packets**, and distribute them simultaneously across different states!
- **The Blind Spot:** SMS has **no location awareness**, **no velocity tracking**, and **no real-time intelligence**. Once a genuine PIN is printed, legacy systems are blind to the clones.

---

## Slide 4: Introducing Sensoo (The Solution)

- **Slide Title:** **Sensoo: Instant Verification at the Speed of Light**
- **What is Sensoo?**
  A high-speed, consumer-first mobile verification platform that turns every citizen’s smartphone into an active regulatory watchdog.
- **Core Pillars:**
  1. **Zero-Friction Camera Scan:** Scan DataMatrix / Barcode / QR in under 200 milliseconds.
  2. **Hardware-Enforced Telemetry:** Every scan binds the product code with GPS coordinates, ISO timestamp, and device fingerprint.
  3. **Instant Consumer Action:** Clear, unambiguous verdicts — Green (_Genuine_), Red (_Counterfeit / Tampered_), impossible travel - same barcode scanned in a different locations within a short time,clone/already purchased plus an AI Voice Assistant giving instant safety guidance in simple everyday English.

---

## Slide 5: The Secret Sauce: The 4 Mandatory Alarms

- **Slide Title:** **The Sensoo Anomaly & Fraud Engine**
- **How Sensoo Catches What Humans Cannot:**
  1. **Whitelist Validation (`FAKE`):** Instant rejection if the code does not exist in authorized manufacturer batch registries.
  2. **Lifecycle State Check (`ALREADY_PURCHASED`):** If a genuine code was already bought and registered, subsequent scans flag it as a cloned label reuse.
  3. **Geo-Velocity Anomaly (`IMPOSSIBLE_PHYSICS`):**
     $$\text{Velocity} = \frac{\text{Distance}(\text{Location}_1, \text{Location}_2)}{\Delta t} > 900\text{ km/h}$$
     _If a batch code is scanned in Lagos at 10:00 AM and again in Kano at 10:20 AM, that’s physically impossible. Clones circulating concurrently are flagged instantly._
  4. **Supply Chain Diversion (`WRONG_REGION`):** Identifies goods diverted outside authorized distribution geofences (e.g. state-subsidized clinic batches showing up in open retail markets).

---

## Slide 6: Product Walkthrough & Consumer Experience

- **Slide Title:** **Sensoo Mobile: Designed for Every Nigerian**
- **Key Features Demonstrated on Mobile (`sensoo-mobile`):**
  - **Sleek, High-Confidence UI:** Modern emerald and obsidian palette; clear visual hierarchy designed to avoid consumer confusion.
  - **Instant Camera & GPS Integration:** Real-time sensor telemetry with graceful permission fallbacks.
  - **Interactive AI Voice & Chat Companion:** Real-time voice triage answering questions like: _"Is this batch expired?"_, _"What should I do if this code is fake?"_, and _"Where is the nearest verified pharmacy?"_
  - **Community Reporting & Hotspot Map:** Anonymized crowd-sourced reports alert neighborhoods when a batch of fake juice or drugs is circulating nearby.

---

## Slide 7: Live Demo: The Counterfeit Catch

- **Slide Title:** **Live Demonstration: Catching the Clone in Real Time**
- **Demo Scenario 1: The Authentic Purchase**
  - Scan genuine Lonart antimalarial code in Ikeja, Lagos.
  - Status: **GENUINE** (Batch registered, shelf-ready, registered to Lagos district).
- **Demo Scenario 2: The Syndicate Clone (Impossible Physics)**
  - Scan duplicate packaging code in Eket 2 minutes later.
  - Status: **IMPOSSIBLE_PHYSICS ALARM TRIGGERED!**
  - Real-time map flashes red: Alert pushed to authorities; consumer instructed not to consume.
- **Demo Scenario 3: The Unregistered Counterfeit**
  - Scan rogue packaging with unlisted barcode.
  - Status: **COUNTERFEIT DETECTED**; one-tap direct incident report generated.

---

## Slide 8: Technical Architecture & MSFLib Integration

- **Slide Title:** **Enterprise Backend Powered by MSFLib**
- **Composable Architecture (`github.com/msflib/fastapi`):**
  - **`msflib.models.ModelBase`:** Standardized data models for `ManufacturerBatch`, `ProductCode`, and `ScanTelemetry`.
  - **`msflib.actions.ModelAction`:** Encapsulates the 4-alarm verification logic cleanly outside the HTTP layer.
  - **`msflib.eventbus` (`app_emitter`):** In-process pub/sub event bus triggering `fraud:counterfeit-detected` events asynchronously for notifications and audit logging.
  - **`msflib-ai` (`ai-core`):** Powers Sensoo’s NAFDAC Safety Assistant with prompt templates, tools, and streaming guidance.
  - **`msflib.db.seed` (YAML):** Automated batch data seeding via `SeedRunner` to simulate live NAFDAC/GS1 manufacturer registries.

---

## Slide 9: Business Model & Market Opportunity

- **Slide Title:** **Monetization & Scalable Value Creation**
- **B2B SaaS for Manufacturers (FMCG & Pharma):**
  - **Brand Protection Dashboard:** Real-time visibility into product velocity, counterfeit hotspots, and unauthorized grey-market diversions.
  - **API Verification Pricing:** Per-batch or subscription tiers for packaging printers and pharmaceutical giants (Emzor, Fidson, Nestlé, Unilever).
- **B2G (Government & Regulatory Subscriptions):**
  - **Regulatory Heatmap for NAFDAC / FCCPC:** Real-time intelligence feed pinpointing counterfeit distribution hubs before they cause mass hospitalizations.
- **Consumer Tier:** 100% free forever for the public to maximize adoption.

---

## Slide 10: Competitive Advantage

- **Slide Title:** **Why Sensoo Wins Where Others Stalled**

| Feature                       | Legacy NAFDAC MAS (SMS) | Standard QR Scanners | **Sensoo**                                 |
| :---------------------------- | :---------------------- | :------------------- | :----------------------------------------- |
| **Cost to Consumer**          | ₦10–₦50 Airtime / scan  | Free                 | **100% Free**                              |
| **Verification Speed**        | 30s to 3 minutes        | 1 second             | **< 200 milliseconds**                     |
| **Clone / Physics Detection** | ❌ None                 | ❌ None              | **✅ Impossible Physics (Speed/Distance)** |
| **Geofenced Diversion Alert** | ❌ None                 | ❌ None              | **✅ Regional Boundary Check**             |
| **Voice / AI Guidance**       | ❌ None                 | ❌ None              | **✅ Interactive AI Voice Assistant**      |
| **Regulatory Live Feed**      | ❌ Delayed              | ❌ None              | **✅ Real-time Anomaly Event Bus**         |

---

## Slide 11: Roadmap & Future Vision

- **Slide Title:** **From Hackathon Prototype to National Safeguard**
- **Phase 1 (Now - Hackathon MVP):**
  - High-precision mobile verification app + 4-alarm telemetry engine on MSFLib + AI safety assistant.
- **Phase 2 (Next 6 Months — Manufacturer Pilots):**
  - Direct ERP integration with top 3 Nigerian pharmaceutical manufacturers & packaging partners.
  - Offline SMS/USSD relay fallback for non-smartphone feature phone users.
- **Phase 3 (12 Months — Pan-African Expansion):**
  - Integration with the African Continental Free Trade Area (AfCFTA) digital product passports.
  - Computer vision holographic micro-print tamper detection.

---

## Slide 12: The Pitch Call-To-Action (Closing)

- **Slide Title:** **Trusted Products. Healthier People.**
- **The Closing Statement:**
  > _"Counterfeiters bet on two things: consumer ignorance and regulatory blindness. With Sensoo, we eliminate both._  
  > _Every smartphone becomes a shield. Every scan saves a life._  
  > _Thank you — let’s build a counterfeit-free world together."_
- **Q&A Invitation:**
  - **Open for Questions & Live Interactive Mobile Demo**
  - **GitHub:** `github.com/mavlon00/sensoo`
