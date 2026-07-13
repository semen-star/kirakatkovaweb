from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    admin_password: str = "KiraWebKatkova"
    secret_key: str = "change-me-in-production"
    upload_dir: Path = Path("app/static/uploads")
    database_url: str = "sqlite:///./data/site.db"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()