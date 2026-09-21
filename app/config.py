from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    admin_password: str = "KiraWebKatkova"
    secret_key: str = "change-me-in-production"
    upload_dir: Path = Path("app/static/uploads")
    database_url: str = "sqlite:///./data/site.db"

    # SEO. SITE_URL — боевой адрес сайта без слэша на конце, например https://karkt.ru
    site_url: str = ""
    # Коды из Google Search Console / Яндекс Вебмастера (мета-тег подтверждения прав)
    google_verification: str = ""
    yandex_verification: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()