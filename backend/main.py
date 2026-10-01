"""
Sensoo FastAPI application.
Exposes the two endpoints required by the brief.
All business logic lives in sensoo_core; this file is only HTTP + docs.
"""

from datetime import datetime, timezone
from typing import List, Optional

from fastapi import FastAPI, Query
from pydantic import BaseModel, Field

from msflib import get_engine
from sensoo_core import seed_demo_data, verify_scan

app = FastAPI(
    title="Sensoo Verification API",
    description="Anti-counterfeit scan engine for the KodeHauz@10 Hackathon",
    version="0.2.0",
)

seed_demo_data()


class ScanRequest(BaseModel):
    """Body that a client sends when a product is scanned."""
    role: str = Field(..., description="merchant or consumer")
    code: str = Field(..., description="Product verification code, e.g. UNL-9X4-B2P")
    lat: float = Field(..., description="GPS latitude of the scan")
    lng: float = Field(..., description="GPS longitude of the scan")
    timestamp: Optional[str] = Field(
        None,
        description="ISO-8601 timestamp; defaults to now if omitted",
    )
    device_id: Optional[str] = Field(
        None,
        description="Unique device identifier for clone detection across phones",
    )


class ScanResponse(BaseModel):
    """What the scan endpoint returns to the caller."""
    status: str
    reason: str
    alarms: List[str]
    new_state: Optional[str]
    product_name: Optional[str]
    manufacturer: Optional[str]
    batch_id: Optional[str]


class FeedItem(BaseModel):
    """One row in the dashboard feed."""
    code: str
    role: str
    lat: float
    lng: float
    timestamp: str
    alarms: List[str]
    device_id: Optional[str] = None


@app.post("/scan", response_model=ScanResponse)
def scan_product(body: ScanRequest) -> ScanResponse:
    """Accept a product scan and return AUTHENTIC or FAKE with product details."""
    ts = body.timestamp or datetime.now(timezone.utc).isoformat()
    result = verify_scan(
        role=body.role.lower().strip(),
        code=body.code.strip().upper(),
        lat=body.lat,
        lng=body.lng,
        timestamp=ts,
        device_id=body.device_id,
    )
    return ScanResponse(**result)


@app.get("/feed", response_model=List[FeedItem])
def get_feed(limit: int = Query(20, ge=1, le=100)) -> List[FeedItem]:
    """Return the most recent scans for the government / NAFDAC-style dashboard."""
    engine = get_engine()
    raw = engine.list_recent_scans(limit=limit)
    return [FeedItem(**item) for item in raw]


@app.get("/health")
def health() -> dict:
    """Simple liveness check so the team can confirm the service is up."""
    return {"status": "ok", "service": "sensoo"}


@app.post("/reset")
def reset_database() -> dict:
    """Reset all demo codes, products, and scan histories back to clean IN_STOCK state."""
    seed_demo_data()
    return {"status": "ok", "message": "Demo database successfully reset to clean stock"}

