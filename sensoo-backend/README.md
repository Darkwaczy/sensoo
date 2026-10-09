# Sensoo Backend

FastAPI backend for the Sensoo anti-counterfeiting platform.

## Stack
- **FastAPI** + **SQLModel** (SQLite)
- **msflib** — internal framework (ModelBase, ModelAction, eventbus)
- **uvicorn** — ASGI server

## Setup

```bash
cd sensoo-backend

# 1. Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 2. Install msflib (requires private token)
pip install "msflib @ git+https://<TOKEN>@github.com/msflib/fastapi.git@core-v0.2.1#subdirectory=core"

# 3. Install remaining dependencies
pip install -r requirements.txt

# 4. Copy env file
cp .env.example .env

# 5. Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/scan` | Scan & verify a product code |
| `POST` | `/api/v1/register` | Register a new product code |
| `GET`  | `/api/v1/feed` | Recent scan telemetry feed |
| `GET`  | `/api/v1/health` | Health check |

## Scan Response

```json
{
  "status": "AUTHENTIC" | "FAKE",
  "reason": "...",
  "alarms": [],
  "new_state": "...",
  "product_name": "...",
  "manufacturer": "...",
  "batch_id": "..."
}
```

## Alarms
- **Invalid Code** — product code not found in DB
- **Already Purchased (clone detection)** — code already retired
- **Impossible Physics** — Haversine speed > 900 km/h between scans
- **Wrong Region** — scan region doesn't match product's registered region

## Demo Products (seeded on startup)

| Code | Product | State |
|------|---------|-------|
| `UNL-9X4-B2P` | Dove Body Wash 250ml | IN_STOCK |
| `UNL-CLONE-01` | Panadol Extra | PURCHASED_RETIRED |
| `UNL-FAST-99` | Dettol | IN_STOCK |

API docs: **http://localhost:8000/docs**
