from fastapi import APIRouter

from app.api.v1.admin_journals import router as admin_journals_router
from app.api.v1.admin_notices import router as admin_notices_router
from app.api.v1.admin_site_settings import router as admin_site_settings_router
from app.api.v1.admin_products import router as admin_products_router
from app.api.v1.auth import router as auth_router
from app.api.v1.categories import router as categories_router
from app.api.v1.journals import router as journals_router
from app.api.v1.notices import router as notices_router
from app.api.v1.products import router as products_router
from app.api.v1.uploads import router as uploads_router
from app.api.v1.site_settings import router as site_settings_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(products_router)
api_router.include_router(categories_router)
api_router.include_router(journals_router)
api_router.include_router(notices_router)
api_router.include_router(site_settings_router)
api_router.include_router(admin_products_router)
api_router.include_router(admin_site_settings_router)
api_router.include_router(admin_journals_router)
api_router.include_router(admin_notices_router)
api_router.include_router(uploads_router)
