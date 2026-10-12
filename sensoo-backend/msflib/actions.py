from typing import Any, Generic, List, Optional, TypeVar
from sqlmodel import Session, select

ModelType = TypeVar("ModelType")
CreateSchemaType = TypeVar("CreateSchemaType")
UpdateSchemaType = TypeVar("UpdateSchemaType")


class ModelAction(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Optional[Any] = None):
        self.model = model

    def get_by_all(self, session: Session, **kwargs: Any) -> Optional[Any]:
        if not kwargs:
            return None
        target_model = self.model
        if target_model is None and hasattr(self, "__orig_bases__") and len(self.__orig_bases__) > 0:
            target_model = self.__orig_bases__[0].__args__[0]
        if target_model is None:
            return None
        stmt = select(target_model)
        for k, v in kwargs.items():
            if hasattr(target_model, k):
                stmt = stmt.where(getattr(target_model, k) == v)
        return session.exec(stmt).first()

    def create(self, session: Session, *, data: Any) -> Any:
        target_model = self.model
        if target_model is None and hasattr(self, "__orig_bases__") and len(self.__orig_bases__) > 0:
            target_model = self.__orig_bases__[0].__args__[0]
        if target_model is None:
            return data
        obj_data = data.model_dump() if hasattr(data, "model_dump") else data.dict()
        db_obj = target_model(**obj_data)
        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj
