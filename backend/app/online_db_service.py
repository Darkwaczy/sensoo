"""
Online Product & EMDEX Database Integration Service for Sensoo.
Connects real-time scan verification to:
1. EMDEX Nigeria Drug Database API (https://sandbox.emdexapi.com)
2. Open Food & Consumer Product Barcode Registry API (https://world.openfoodfacts.org)
"""

import logging
from typing import Any, Dict, Optional
import httpx

logger = logging.getLogger("sensoo.online_db")

EMDEX_BASE_URL = "https://sandbox.emdexapi.com/api/v1"
EMDEX_DEFAULT_EMAIL = "rupak@emdex.org"
EMDEX_DEFAULT_PASS = "1234"

_emdex_token_cache: Optional[str] = None


async def get_emdex_token() -> Optional[str]:
    """Authenticates with EMDEX API and returns Bearer Token."""
    global _emdex_token_cache
    if _emdex_token_cache:
        return _emdex_token_cache

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(
                f"{EMDEX_BASE_URL}/login",
                data={"email": EMDEX_DEFAULT_EMAIL, "password": EMDEX_DEFAULT_PASS},
            )
            if resp.status_code == 200:
                data = resp.json()
                token = data.get("access_token") or data.get("token") or data.get("EMDEXTOKEN")
                if token:
                    _emdex_token_cache = token
                    return token
    except Exception as e:
        logger.warning(f"EMDEX Login failed: {e}")
    return None


async def search_emdex_drug(keyword: str) -> Optional[Dict[str, Any]]:
    """Queries EMDEX API for Nigerian registered drug brand or generic name."""
    token = await get_emdex_token()
    headers = {"Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            # 1. Search Brand
            resp = await client.post(
                f"{EMDEX_BASE_URL}/brand/search",
                data={"keyword": keyword},
                headers=headers,
            )
            if resp.status_code == 200:
                res_data = resp.json()
                hits = res_data if isinstance(res_data, list) else res_data.get("data", [])
                if hits and len(hits) > 0:
                    item = hits[0]
                    return {
                        "product_name": item.get("brand_name") or item.get("name") or keyword,
                        "manufacturer": item.get("company_name") or item.get("manufacturer") or "Registered Manufacturer",
                        "batch_id": f"EMDEX-{item.get('id', 'REG')}",
                        "source": "EMDEX Nigeria Pharmaceutical Database",
                        "category": "Pharmaceutical / Medicine",
                    }
    except Exception as e:
        logger.warning(f"EMDEX drug search error for '{keyword}': {e}")
    return None


async def lookup_online_barcode(code: str) -> Optional[Dict[str, Any]]:
    """
    Performs real-time online lookup across global and Nigerian barcode databases (Open Food Facts API).
    """
    code_clean = code.strip()
    if not code_clean.isdigit() or len(code_clean) < 8:
        return None

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            url = f"https://world.openfoodfacts.org/api/v2/product/{code_clean}.json"
            resp = await client.get(url, headers={"User-Agent": "SensooApp/1.0 (Hackathon Decennium Sprint)"})
            if resp.status_code == 200:
                data = resp.json()
                if data.get("status") == 1 and "product" in data:
                    p = data["product"]
                    prod_name = p.get("product_name") or p.get("product_name_en") or "Verified Product"
                    brand = p.get("brands") or p.get("manufacturer") or "Verified Brand"
                    return {
                        "product_name": prod_name,
                        "manufacturer": brand,
                        "batch_id": f"GTIN-{code_clean[-4:]}",
                        "source": "Global Barcode Registry Database",
                        "category": p.get("categories") or "Consumer Product",
                    }
    except Exception as e:
        logger.warning(f"Online Barcode API lookup error for '{code_clean}': {e}")
    return None


async def fetch_online_product_data(code: str) -> Optional[Dict[str, Any]]:
    """
    Unified online lookup runner:
    1. Checks Open Food Facts / Barcode Registry for barcode GTINs.
    2. Checks EMDEX Drug API for product titles or medical codes.
    """
    # Try Barcode lookup first
    barcode_hit = await lookup_online_barcode(code)
    if barcode_hit:
        return barcode_hit

    # Try EMDEX Search
    emdex_hit = await search_emdex_drug(code)
    if emdex_hit:
        return emdex_hit

    return None
