"""
Mock MSFlib / EngineCore.
Replace the bodies of these classes on Oct 8 when real docs drop.
Do not change the public method signatures that sensoo_core and main.py call.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional


class Engine:
    """Dummy Engine that pretends to be the real MSFlib EngineCore."""

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Create a mock engine instance with optional config dict."""
        self.config = config or {}
        self._storage: Dict[str, Any] = {}  # in-memory stand-in for real storage

    def register_code(self, code: str, region: str, batch_id: str) -> bool:
        """Register a new product code with its shipping region and batch."""
        self._storage[code] = {
            "state": "SHIPPED",
            "region": region,
            "batch_id": batch_id,
            "scans": [],
        }
        return True

    def get_code(self, code: str) -> Optional[Dict[str, Any]]:
        """Return the stored record for a code, or None if it does not exist."""
        return self._storage.get(code)

    def update_code(self, code: str, data: Dict[str, Any]) -> bool:
        """Overwrite the stored record for a code with the given data dict."""
        if code not in self._storage:
            return False
        self._storage[code] = data
        return True

    def append_scan(self, code: str, scan: Dict[str, Any]) -> bool:
        """Append one scan event to the code's history."""
        record = self._storage.get(code)
        if not record:
            return False
        record.setdefault("scans", []).append(scan)
        return True

    def list_recent_scans(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Return the most recent scans across all codes, newest first."""
        all_scans: List[Dict[str, Any]] = []
        for code, record in self._storage.items():
            for s in record.get("scans", []):
                entry = dict(s)
                entry["code"] = code
                all_scans.append(entry)
        # sort by timestamp descending
        all_scans.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return all_scans[:limit]


# Convenience factory so the rest of the code can do: from msflib import get_engine
_engine: Optional[Engine] = None


def get_engine(config: Optional[Dict[str, Any]] = None) -> Engine:
    """Return a singleton mock Engine instance."""
    global _engine
    if _engine is None:
        _engine = Engine(config)
    return _engine
