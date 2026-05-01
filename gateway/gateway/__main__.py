"""
Python reverse proxy server replicating the nginx gateway config.
Logs request URL and forward URL for every proxied request.

Requirements:
    pip install aiohttp python-dotenv

Environment variables (or .env file):
    PROXY_PROTOCOL       http or https   (default: http)
    USER_SERVICE_URL     e.g. user-service.internal
    BOOK_SERVICE_URL     e.g. book-service.internal
    NOTIFICATION_SERVICE_URL
    LENDING_SERVICE_URL
    PORT                 listen port     (default: 80)
"""

import asyncio
import json
import logging
import os
import sys
from typing import Optional

import aiohttp
from aiohttp import web

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("proxy")

# ---------------------------------------------------------------------------
# Config (read from environment / .env)
# ---------------------------------------------------------------------------
try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass  # python-dotenv is optional

PROTOCOL = os.getenv("PROXY_PROTOCOL", "http")
USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "")
BOOK_SERVICE_URL = os.getenv("BOOK_SERVICE_URL", "")
NOTIFICATION_SERVICE_URL = os.getenv("NOTIFICATION_SERVICE_URL", "")
LENDING_SERVICE_URL = os.getenv("LENDING_SERVICE_URL", "")
PORT = int(os.getenv("PORT", "8080"))

# Validate required env vars
_required = {
    "USER_SERVICE_URL": USER_SERVICE_URL,
    "BOOK_SERVICE_URL": BOOK_SERVICE_URL,
    "NOTIFICATION_SERVICE_URL": NOTIFICATION_SERVICE_URL,
    "LENDING_SERVICE_URL": LENDING_SERVICE_URL,
}
_missing = [k for k, v in _required.items() if not v]
if _missing:
    sys.exit(f"Missing required environment variables: {', '.join(_missing)}")


def base_url(host: str) -> str:
    return f"{PROTOCOL}://{host}:80"


# ---------------------------------------------------------------------------
# JSON error helpers  (mirror nginx @unauthorized / @forbidden named locations)
# ---------------------------------------------------------------------------
def _json_error(status: int, error: str, message: str) -> web.Response:
    return web.Response(
        status=status,
        content_type="application/json",
        text=json.dumps({"error": error, "message": message}),
    )


def unauthorized() -> web.Response:
    return _json_error(401, "Unauthorized", "A valid Bearer token is required.")


def forbidden() -> web.Response:
    return _json_error(
        403, "Forbidden", "You do not have permission to access this resource."
    )


# ---------------------------------------------------------------------------
# Token validation  (mirrors /_internal/validate_token)
# ---------------------------------------------------------------------------
async def validate_token(
    session: aiohttp.ClientSession, request: web.Request
) -> Optional[web.Response]:
    """
    Forward only the Authorization header to the auth-validate endpoint.
    Returns None on success (2xx), or a Response on 401/403.
    """
    validate_url = f"{base_url(USER_SERVICE_URL)}/api/auth/validate"

    log.info(
        "AUTH CHECK  request=%-50s  forward=%s",
        request.rel_url,
        validate_url,
    )

    headers = {
        "X-Original-URI": str(request.rel_url),
        "X-Original-Method": request.method,
        "Content-Length": "",
    }
    if "Authorization" in request.headers:
        headers["Authorization"] = request.headers["Authorization"]

    try:
        async with session.get(
            validate_url, headers=headers, allow_redirects=False
        ) as resp:
            if resp.status == 401:
                return unauthorized()
            if resp.status == 403:
                return forbidden()
            if resp.status >= 400:
                return unauthorized()  # treat unexpected errors as 401
            return None  # success
    except aiohttp.ClientError as exc:
        log.error("Token validation request failed: %s", exc)
        return unauthorized()


# ---------------------------------------------------------------------------
# Generic proxy helper
# ---------------------------------------------------------------------------
async def proxy_request(
    session: aiohttp.ClientSession,
    request: web.Request,
    target_base: str,
    strip_prefix: str = "",
) -> web.Response:
    """
    Forward *request* to *target_base*, optionally stripping a URL prefix.
    Streams the response body back to the client.
    """
    path = str(request.rel_url)
    if strip_prefix and path.startswith(strip_prefix):
        path = path[len(strip_prefix) :]
        if not path.startswith("/"):
            path = "/" + path

    forward_url = target_base.rstrip("/") + path
    log.info(
        "PROXY       request=%-50s  forward=%s",
        request.rel_url,
        forward_url,
    )

    # Build forwarded headers
    fwd_headers = dict(request.headers)
    fwd_headers.pop("Host", None)  # will be set by aiohttp
    fwd_headers["X-Forwarded-For"] = (
        request.headers.get("X-Forwarded-For", "") + ", " + request.remote
    ).lstrip(", ")

    body = await request.read()

    try:
        async with session.request(
            method=request.method,
            url=forward_url,
            headers=fwd_headers,
            data=body if body else None,
            allow_redirects=False,
        ) as upstream:
            upstream_body = await upstream.read()
            # Forward upstream headers back to client (skip hop-by-hop)
            skip = {
                "transfer-encoding",
                "connection",
                "keep-alive",
                "te",
                "trailers",
                "upgrade",
                "proxy-authenticate",
                "proxy-authorization",
            }
            resp_headers = {
                k: v for k, v in upstream.headers.items() if k.lower() not in skip
            }
            return web.Response(
                status=upstream.status,
                headers=resp_headers,
                body=upstream_body,
            )
    except aiohttp.ClientError as exc:
        log.error("Upstream request failed: %s  url=%s", exc, forward_url)
        return web.Response(status=502, text="Bad Gateway")


# ---------------------------------------------------------------------------
# Route handlers
# ---------------------------------------------------------------------------


async def handle_auth(request: web.Request) -> web.Response:
    """
    /api/auth/  →  USER_SERVICE_URL/api/auth/   (no token check)
    """
    session: aiohttp.ClientSession = request.app["session"]
    return await proxy_request(session, request, base_url(USER_SERVICE_URL))


async def handle_protected(request: web.Request) -> web.Response:
    """
    Protected routes: validate token first, then proxy to the correct backend.
    """
    session: aiohttp.ClientSession = request.app["session"]

    # 1. Token validation
    auth_error = await validate_token(session, request)
    if auth_error:
        return auth_error

    # 2. Route to the right service
    path: str = request.path

    if path.startswith("/api/users/"):
        return await proxy_request(session, request, base_url(USER_SERVICE_URL))

    if path.startswith("/api/books/"):
        return await proxy_request(session, request, base_url(BOOK_SERVICE_URL))

    if path.startswith("/api/notification/"):
        return await proxy_request(session, request, base_url(NOTIFICATION_SERVICE_URL))

    if path.startswith("/api/lending/"):
        return await proxy_request(session, request, base_url(LENDING_SERVICE_URL))

    return web.Response(status=404, text="Not Found")


# ---------------------------------------------------------------------------
# App lifecycle
# ---------------------------------------------------------------------------


async def on_startup(app: web.Application) -> None:
    connector = aiohttp.TCPConnector(ssl=False)  # set ssl=True for https upstreams
    app["session"] = aiohttp.ClientSession(connector=connector)
    log.info("Proxy gateway started on port %d", PORT)
    log.info("  USER_SERVICE         → %s", base_url(USER_SERVICE_URL))
    log.info("  BOOK_SERVICE         → %s", base_url(BOOK_SERVICE_URL))
    log.info("  NOTIFICATION_SERVICE → %s", base_url(NOTIFICATION_SERVICE_URL))
    log.info("  LENDING_SERVICE      → %s", base_url(LENDING_SERVICE_URL))


async def on_cleanup(app: web.Application) -> None:
    await app["session"].close()


def build_app() -> web.Application:
    app = web.Application()
    app.on_startup.append(on_startup)
    app.on_cleanup.append(on_cleanup)

    # Public: /api/auth/ — no auth required
    app.router.add_route("*", "/api/auth/{tail:.*}", handle_auth)

    # Protected routes
    for prefix in (
        "/api/users/{tail:.*}",
        "/api/books/{tail:.*}",
        "/api/notification/{tail:.*}",
        "/api/lending/{tail:.*}",
    ):
        app.router.add_route("*", prefix, handle_protected)

    return app


if __name__ == "__main__":
    web.run_app(build_app(), port=PORT)
