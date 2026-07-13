from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class PhotoType(str, Enum):
    GALLERY = "gallery"
    HERO = "hero"
    ABOUT = "about"
    CUSTOM = "custom"

class Photo(BaseModel):
    id: Optional[int] = None
    filename: str
    original_name: str
    type: PhotoType
    title: Optional[str] = None
    description: Optional[str] = None
    order: int = 0
    uploaded_at: datetime = datetime.now()
    active: bool = True
    metadata: Optional[dict] = {}
    custom_position: Optional[str] = None  # "top", "bottom", "left", "right"
    custom_size: Optional[str] = None      # "small", "medium", "large", "full"

class CustomBlock(BaseModel):
    id: Optional[int] = None
    type: str  # "text", "image", "gallery"
    position: str  # "top", "bottom", "left", "right", "hero", "about"
    content: Optional[str] = None  # Для текста
    photo_id: Optional[int] = None  # Для фото
    order: int = 0
    active: bool = True
    styles: Optional[dict] = {}

class SiteConfig(BaseModel):
    title: str = "Кира Каткова — портретный фотограф и фотожурналист | KARKT"
    description: str = "Кира — фотограф, студентка и активистка из Магнитогорска..."
    hero_heading: str = "Портретный фотограф и фотожурналист"
    hero_sub: str = "Привет! Меня зовут Кира..."
    about_title: str = "Кира — фотограф, студентка и активистка"
    about_text: str = "Живу и работаю в Магнитогорске..."
    quote_text: str = "Самые ценные фотографии — те, что становятся частью вашей истории"
    contact_email: str = "kiracatkova@yandex.ru"
    contact_phone: str = "+7 982 283-04-01"
    social_vk: str = "https://vk.ru/karkt"
    social_telegram: str = "https://t.me/KA_RKT"
    social_instagram: str = "https://www.instagram.com/photo.karkt"
    custom_css: Optional[str] = None
    custom_html_head: Optional[str] = None
    custom_html_footer: Optional[str] = None