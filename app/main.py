from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from starlette.requests import Request
from pathlib import Path
import os

from .config import settings
from .routes import admin, api

app = FastAPI()

# Монтируем статику сайта
app.mount("/static", StaticFiles(directory="templates/site"), name="site_static")

# Монтируем статику админки
app.mount("/admin/static", StaticFiles(directory="app/static"), name="admin_static")

# Монтируем папку uploads - ВАЖНО: правильный путь
uploads_path = Path("app/static/uploads")
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

# Регистрируем роутеры
app.include_router(admin.router)
app.include_router(api.router)

# Шаблоны
templates = Jinja2Templates(directory="templates")

@app.get("/admin")
async def admin_page():
    return templates.TemplateResponse("admin/index.html", {"request": {}})

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("site/index.html", {"request": request})