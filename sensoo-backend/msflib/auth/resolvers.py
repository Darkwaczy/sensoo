from dataclasses import dataclass, field
from typing import Any, Dict, Optional


@dataclass
class ResolverContext:
    session: Any = None
    account: Any = None
    path_params: Dict[str, Any] = field(default_factory=dict)
    headers: Dict[str, str] = field(default_factory=dict)


class WorkspaceResolver:
    def resolve(self, context: ResolverContext) -> Optional[str]:
        raise NotImplementedError


class PathParameterResolver(WorkspaceResolver):
    def __init__(self, param_name: str = "workspace_slug"):
        self.param_name = param_name

    def resolve(self, context: ResolverContext) -> Optional[str]:
        return context.path_params.get(self.param_name)


class HttpHeaderResolver(WorkspaceResolver):
    def __init__(self, header_name: str = "x-workspace"):
        self.header_name = header_name.lower()

    def resolve(self, context: ResolverContext) -> Optional[str]:
        return context.headers.get(self.header_name)
