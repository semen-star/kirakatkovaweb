import sqlite3
import json
from pathlib import Path
from typing import List, Optional, Dict
from datetime import datetime

DB_PATH = Path("data/site.db")


def get_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Таблица для фото
    cursor.execute("""
                   CREATE TABLE IF NOT EXISTS photos
                   (
                       id
                       INTEGER
                       PRIMARY
                       KEY
                       AUTOINCREMENT,
                       filename
                       TEXT
                       NOT
                       NULL,
                       original_name
                       TEXT
                       NOT
                       NULL,
                       type
                       TEXT
                       NOT
                       NULL,
                       title
                       TEXT,
                       description
                       TEXT,
                       `order`
                       INTEGER
                       DEFAULT
                       0,
                       uploaded_at
                       TIMESTAMP
                       DEFAULT
                       CURRENT_TIMESTAMP,
                       active
                       INTEGER
                       DEFAULT
                       1,
                       metadata
                       TEXT,
                       custom_position
                       TEXT,
                       custom_size
                       TEXT
                   )
                   """)

    # Таблица для кастомных блоков
    cursor.execute("""
                   CREATE TABLE IF NOT EXISTS custom_blocks
                   (
                       id
                       INTEGER
                       PRIMARY
                       KEY
                       AUTOINCREMENT,
                       type
                       TEXT
                       NOT
                       NULL,
                       position
                       TEXT
                       NOT
                       NULL,
                       content
                       TEXT,
                       photo_id
                       INTEGER,
                       `order`
                       INTEGER
                       DEFAULT
                       0,
                       active
                       INTEGER
                       DEFAULT
                       1,
                       styles
                       TEXT,
                       FOREIGN
                       KEY
                   (
                       photo_id
                   ) REFERENCES photos
                   (
                       id
                   )
                       )
                   """)

    # Таблица для конфигурации сайта
    cursor.execute("""
                   CREATE TABLE IF NOT EXISTS site_config
                   (
                       key
                       TEXT
                       PRIMARY
                       KEY,
                       value
                       TEXT
                       NOT
                       NULL,
                       updated_at
                       TIMESTAMP
                       DEFAULT
                       CURRENT_TIMESTAMP
                   )
                   """)

    # Добавляем дефолтные настройки
    default_config = {
        'title': 'Кира Каткова — портретный фотограф и фотожурналист | KARKT',
        'description': 'Кира — фотограф, студентка и активистка из Магнитогорска. Портретная и репортажная съёмка: искренние эмоции, живые моменты, готова путешествовать.',
        'hero_heading': 'Портретный фотограф <em>и</em> фотожурналист',
        'hero_sub': 'Привет! Меня зовут Кира. Я ловлю искренние моменты — без постановки и лишнего пафоса — и превращаю их в фотографии, которые хочется пересматривать спустя годы.',
        'about_title': 'Кира — фотограф, студентка и активистка',
        'about_text': 'Живу и работаю в <strong>Магнитогорске</strong>, но с удовольствием еду туда, куда позовёте — города, дворы, вокзалы и квартиры одинаково хорошо становятся декорацией для настоящих историй.\n\nЯ работаю на стыке репортажной и личной фотографии: не заставляю позировать и замирать в неестественных позах. Вместо этого становлюсь незаметным спутником на вашей фотосессии или мероприятии — и ловлю искренние улыбки, трогательные взгляды и живые эмоции.',
        'quote_text': '«Самые ценные фотографии — те, что становятся частью вашей истории»',
        'contact_email': 'kiracatkova@yandex.ru',
        'contact_phone': '+7 982 283-04-01',
        'social_vk': 'https://vk.ru/karkt',
        'social_telegram': 'https://t.me/KA_RKT',
        'social_instagram': 'https://www.instagram.com/photo.karkt',
        'custom_css': '',
        'custom_html_head': '',
        'custom_html_footer': ''
    }

    for key, value in default_config.items():
        cursor.execute("""
                       INSERT
                       OR IGNORE INTO site_config (key, value)
            VALUES (?, ?)
                       """, (key, value))

    conn.commit()
    conn.close()


def to_json(data):
    return json.dumps(data, ensure_ascii=False) if data else None


def from_json(data):
    return json.loads(data) if data else {}


# CRUD для фото
def create_photo(photo_data: Dict) -> int:
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
                   INSERT INTO photos
                   (filename, original_name, type, title, description, `order`, metadata, custom_position, custom_size)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                   """, (
                       photo_data['filename'],
                       photo_data['original_name'],
                       photo_data['type'],
                       photo_data.get('title', ''),
                       photo_data.get('description', ''),
                       photo_data.get('order', 0),
                       to_json(photo_data.get('metadata', {})),
                       photo_data.get('custom_position'),
                       photo_data.get('custom_size')
                   ))

    photo_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return photo_id


def get_photos(photo_type: Optional[str] = None, active_only: bool = True) -> List[Dict]:
    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM photos"
    params = []
    conditions = []

    if active_only:
        conditions.append("active = 1")

    if photo_type:
        conditions.append("type = ?")
        params.append(photo_type)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += " ORDER BY `order` ASC, uploaded_at DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()

    result = []
    for row in rows:
        photo = dict(row)
        photo['metadata'] = from_json(photo.get('metadata'))
        photo['active'] = bool(photo.get('active', 1))
        result.append(photo)

    conn.close()
    return result


def delete_photo(photo_id: int) -> bool:
    conn = get_db()
    cursor = conn.cursor()

    # Сначала получаем информацию о фото
    cursor.execute("SELECT filename FROM photos WHERE id = ?", (photo_id,))
    row = cursor.fetchone()

    if row:
        # Удаляем файл
        file_path = Path("app/static") / row['filename']
        if file_path.exists():
            file_path.unlink()

    cursor.execute("DELETE FROM photos WHERE id = ?", (photo_id,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0


def update_photo(photo_id: int, data: Dict) -> bool:
    conn = get_db()
    cursor = conn.cursor()

    fields = []
    params = []

    for key, value in data.items():
        if key in ['title', 'description', 'order', 'active', 'custom_position', 'custom_size']:
            # Экранируем ключ если это order
            key_safe = f"`{key}`" if key == 'order' else key
            fields.append(f"{key_safe} = ?")
            params.append(value)
        elif key == 'metadata':
            fields.append("metadata = ?")
            params.append(to_json(value))

    if not fields:
        return False

    params.append(photo_id)
    query = f"UPDATE photos SET {', '.join(fields)} WHERE id = ?"
    cursor.execute(query, params)

    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0


# CRUD для кастомных блоков
def create_custom_block(block_data: Dict) -> int:
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
                   INSERT INTO custom_blocks
                       (type, position, content, photo_id, `order`, active, styles)
                   VALUES (?, ?, ?, ?, ?, ?, ?)
                   """, (
                       block_data['type'],
                       block_data['position'],
                       block_data.get('content', ''),
                       block_data.get('photo_id'),
                       block_data.get('order', 0),
                       1 if block_data.get('active', True) else 0,
                       to_json(block_data.get('styles', {}))
                   ))

    block_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return block_id


def get_custom_blocks(position: Optional[str] = None, active_only: bool = True) -> List[Dict]:
    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM custom_blocks"
    params = []
    conditions = []

    if active_only:
        conditions.append("active = 1")

    if position:
        conditions.append("position = ?")
        params.append(position)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += " ORDER BY `order` ASC"

    cursor.execute(query, params)
    rows = cursor.fetchall()

    result = []
    for row in rows:
        block = dict(row)
        block['styles'] = from_json(block.get('styles'))
        block['active'] = bool(block.get('active', 1))
        result.append(block)

    conn.close()
    return result


def delete_custom_block(block_id: int) -> bool:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM custom_blocks WHERE id = ?", (block_id,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0


def update_custom_block(block_id: int, data: Dict) -> bool:
    conn = get_db()
    cursor = conn.cursor()

    fields = []
    params = []

    for key, value in data.items():
        if key in ['type', 'position', 'content', 'photo_id', 'order', 'active']:
            key_safe = f"`{key}`" if key == 'order' else key
            fields.append(f"{key_safe} = ?")
            params.append(value)
        elif key == 'styles':
            fields.append("styles = ?")
            params.append(to_json(value))

    if not fields:
        return False

    params.append(block_id)
    query = f"UPDATE custom_blocks SET {', '.join(fields)} WHERE id = ?"
    cursor.execute(query, params)

    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0


# Работа с конфигом сайта
def get_site_config() -> Dict:
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT key, value FROM site_config")
    rows = cursor.fetchall()
    conn.close()

    config = {}
    for row in rows:
        config[row['key']] = row['value']
    return config


def set_site_config(config: Dict):
    conn = get_db()
    cursor = conn.cursor()

    for key, value in config.items():
        cursor.execute("""
                       INSERT INTO site_config (key, value, updated_at)
                       VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO
                       UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
                       """, (key, value, value))

    conn.commit()
    conn.close()


# Инициализация БД
init_db()