from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlmodel import Session, select
from msflib.eventbus import bind_app_emitter

from app.db import engine, init_db
from app.models import ProductCode
from app.router import router


def seed_demo_products() -> None:
    # No hardcoded demo products. All products are verified dynamically via external registries or registered by authorized admins.
    pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Sensoo Backend",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for Mobile, Web, and Expo clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Bind MSFLib event emitter to app instance
bind_app_emitter(app)

app.include_router(router)


@app.get("/")
def root():
    return {"message": "Sensoo Backend API is running"}
