"""
live_analysis_agent.py — Vercel-compatible HTTP fallback

Playwright and its Chromium browser binary (~280-380 MB) are incompatible with
Vercel's 500 MB serverless function limit. This module replaces the headless
browser with a lightweight httpx-based HTTP analysis that:

  1. Follows redirect chains (counts hops)
  2. Scans raw HTML for password input fields
  3. Scans raw HTML for iframe elements
  4. Scans raw HTML for external form action URLs

This covers the most impactful heuristics from the original Playwright agent.
JavaScript-rendered content and screenshots are not available in this mode.
For full Playwright support, deploy the live analysis as a separate service on
Railway, Render, or Google Cloud Run and point LIVE_ANALYSIS_URL env var to it.
"""
import asyncio
import os
import re
from typing import Dict, Any

import httpx

# If a dedicated live analysis microservice URL is configured, proxy to it.
LIVE_ANALYSIS_URL = os.getenv("LIVE_ANALYSIS_URL", None)

class LiveAnalysisAgent:
    def __init__(self):
        self.timeout = 8.0  # seconds

    async def analyze_url(self, url: str) -> Dict[str, Any]:
        """
        Analyzes a URL for phishing indicators.

        If LIVE_ANALYSIS_URL env var is set, proxies the request to a separate
        Playwright microservice. Otherwise uses the built-in HTTP fallback.
        """
        if not url.startswith('http'):
            url = 'http://' + url

        if LIVE_ANALYSIS_URL:
            return await self._proxy_to_microservice(url)
        else:
            return await self._http_fallback(url)

    async def _proxy_to_microservice(self, url: str) -> Dict[str, Any]:
        """
        Proxies to a dedicated Playwright microservice running on
        Railway/Render/Cloud Run. The microservice runs the full
        headless browser analysis and returns the same schema.
        """
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    f"{LIVE_ANALYSIS_URL}/analyze",
                    json={"url": url}
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            # Fall back gracefully if microservice is unreachable
            result = await self._http_fallback(url)
            result["error"] = f"Playwright microservice unreachable ({e}). Used HTTP fallback."
            return result

    async def _http_fallback(self, url: str) -> Dict[str, Any]:
        """
        Lightweight HTTP-based analysis using httpx.
        No browser binary required — compatible with Vercel serverless.
        """
        result = {
            "success": False,
            "login_form_detected": False,
            "password_field": False,
            "hidden_iframe": False,
            "external_form_action": False,
            "redirect_count": 0,
            "page_title": "",
            "screenshot_path": None,  # Not available without Playwright
            "error": None,
            "fallback_mode": True      # Tells the frontend no screenshot is available
        }

        try:
            async with httpx.AsyncClient(
                follow_redirects=True,
                timeout=self.timeout,
                verify=False,  # Allow self-signed certs (phishing sites often have bad certs)
                headers={"User-Agent": "Mozilla/5.0 (compatible; PhishSense/1.0)"}
            ) as client:
                response = await client.get(url)
                result["redirect_count"] = len(response.history)

                body = response.text

                # --- Heuristic 1: Password fields ---
                # Catches type="password", type='password', type=password
                if re.search(r'type\s*=\s*["\']?password["\']?', body, re.IGNORECASE):
                    result["password_field"] = True
                    result["login_form_detected"] = True

                # --- Heuristic 2: iframes (any, as a signal) ---
                if re.search(r'<iframe', body, re.IGNORECASE):
                    result["hidden_iframe"] = True  # Conservative: flag all iframes

                # --- Heuristic 3: External form action ---
                # Looks for <form action="http://other-domain.com">
                parsed_base = url.split('/')[2]  # Extract hostname
                form_actions = re.findall(
                    r'<form[^>]+action\s*=\s*["\']?(https?://[^\s"\']+)',
                    body,
                    re.IGNORECASE
                )
                for action in form_actions:
                    action_host = action.split('/')[2] if '//' in action else ''
                    if action_host and action_host != parsed_base:
                        result["external_form_action"] = True
                        result["login_form_detected"] = True
                        break

                # --- Extract page title ---
                title_match = re.search(r'<title[^>]*>(.*?)</title>', body, re.IGNORECASE | re.DOTALL)
                if title_match:
                    result["page_title"] = title_match.group(1).strip()[:200]

                result["success"] = True

        except httpx.TimeoutException:
            result["error"] = "Timeout while trying to analyze live website."
        except Exception as e:
            result["error"] = f"Failed to analyze live website: {str(e)}"

        return result


live_agent = LiveAnalysisAgent()
