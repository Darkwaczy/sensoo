from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Sensoo Backend"
    DATABASE_URL: str = "sqlite:///./sensoo.db"
    SECRET_KEY: str = "sensoo-msflib-production-secret-auth-key-2026"
    AUTH_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
