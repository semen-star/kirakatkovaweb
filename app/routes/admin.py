from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import Optional, List
import shutil
from pathlib import Path
from datetime import datetime
# Убираем: from PIL import Image

from ..config import settings
from ..database import (
    create_photo, get_photos, delete_photo, update_photo,
    create_custom_block, get_custom_blocks, delete_custom_block,
    update_custom_block, get_site_config, set_site_config
)
from ..models import Photo, CustomBlock, SiteConfig

router = APIRouter(prefix="/admin", tags=["admin"])


def verify_password(password: str):
    if password != settings.admin_password:
        raise HTTPException(status_code=401, detail="Неверный пароль")


@router.post("/auth")
async def auth(password: str = Form(...)):
    if password == settings.admin_password:
        return {"success": True}
    return {"success": False}


# Фото
@router.post("/photos")
async def upload_photo(
        password: str = Form(...),
        photo: UploadFile = File(...),
        photo_type: str = Form("gallery"),
        title: Optional[str] = Form(None),
        description: Optional[str] = Form(None),
        custom_position: Optional[str] = Form(None),
        custom_size: Optional[str] = Form(None)
):
    verify_password(password)

    # Сохраняем фото - правильный путь
    upload_dir = settings.upload_dir / photo_type
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Очищаем имя файла от спецсимволов
    import re
    clean_filename = re.sub(r'[^\w\-_.]', '_', photo.filename)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{clean_filename}"
    file_path = upload_dir / filename

    # Сохраняем файл
    content = await photo.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # Создаем запись в БД - ПРАВИЛЬНЫЙ ПУТЬ для URL
    photo_data = {
        "filename": f"uploads/{photo_type}/{filename}",  # <- ИЗМЕНЕНО!
        "original_name": photo.filename,
        "type": photo_type,
        "title": title or "",
        "description": description or "",
        "custom_position": custom_position,
        "custom_size": custom_size
    }

    photo_id = create_photo(photo_data)

    return {"success": True, "id": photo_id, "filename": filename}

@router.get("/photos")
async def list_photos(password: str):
    verify_password(password)
    photos = get_photos(active_only=False)
    return photos


@router.delete("/photos/{photo_id}")
async def delete_photo_endpoint(photo_id: int, password: str):
    verify_password(password)

    # Удаляем файл
    photos = get_photos(active_only=False)
    photo = next((p for p in photos if p['id'] == photo_id), None)

    if photo:
        file_path = settings.upload_dir.parent / photo['filename']
        if file_path.exists():
            file_path.unlink()

    # Удаляем из БД
    success = delete_photo(photo_id)
    if not success:
        raise HTTPException(status_code=404, detail="Фото не найдено")

    return {"success": True}


@router.put("/photos/{photo_id}")
async def update_photo_endpoint(photo_id: int, password: str, data: dict):
    verify_password(password)
    success = update_photo(photo_id, data)
    if not success:
        raise HTTPException(status_code=404, detail="Фото не найдено")
    return {"success": True}


# Кастомные блоки
@router.post("/blocks")
async def create_block(
        password: str = Form(...),
        block_type: str = Form(...),
        position: str = Form(...),
        content: Optional[str] = Form(None),
        photo_id: Optional[int] = Form(None)
):
    verify_password(password)

    block_data = {
        "type": block_type,
        "position": position,
        "content": content or "",
        "photo_id": photo_id
    }

    block_id = create_custom_block(block_data)
    return {"success": True, "id": block_id}


@router.get("/blocks")
async def list_blocks(password: str, position: Optional[str] = None):
    verify_password(password)
    blocks = get_custom_blocks(position, active_only=False)
    return blocks


@router.delete("/blocks/{block_id}")
async def delete_block(block_id: int, password: str):
    verify_password(password)
    success = delete_custom_block(block_id)
    if not success:
        raise HTTPException(status_code=404, detail="Блок не найден")
    return {"success": True}


@router.put("/blocks/{block_id}")
async def update_block(block_id: int, password: str, data: dict):
    verify_password(password)
    success = update_custom_block(block_id, data)
    if not success:
        raise HTTPException(status_code=404, detail="Блок не найден")
    return {"success": True}


# Конфиг
@router.get("/config")
async def get_config(password: str):
    verify_password(password)
    return get_site_config()


@router.post("/config")
async def update_config(password: str, data: dict):
    verify_password(password)
    set_site_config(data)
    return {"success": True}