"""
Sensoo pure verification logic.
This file never imports the real MSFlib shape.
It only talks to the thin wrapper methods in msflib.py.
"""

from datetime import datetime, timezone
from math import radians, sin, cos, sqrt, atan2
from typing import Any, Dict, List, Optional, Tuple

from msflib import get_engine


# Tunable constants (easy to show judges)
MAX_REASONABLE_SPEED_KMH = 900.0   # roughly commercial aircraft
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
    # Accept both with and without Z
    if ts.endswith("Z"):
        ts = ts[:-1] + "+00:00"
    return datetime.fromisoformat(ts).astimezone(timezone.utc)


def verify_scan(
    role: str,
    code: str,
    lat: float,
    lng: float,
    timestamp: str,
) -> Dict[str, Any]:
    """
    Run the full Sensoo verification pipeline and return status + reason.
    role must be 'merchant' or 'consumer'.
    """
    engine = get_engine()
    record = engine.get_code(code)

    # Alarm 1: Invalid Code
    if record is None:
        return {
            "status": "FAKE",
            "reason": "Invalid Code – code not registered by any manufacturer",
            "alarms": ["INVALID_CODE"],
            "new_state": None,
        }

    state = record["state"]
    original_region = record.get("region", "")
    previous_scans: List[Dict[str, Any]] = record.get("scans", [])

    alarms: List[str] = []
    reason_parts: List[str] = []

    # Alarm 2: Already Purchased (clone)
    if state == "PURCHASED_RETIRED":
        alarms.append("ALREADY_PURCHASED")
        reason_parts.append("Already Purchased – this code was retired by a previous consumer scan")

    # Alarm 4: Wrong Region (only on the very first scan)
    if not previous_scans:
        # crude region check: we just store a string region for the mock
        # in real life this would be a proper geo-fence
        current_region_guess = _guess_region(lat, lng)
        if current_region_guess and original_region and current_region_guess != original_region:
            alarms.append("WRONG_REGION")
            reason_parts.append(
                f"Wrong Region – first scan in {current_region_guess}, batch shipped to {original_region}"
            )

    # Alarm 3: Impossible Physics (geo-velocity)
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
            # bad timestamps should not crash the endpoint
            pass

    # Decide new state
    new_state = state
    if not alarms:
        if role == "merchant":
            if state == "SHIPPED":
                new_state = "IN_STOCK"
            # repeat merchant scans are intentionally ignored
        elif role == "consumer":
            if state in ("SHIPPED", "IN_STOCK"):
                new_state = "PURCHASED_RETIRED"
            else:
                # already retired – already caught above
                pass
        else:
            return {
                "status": "FAKE",
                "reason": f"Unknown role '{role}' – must be merchant or consumer",
                "alarms": ["INVALID_ROLE"],
                "new_state": None,
            }

    # Persist if we are accepting the scan
    scan_event = {
        "role": role,
        "lat": lat,
        "lng": lng,
        "timestamp": timestamp,
        "alarms": alarms,
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
            "new_state": state,  # we do not advance state on fake
        }

    return {
        "status": "AUTHENTIC",
        "reason": f"Scan accepted – state now {new_state}",
        "alarms": [],
        "new_state": new_state,
    }


def _guess_region(lat: float, lng: float) -> str:
    """Very rough mock region guess for demo purposes only."""
    # Nigeria-ish bounding box for the mock
    if 4.0 <= lat <= 14.0 and 2.5 <= lng <= 15.0:
        return "NG"
    return "OTHER"


def seed_demo_data() -> None:
    """Load a few realistic codes and previous scans so the demo is not empty."""
    engine = get_engine()

    # Authentic product that has been through the normal flow
    engine.register_code("UNL-9X4-B2P", region="NG", batch_id="BATCH-001")
    engine.append_scan("UNL-9X4-B2P", {
        "role": "merchant",
        "lat": 6.5244,
        "lng": 3.3792,          # Lagos
        "timestamp": "2026-10-01T09:00:00Z",
        "alarms": [],
    })
    rec = engine.get_code("UNL-9X4-B2P")
    if rec:
        rec["state"] = "IN_STOCK"
        engine.update_code("UNL-9X4-B2P", rec)

    # Code that will trigger Already Purchased
    engine.register_code("UNL-CLONE-01", region="NG", batch_id="BATCH-002")
    engine.append_scan("UNL-CLONE-01", {
        "role": "consumer",
        "lat": 6.5244,
        "lng": 3.3792,
        "timestamp": "2026-10-02T14:00:00Z",
        "alarms": [],
    })
    rec = engine.get_code("UNL-CLONE-01")
    if rec:
        rec["state"] = "PURCHASED_RETIRED"
        engine.update_code("UNL-CLONE-01", rec)

    # Code that will trigger Impossible Physics later
    engine.register_code("UNL-FAST-99", region="NG", batch_id="BATCH-003")
    engine.append_scan("UNL-FAST-99", {
        "role": "merchant",
        "lat": 6.5244,
        "lng": 3.3792,          # Lagos
        "timestamp": "2026-10-08T10:00:00Z",
        "alarms": [],
    })
    rec = engine.get_code("UNL-FAST-99")
    if rec:
        rec["state"] = "IN_STOCK"
        engine.update_code("UNL-FAST-99", rec)
