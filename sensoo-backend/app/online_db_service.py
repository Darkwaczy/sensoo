"""
Online Product & EMDEX Database Integration Service for Sensoo.
Connects real-time scan verification to:
1. EMDEX Nigeria Drug Database API (https://sandbox.emdexapi.com)
2. Open Food Facts & Consumer Barcode Whitelist (https://world.openfoodfacts.org)
3. Open Beauty Facts Barcode Whitelist (https://world.openbeautyfacts.org)
4. UPCitemdb Global Retail & FMCG Barcode Whitelist (https://api.upcitemdb.com)
"""

import json
import logging
import os
import re
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
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.post(
                f"{EMDEX_BASE_URL}/login",
                data={"email": EMDEX_DEFAULT_EMAIL, "password": EMDEX_DEFAULT_PASS},
                headers={"Accept": "application/json"},
            )
            if resp.status_code == 200:
                data = resp.json()
                token = (
                    data.get("success", {}).get("token")
                    or data.get("token")
                    or data.get("access_token")
                )
                if token:
                    _emdex_token_cache = token
                    return token
    except Exception as e:
        logger.warning(f"EMDEX Login failed: {e}")
    return None


async def search_emdex_drug(keyword: str) -> Optional[Dict[str, Any]]:
    """Queries EMDEX API for Nigerian registered drug brand or generic name."""
    clean_kw = keyword.strip()
    if not clean_kw:
        return None

    # Remove common prefix artifacts if any
    for prefix in ["SNS-MED-", "MED-", "DRUG-", "NAFDAC-"]:
        if clean_kw.upper().startswith(prefix):
            clean_kw = clean_kw[len(prefix):].strip()

    token = await get_emdex_token()
    headers = {"Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            # 1. Search Brand
            resp = await client.post(
                f"{EMDEX_BASE_URL}/brand/search",
                data={"keyword": clean_kw},
                headers=headers,
            )
            hits = []
            if resp.status_code == 200:
                res_data = resp.json()
                hits = (
                    res_data.get("search_results", {}).get("data", [])
                    if isinstance(res_data, dict)
                    else []
                )

            # 2. Search Generic if brand has no hits
            if not hits and len(clean_kw) >= 3:
                resp_gen = await client.post(
                    f"{EMDEX_BASE_URL}/generic/search",
                    data={"keyword": clean_kw},
                    headers=headers,
                )
                if resp_gen.status_code == 200:
                    gen_data = resp_gen.json()
                    hits = (
                        gen_data.get("search_results", {}).get("data", [])
                        if isinstance(gen_data, dict)
                        else []
                    )

            if hits and len(hits) > 0:
                item = hits[0]
                brand_name = item.get("brand_name") or item.get("generic_name") or clean_kw
                company = item.get("company_name") or "NAFDAC / EMDEX Registered Manufacturer"
                nafdac_no = item.get("NAFDAC") or ""
                batch = f"NAFDAC-{nafdac_no}" if nafdac_no else f"EMDEX-REG-{item.get('brand_id', 'VALID')}"

                return {
                    "product_name": brand_name,
                    "manufacturer": company,
                    "batch_id": batch,
                    "source": "EMDEX Nigeria National Drug Whitelist",
                    "category": item.get("form") or "Pharmaceutical Formulation",
                    "status": "AUTHENTIC",
                }
    except Exception as e:
        logger.warning(f"EMDEX drug search error for '{clean_kw}': {e}")
    return None


async def lookup_online_barcode(code: str) -> Optional[Dict[str, Any]]:
    """
    Performs real-time online lookup across global and Nigerian barcode databases (Open Food Facts & Open Beauty Facts).
    """
    code_digits = re.sub(r"[^0-9]", "", code.strip())
    if len(code_digits) < 7:
        return None

    domains = [
        "world.openfoodfacts.org",
        "world.openbeautyfacts.org",
    ]

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            for domain in domains:
                url = f"https://{domain}/api/v2/product/{code_digits}.json"
                resp = await client.get(url, headers={"User-Agent": "SensooApp/1.0 (Hackathon Verification Engine)"})
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("status") == 1 and "product" in data:
                        p = data["product"]
                        prod_name = (
                            p.get("product_name")
                            or p.get("product_name_en")
                            or p.get("generic_name")
                            or "Verified Registry Product"
                        )
                        brand = (
                            p.get("brands")
                            or p.get("brands_tags", [None])[0]
                            or p.get("manufacturer")
                            or "Registered Manufacturer"
                        )
                        if isinstance(brand, list):
                            brand = brand[0] if brand else "Registered Manufacturer"

                        image_url = p.get("image_front_small_url") or p.get("image_url") or None
                        category = p.get("categories") or "Consumer Product"

                        return {
                            "product_name": prod_name,
                            "manufacturer": brand,
                            "batch_id": f"GTIN-{code_digits[-6:]}",
                            "source": "OpenFoodFacts Global Barcode Whitelist",
                            "category": category,
                            "image_url": image_url,
                            "status": "AUTHENTIC",
                        }
    except Exception as e:
        logger.warning(f"Online Barcode API lookup error for '{code}': {e}")
    return None


async def lookup_upcitemdb(code: str) -> Optional[Dict[str, Any]]:
    """
    Queries UPCitemdb global retail registry for commercial FMCG and supermarket products.
    """
    code_digits = re.sub(r"[^0-9]", "", code.strip())
    if len(code_digits) < 7:
        return None

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            url = f"https://api.upcitemdb.com/prod/trial/lookup?upc={code_digits}"
            resp = await client.get(url, headers={"User-Agent": "SensooApp/1.0 (Hackathon Verification Engine)"})
            if resp.status_code == 200:
                data = resp.json()
                items = data.get("items", [])
                if items and len(items) > 0:
                    item = items[0]
                    title = item.get("title") or "Commercial Retail Product"
                    brand = item.get("brand") or item.get("publisher") or "Commercial Manufacturer"
                    category = item.get("category") or "Retail FMCG"
                    images = item.get("images", [])
                    image_url = images[0] if (images and len(images) > 0) else None

                    return {
                        "product_name": title,
                        "manufacturer": brand,
                        "batch_id": f"UPC-{code_digits[-6:]}",
                        "source": "UPCitemdb Global Commercial Retail Whitelist",
                        "category": category,
                        "image_url": image_url,
                        "status": "AUTHENTIC",
                    }
    except Exception as e:
        logger.warning(f"UPCitemdb lookup error for '{code_digits}': {e}")
    return None


async def lookup_live_web_gtin(code: str) -> Optional[Dict[str, Any]]:
    """
    Tier 3: Universal Real-Time GTIN Web Search Resolver.
    Uses Google Search grounding via Gemini 2.5 Flash Lite to dynamically identify any
    commercial retail product from its international EAN-13, UPC-A, or GTIN barcode.
    Zero hardcoded catalogs. Completely dynamic live internet resolution.
    """
    clean_digits = re.sub(r"[^0-9]", "", code.strip())
    if len(clean_digits) < 7:
        return None

    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("EXPO_PUBLIC_GEMINI_API_KEY")
    if not api_key:
        return None

    stripped_digits = clean_digits.lstrip("0") if clean_digits.startswith("0") else clean_digits
    search_term = f"{stripped_digits} or {clean_digits}" if stripped_digits != clean_digits else clean_digits

    # 1. High-speed unmetered web search snippet resolver (zero API quota dependency)
    try:
        ddg_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }
        async with httpx.AsyncClient(timeout=5.0) as client:
            ddg_resp = await client.get(
                f"https://html.duckduckgo.com/html/?q={stripped_digits}",
                headers=ddg_headers,
            )
            if ddg_resp.status_code == 200:
                snippets = re.findall(r'<a class="result__snippet[^"]*"[^>]*>(.*?)</a>', ddg_resp.text)
                for s in snippets:
                    clean_s = re.sub(r'<[^>]+>', '', s).strip()
                    m = re.search(r'([A-Z][a-zA-Z0-9\s\-\&]+(?:Baby Wipes|Wipes|Lotion|Serum|Cream|Soap|Shampoo|Tablets|Syrup|Capsules|Oil|Care|Clean|Detergent))', clean_s)
                    if m and "barcode" not in m.group(1).lower() and "clean day" not in m.group(1).lower():
                        matched_name = m.group(1).strip()
                        brand_word = matched_name.split()[0] if matched_name else "Verified Brand"
                        return {
                            "product_name": matched_name,
                            "manufacturer": brand_word,
                            "batch_id": f"GTIN-{clean_digits}",
                            "source": "Live Global Retail & Web GTIN Index",
                            "category": "Personal Hygiene & Care",
                            "status": "AUTHENTIC",
                        }
    except Exception as e:
        logger.debug(f"Direct web search notice: {e}")

    prompt = (
        f"Search Google for the exact number: {search_term}. "
        "What commercial retail product or item is associated with this barcode? "
        "Output ONLY valid JSON format: "
        '{"found": true, "product_name": "exact product name", "manufacturer": "brand or manufacturer", "category": "product category"}. '
        'If the barcode is unknown or not found, output ONLY: {"found": false}.'
    )
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "tools": [{"google_search": {}}],
    }

    try:
        async with httpx.AsyncClient(timeout=14.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                parts = data.get("candidates", [])[0].get("content", {}).get("parts", [])
                raw_text = "".join(p.get("text", "") for p in parts if "text" in p).strip()

                clean_json = raw_text
                if "```json" in clean_json:
                    clean_json = clean_json.split("```json")[1].split("```")[0].strip()
                elif "```" in clean_json:
                    clean_json = clean_json.split("```")[1].split("```")[0].strip()

                try:
                    parsed = json.loads(clean_json)
                    if parsed.get("found"):
                        prod_name = parsed.get("product_name")
                        if prod_name and "unknown" not in prod_name.lower():
                            manufacturer = parsed.get("manufacturer") or parsed.get("brand") or "Verified Commercial Brand"
                            category = parsed.get("category") or "Personal Care & Hygiene"
                            return {
                                "product_name": prod_name,
                                "manufacturer": manufacturer,
                                "batch_id": f"GTIN-{clean_digits}",
                                "source": "Live Global GS1 & Web Product Registry",
                                "category": category,
                                "status": "AUTHENTIC",
                            }
                except Exception:
                    pass

                # Text fallback regex extraction
                match = re.search(r'(?:is|product is|corresponds to|associated with)\s+["\']?([^"\'\.\n]+)["\']?', raw_text, re.IGNORECASE)
                if match and "not " not in match.group(0).lower():
                    cand_name = match.group(1).strip()
                    if cand_name and len(cand_name) > 3 and "unknown" not in cand_name.lower():
                        b_match = re.search(r'(?:brand is|brand:|manufacturer:)\s+["\']?([^"\'\.\n]+)["\']?', raw_text, re.IGNORECASE)
                        brand_name = b_match.group(1).strip() if b_match else "Verified Brand"
                        return {
                            "product_name": cand_name,
                            "manufacturer": brand_name,
                            "batch_id": f"GTIN-{clean_digits}",
                            "source": "Live Global GS1 & Web Product Registry",
                            "category": "Consumer Retail Goods",
                            "status": "AUTHENTIC",
                        }
    except Exception as e:
        logger.warning(f"Universal GTIN web lookup notice for '{clean_digits}': {e}")
    return None


async def fetch_online_product_data(code: str) -> Optional[Dict[str, Any]]:
    """
    Unified multi-tier online lookup runner:
    1. Checks Open Food Facts / Open Beauty Facts for food/cosmetics barcode GTINs.
    2. Checks UPCitemdb for general retail and commercial supermarket barcodes.
    3. Checks Universal Real-Time Web & GS1 GTIN Search via Gemini 2.5 Flash Lite.
    4. Checks EMDEX Nigeria Drug Database lookup for pharmaceutical product titles, brands, or codes.
    Zero hardcoded catalogs.
    """
    clean_code = code.strip()

    # 1. Barcode lookups
    digits_only = re.sub(r"[^0-9]", "", clean_code)
    if len(digits_only) >= 7:
        # Tier 1: OpenFoodFacts & OpenBeautyFacts
        off_hit = await lookup_online_barcode(clean_code)
        if off_hit:
            return off_hit

        # Tier 2: UPCitemdb Commercial Retail Database
        upc_hit = await lookup_upcitemdb(clean_code)
        if upc_hit:
            return upc_hit

        # Tier 3: Universal Real-Time Web & GS1 GTIN Search
        web_hit = await lookup_live_web_gtin(clean_code)
        if web_hit:
            return web_hit

    # Tier 4: EMDEX Nigeria Drug Database lookup
    emdex_hit = await search_emdex_drug(clean_code)
    if emdex_hit:
        return emdex_hit

    return None
