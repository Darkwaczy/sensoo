import inspect
from typing import Any, Callable, Dict, List


class AppEmitter:
    def __init__(self):
        self._listeners: Dict[str, List[Callable[..., Any]]] = {}

    def on(self, event_name: str) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
        def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
            if event_name not in self._listeners:
                self._listeners[event_name] = []
            self._listeners[event_name].append(func)
            return func
        return decorator

    async def emit(self, event_name: str, payload: Any = None, options: Dict[str, Any] = None) -> None:
        listeners = self._listeners.get(event_name, [])
        options = options or {}
        for func in listeners:
            res = func(payload, options) if len(inspect.signature(func).parameters) >= 2 else func(payload)
            if inspect.isawaitable(res):
                await res


def bind_app_emitter(app: Any) -> AppEmitter:
    """Binds KodeHauz MSFlib event bus emitter to FastAPI app."""
    emitter = getattr(app.state, "msflib_emitter", None) if hasattr(app, "state") else None
    if emitter is None:
        emitter = AppEmitter()
        if hasattr(app, "state"):
            app.state.msflib_emitter = emitter
        setattr(app, "msflib_emitter", emitter)
    return emitter
