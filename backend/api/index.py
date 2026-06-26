"""Vercel serverless entry point — serves the FastAPI ASGI app.

Vercel's @vercel/python runtime detects the module-level ``app`` (an ASGI app)
and serves it; vercel.json rewrites every path to this function.
"""
import os
import sys

# The `app` package lives at the backend root (one level up from /api).
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app  # noqa: E402,F401
