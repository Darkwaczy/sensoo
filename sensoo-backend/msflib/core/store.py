from typing import Any, Optional


class StoreInterface:
    def get(self, key: str) -> Optional[Any]:
        raise NotImplementedError

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        raise NotImplementedError

    def delete(self, key: str) -> None:
        raise NotImplementedError

    def has(self, key: str) -> bool:
        raise NotImplementedError


class MapStore(StoreInterface):
    """In-memory keystore for MSFLib token revocation, rate-limiting, and short-term OTP storage."""
    def __init__(self):
        self._store = {}

    def get(self, key: str) -> Optional[Any]:
        return self._store.get(key)

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        self._store[key] = value

    def delete(self, key: str) -> None:
        self._store.pop(key, None)

    def has(self, key: str) -> bool:
        return key in self._store
