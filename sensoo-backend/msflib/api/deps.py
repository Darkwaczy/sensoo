from typing import Callable, Generator
from sqlmodel import Session
from msflib.core.store import MapStore

_global_map_store = MapStore()


def get_keystore_factory() -> Callable[[], MapStore]:
    """Returns factory yielding MSFLib keystore."""
    def get_keystore() -> MapStore:
        return _global_map_store
    return get_keystore


def get_session_factory(engine) -> Callable[[], Generator[Session, None, None]]:
    """Returns FastAPI dependency yielding a SQLModel session."""
    def get_session() -> Generator[Session, None, None]:
        with Session(engine) as session:
            yield session
    return get_session
