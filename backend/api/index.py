"""
Vercel serverless entrypoint for the FastAPI backend.

Vercel's Python runtime serves the module-level ASGI ``app`` exported here.
``vercel.json`` rewrites every incoming path to this function, and FastAPI
handles the actual routing (e.g. /api/overview, /api/realtime, /docs).

Local development still uses ``uvicorn app.main:app`` -- this file is only the
adapter for Vercel.
"""

import os
import sys

# Make the backend root (the parent of this `api/` folder) importable so that
# `app.main` resolves when Vercel runs the function from the project root.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app  # noqa: E402

# Vercel's Python runtime looks for a module-level `app` (ASGI/WSGI).
__all__ = ["app"]
