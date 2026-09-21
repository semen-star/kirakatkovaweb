"""SEO: robots.txt, sitemap.xml, favicon и данные для <head> главной страницы."""
import json
from datetime import datetime, timezone
from urllib.parse import quote
from xml.sax.saxutils import escape

from fastapi import APIRouter, Request
from fastapi.responses import FileResponse, Response

from .config import settings
from .database import get_db, get_photos, get_site_config

router = APIRouter(include_in_schema=False)

# Значения по умолчанию, если в админке поле оказалось пустым
OWNER_NAME = "Кира Каткова"
BRAND = "KARKT"
CITY = "Магнитогорск"
DEFAULT_TITLE = "Кира Каткова — портретный фотограф и фотожурналист | KARKT"
DEFAULT_DESCRIPTION = (
    "Портретная и репортажная фотосъёмка в Магнитогорске и не только. "
    "Искренние эмоции, живые моменты."
)
DEFAULT_OG_IMAGE = "/static/img/og-cover.jpg"  # 1200x630, лежит в templates/site/img/


def get_site_url(request: Request) -> str:
    """Боевой адрес без слэша. Лучше всегда задавать SITE_URL в .env."""
    if settings.site_url:
        return settings.site_url.strip().rstrip("/")
    proto = request.headers.get("x-forwarded-proto", request.url.scheme).split(",")[0].strip()
    host = request.headers.get("x-forwarded-host", request.headers.get("host", "")).split(",")[0].strip()
    return f"{proto}://{host}"


def _last_modified() -> str:
    """Дата последнего изменения контента (загрузка фото / правка текстов) — для <lastmod>."""
    conn = get_db()
    try:
        row = conn.execute(
            """
            SELECT MAX(ts) FROM (
                SELECT MAX(uploaded_at) AS ts FROM photos
                UNION ALL
                SELECT MAX(updated_at) AS ts FROM site_config
            )
            """
        ).fetchone()
    finally:
        conn.close()
    value = row[0] if row and row[0] else None
    return value[:10] if value else datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _absolute(base: str, url: str) -> str:
    return url if url.startswith(("http://", "https://")) else f"{base}/{url.lstrip('/')}"


def build_json_ld(base: str, config: dict, image: str, description: str) -> str:
    """Структурированные данные schema.org (для сниппетов Google и Яндекса)."""
    same_as = [config[k] for k in ("social_vk", "social_telegram", "social_instagram") if config.get(k)]
    person = {
        "@type": "Person",
        "@id": f"{base}/#person",
        "name": OWNER_NAME,
        "alternateName": BRAND,
        "jobTitle": "Фотограф",
        "description": description,
        "url": f"{base}/",
        "image": image,
        "address": {"@type": "PostalAddress", "addressLocality": CITY, "addressCountry": "RU"},
        "knowsAbout": ["портретная фотография", "репортажная съёмка", "фотожурналистика"],
        "sameAs": same_as,
    }
    if config.get("contact_email"):
        person["email"] = config["contact_email"]
    if config.get("contact_phone"):
        person["telephone"] = config["contact_phone"].replace(" ", "").replace("-", "")
    data = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": f"{base}/#website",
                "url": f"{base}/",
                "name": BRAND,
                "inLanguage": "ru-RU",
                "publisher": {"@id": f"{base}/#person"},
            },
            person,
        ],
    }
    # "</" внутри <script> ломает страницу — экранируем
    return json.dumps(data, ensure_ascii=False).replace("</", "<\\/")


def seo_context(request: Request) -> dict:
    """Всё, что нужно шаблону для <head>."""
    base = get_site_url(request)
    config = get_site_config()
    title = config.get("title") or DEFAULT_TITLE
    description = config.get("description") or DEFAULT_DESCRIPTION
    custom_image = config.get("og_image")  # необязательное поле: можно задать через /admin/config
    og_image = _absolute(base, custom_image or DEFAULT_OG_IMAGE)
    return {
        "site_url": base,
        "canonical": f"{base}/",
        "title": title,
        "description": description,
        "og_image": og_image,
        "og_image_is_default": not custom_image,
        "json_ld": build_json_ld(base, config, og_image, description),
        "google_verification": settings.google_verification,
        "yandex_verification": settings.yandex_verification,
    }


@router.get("/robots.txt")
async def robots(request: Request):
    base = get_site_url(request)
    body = (
        "User-agent: *\n"
        "# Админка не для поиска\n"
        "Disallow: /admin\n"
        "# /api, /static и /uploads НЕ закрываем: сайт подгружает через них контент,\n"
        "# и поисковику они нужны, чтобы правильно отрисовать страницу и увидеть фото.\n"
        "\n"
        f"Sitemap: {base}/sitemap.xml\n"
    )
    return Response(body, media_type="text/plain; charset=utf-8")


@router.get("/sitemap.xml")
async def sitemap(request: Request):
    base = get_site_url(request)
    photos = get_photos("hero") + get_photos("gallery")

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
        ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
        "  <url>",
        f"    <loc>{escape(base)}/</loc>",
        f"    <lastmod>{_last_modified()}</lastmod>",
    ]
    for photo in photos:
        image_url = f"{base}/{quote(photo['filename'])}"
        lines += ["    <image:image>", f"      <image:loc>{escape(image_url)}</image:loc>", "    </image:image>"]
    lines += ["  </url>", "</urlset>", ""]
    return Response("\n".join(lines), media_type="application/xml")


@router.get("/favicon.ico")
async def favicon():
    # Поисковики (особенно Яндекс) сначала стучатся именно в /favicon.ico
    return FileResponse(
        "templates/site/favicon.ico",
        media_type="image/x-icon",
        headers={"Cache-Control": "public, max-age=604800"},
    )
