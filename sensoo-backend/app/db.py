from collections.abc import Generator
from sqlmodel import Session, SQLModel, create_engine, select
from app.settings import settings

connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
)


def init_db() -> None:
    SQLModel.metadata.create_all(engine)
    # Automatically seed the 4 hackathon demo products if not already present
    from app.models import ProductCode
    demo_products = [
        {"code": "UNL-FAST-99", "product_name": "Dettol Antiseptic Liquid 500ml", "manufacturer": "Reckitt Benckiser Nigeria", "batch_id": "RB-NG-9921", "region": "GLOBAL", "state": "IN_STOCK"},
        {"code": "UNL-9X4-B2P", "product_name": "Paracetamol 500mg Caplets", "manufacturer": "Emzor Pharmaceuticals", "batch_id": "EMZ-2026-B2", "region": "GLOBAL", "state": "PURCHASED_RETIRED"},
        {"code": "SNS-SPEED-9999", "product_name": "Lonart DS Artemether/Lumefantrine", "manufacturer": "Greenlife Pharmaceuticals", "batch_id": "GLP-LON-99", "region": "GLOBAL", "state": "IN_STOCK"},
        {"code": "SNS-BABY-1099", "product_name": "Mypacin Baby Teething Mixture", "manufacturer": "Boche Pharmaceuticals", "batch_id": "BOC-KANO-10", "region": "KANO", "state": "IN_STOCK"},
    ]
    with Session(engine) as session:
        for p in demo_products:
            exists = session.exec(select(ProductCode).where(ProductCode.code == p["code"])).first()
            if not exists:
                session.add(ProductCode(**p))
        session.commit()


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
