"""Aggregates every v1 endpoint router under a single APIRouter."""
from fastapi import APIRouter

from app.api.v1.endpoints import (
    admin,
    auth,
    bookings,
    calendar,
    catalog,
    finance,
    leads,
    pricing,
    properties,
    users,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(catalog.router)
api_router.include_router(properties.router)
api_router.include_router(pricing.router)
api_router.include_router(calendar.router)
api_router.include_router(bookings.router)
api_router.include_router(finance.router)
api_router.include_router(leads.router)
api_router.include_router(admin.router)
