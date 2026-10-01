"""
Sensoo pure verification logic.
This file never imports the real MSFlib shape.
It only talks to the thin wrapper methods in msflib.py.
"""

from datetime import datetime, timezone
from math import radians, sin, cos, sqrt, atan2
from typing import Any, Dict, List, Optional

from msflib import get_engine


MAX_REASONABLE_SPEED_KMH = 900.0
EARTH_RADIUS_KM = 6371.0


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return great-circle distance in kilometres between two GPS points."""
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return EARTH_RADIUS_KM * c


def _parse_ts(ts: str) -> datetime:
    """Parse an ISO timestamp string into a timezone-aware datetime."""
    if ts.endswith("Z"):
        ts = ts[:-1] + "+00:00"
    return datetime.fromisoformat(ts).astimezone(timezone.utc)


def verify_scan(
    role: str,
    code: str,
    lat: float,
    lng: float,
    timestamp: str,
    device_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Run the full Sensoo verification pipeline and return status + reason + product info.
    """
    engine = get_engine()
    record = engine.get_code(code)

    if record is None:
        return {
            "status": "FAKE",
            "reason": "Invalid Code – code not registered by any manufacturer",
            "alarms": ["INVALID_CODE"],
            "new_state": None,
            "product_name": None,
            "manufacturer": None,
            "batch_id": None,
        }

    state = record["state"]
    original_region = record.get("region", "")
    previous_scans: List[Dict[str, Any]] = record.get("scans", [])
    product_name = record.get("product_name", "Unknown Product")
    manufacturer = record.get("manufacturer", "Unknown Manufacturer")
    batch_id = record.get("batch_id", "UNKNOWN")

    alarms: List[str] = []
    reason_parts: List[str] = []

    if state == "PURCHASED_RETIRED":
        alarms.append("ALREADY_PURCHASED")
        reason_parts.append("Already Purchased – this code was retired by a previous consumer scan")

    if not previous_scans:
        current_region_guess = _guess_region(lat, lng)
        if current_region_guess and original_region and current_region_guess != original_region:
            alarms.append("WRONG_REGION")
            reason_parts.append(
                f"Wrong Region – first scan in {current_region_guess}, batch shipped to {original_region}"
            )

    if previous_scans:
        last = previous_scans[-1]
        try:
            last_ts = _parse_ts(last["timestamp"])
            this_ts = _parse_ts(timestamp)
            hours = max((this_ts - last_ts).total_seconds() / 3600.0, 0.001)
            dist = haversine_km(last["lat"], last["lng"], lat, lng)
            speed = dist / hours
            if speed > MAX_REASONABLE_SPEED_KMH:
                alarms.append("IMPOSSIBLE_PHYSICS")
                reason_parts.append(
                    f"Impossible Physics – {dist:.0f} km in {hours:.1f} h ({speed:.0f} km/h)"
                )
        except Exception:
            pass

    new_state = state
    if not alarms:
        if role == "merchant":
            if state == "SHIPPED":
                new_state = "IN_STOCK"
        elif role == "consumer":
            if state in ("SHIPPED", "IN_STOCK"):
                new_state = "PURCHASED_RETIRED"
        else:
            return {
                "status": "FAKE",
                "reason": f"Unknown role '{role}' – must be merchant or consumer",
                "alarms": ["INVALID_ROLE"],
                "new_state": None,
                "product_name": product_name,
                "manufacturer": manufacturer,
                "batch_id": batch_id,
            }

    scan_event = {
        "role": role,
        "lat": lat,
        "lng": lng,
        "timestamp": timestamp,
        "alarms": alarms,
        "device_id": device_id,
    }
    engine.append_scan(code, scan_event)

    if not alarms and new_state != state:
        record["state"] = new_state
        engine.update_code(code, record)

    if alarms:
        return {
            "status": "FAKE",
            "reason": " | ".join(reason_parts),
            "alarms": alarms,
            "new_state": state,
            "product_name": product_name,
            "manufacturer": manufacturer,
            "batch_id": batch_id,
        }

    return {
        "status": "AUTHENTIC",
        "reason": f"Scan accepted – state now {new_state}",
        "alarms": [],
        "new_state": new_state,
        "product_name": product_name,
        "manufacturer": manufacturer,
        "batch_id": batch_id,
    }


def _guess_region(lat: float, lng: float) -> str:
    """Very rough mock region guess for demo purposes only."""
    if 4.0 <= lat <= 14.0 and 2.5 <= lng <= 15.0:
        return "NG"
    return "OTHER"


def seed_demo_data() -> None:
    """Load a few realistic codes and previous scans so the demo is not empty."""
    engine = get_engine()
    if hasattr(engine, "clear"):
        engine.clear()

    # 1. Dove Body Wash 250ml (Sample Code)
    engine.register_code(
        "UNL-9X4-B2P",
        region="NG",
        batch_id="BATCH-001",
        product_name="Dove Body Wash 250ml",
        manufacturer="Unilever Nigeria"
    )
    engine.append_scan("UNL-9X4-B2P", {
        "role": "merchant",
        "lat": 6.5244,
        "lng": 3.3792,
        "timestamp": "2026-10-01T09:00:00Z",
        "alarms": [],
        "device_id": "merchant-lagos-01",
    })
    rec = engine.get_code("UNL-9X4-B2P")
    if rec:
        rec["state"] = "IN_STOCK"
        engine.update_code("UNL-9X4-B2P", rec)

    # 2. Dr. Rashel Face Care 50ml (Item No: DRL-1431 / Barcode: 6971764150130)
    for drl_code in ["6971764150130", "DRL-1431"]:
        engine.register_code(
            drl_code,
            region="NG",
            batch_id="BATCH-DRL-1431",
            product_name="Dr. Rashel Face Care 50ml",
            manufacturer="Yiwu Rashel Trading Co., Ltd"
        )
        engine.append_scan(drl_code, {
            "role": "merchant",
            "lat": 6.5244,
            "lng": 3.3792,
            "timestamp": "2026-10-01T08:30:00Z",
            "alarms": [],
            "device_id": "merchant-lagos-01",
        })
        drl_rec = engine.get_code(drl_code)
        if drl_rec:
            drl_rec["state"] = "IN_STOCK"
            engine.update_code(drl_code, drl_rec)

    # 3. Panadol Extra 500mg (Barcode: 5000158105224)
    engine.register_code(
        "5000158105224",
        region="NG",
        batch_id="BATCH-2026-B4",
        product_name="Panadol Extra Tablets 500mg",
        manufacturer="GSK Consumer Healthcare / Haleon"
    )
    pan_rec = engine.get_code("5000158105224")
    if pan_rec:
        pan_rec["state"] = "IN_STOCK"
        engine.update_code("5000158105224", pan_rec)

    # 4. Dove Body Wash EAN (Barcode: 8999990012345)
    engine.register_code(
        "8999990012345",
        region="NG",
        batch_id="BATCH-2026-DV1",
        product_name="Dove Body Wash Deep Moisture 250ml",
        manufacturer="Unilever Nigeria"
    )
    dove_rec = engine.get_code("8999990012345")
    if dove_rec:
        dove_rec["state"] = "IN_STOCK"
        engine.update_code("8999990012345", dove_rec)

    # 5. CeraVe Foaming Cleanser (Barcode: 3606000537008)
    engine.register_code(
        "3606000537008",
        region="NG",
        batch_id="BATCH-2026-CV40",
        product_name="CeraVe Foaming Cleanser 473ml",
        manufacturer="L'Oréal Dermatological"
    )
    cer_rec = engine.get_code("3606000537008")
    if cer_rec:
        cer_rec["state"] = "IN_STOCK"
        engine.update_code("3606000537008", cer_rec)

    # 6. Cloned / Already Purchased Alarm Demo (UNL-CLONE-01)
    engine.register_code(
        "UNL-CLONE-01",
        region="NG",
        batch_id="PCT4502",
        product_name="Panadol Extra 20 tablets",
        manufacturer="GSK Consumer Healthcare"
    )
    engine.append_scan("UNL-CLONE-01", {
        "role": "consumer",
        "lat": 6.5244,
        "lng": 3.3792,
        "timestamp": "2026-10-02T14:00:00Z",
        "alarms": [],
        "device_id": "phone-abc-123",
    })
    rec = engine.get_code("UNL-CLONE-01")
    if rec:
        rec["state"] = "PURCHASED_RETIRED"
        engine.update_code("UNL-CLONE-01", rec)

    # 7. Speed / Impossible Physics Demo (UNL-FAST-99)
    engine.register_code(
        "UNL-FAST-99",
        region="NG",
        batch_id="BATCH-003",
        product_name="Dettol Antiseptic 500ml",
        manufacturer="Reckitt Benckiser"
    )
    engine.append_scan("UNL-FAST-99", {
        "role": "merchant",
        "lat": 6.5244,
        "lng": 3.3792,
        "timestamp": "2026-10-08T10:00:00Z",
        "alarms": [],
        "device_id": "merchant-lagos-02",
    })
    rec = engine.get_code("UNL-FAST-99")
    if rec:
        rec["state"] = "IN_STOCK"
        engine.update_code("UNL-FAST-99", rec)
