from fastapi import APIRouter
from ..database import get_photos, get_custom_blocks, get_site_config

router = APIRouter(prefix="/api", tags=["api"])

@router.get("/photos")
async def public_photos(photo_type: str = "gallery"):
    """Публичный эндпоинт для получения фото"""
    return get_photos(photo_type)

@router.get("/blocks")
async def public_blocks(position: str = None):
    """Публичный эндпоинт для получения кастомных блоков"""
    return get_custom_blocks(position)

@router.get("/config")
async def public_config():
    """Публичный эндпоинт для получения конфига сайта"""
    return get_site_config()