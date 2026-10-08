import asyncio
import os
import uuid
from typing import Dict, Any
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError

class LiveAnalysisAgent:
    def __init__(self):
        self.timeout = 10000 # 10 seconds

    async def analyze_url(self, url: str) -> Dict[str, Any]:
        """
        Visits the URL using an isolated Playwright browser and extracts live DOM features.
        """
        if not url.startswith('http'):
            url = 'http://' + url

        result = {
            "success": False,
            "login_form_detected": False,
            "password_field": False,
            "hidden_iframe": False,
            "external_form_action": False,
            "redirect_count": 0,
            "page_title": "",
            "screenshot_path": None,
            "error": None
        }

        # Create screenshot directory if it doesn't exist
        screenshots_dir = os.path.join(os.path.dirname(__file__), "..", "data", "screenshots")
        os.makedirs(screenshots_dir, exist_ok=True)

        try:
            async with async_playwright() as p:
                # Use Chromium, headless, isolated context
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    ignore_https_errors=True,
                    java_script_enabled=False # Disable JS for basic safety by default, or keep true for accurate rendering
                )
                page = await context.new_page()
                
                # Navigate and wait for DOM content
                response = await page.goto(url, timeout=self.timeout, wait_until="domcontentloaded")
                
                if response:
                    # Count redirects by traversing the request chain
                    req = response.request
                    redirects = 0
                    while req.redirected_from:
                        redirects += 1
                        req = req.redirected_from
                    result["redirect_count"] = redirects

                result["page_title"] = await page.title()
                
                # Extract DOM features
                # 1. Password fields
                password_inputs = await page.locator('input[type="password"]').count()
                if password_inputs > 0:
                    result["password_field"] = True
                    result["login_form_detected"] = True
                
                # 2. Forms (especially looking for external actions)
                forms = await page.locator('form').all()
                for form in forms:
                    action = await form.get_attribute('action')
                    if action and action.startswith('http') and not action.startswith(url):
                        result["external_form_action"] = True
                        result["login_form_detected"] = True
                
                # 3. Hidden iframes
                hidden_iframes = await page.locator('iframe[style*="display: none"], iframe[style*="visibility: hidden"], iframe[width="0"], iframe[height="0"]').count()
                if hidden_iframes > 0:
                    result["hidden_iframe"] = True
                
                # Take screenshot
                screenshot_filename = f"scan_{uuid.uuid4().hex[:8]}.png"
                screenshot_filepath = os.path.join(screenshots_dir, screenshot_filename)
                await page.screenshot(path=screenshot_filepath)
                result["screenshot_path"] = screenshot_filepath

                result["success"] = True
                await browser.close()
                
        except PlaywrightTimeoutError:
            result["error"] = "Timeout while trying to analyze live website."
        except Exception as e:
            result["error"] = f"Failed to analyze live website: {str(e)}"

        return result

live_agent = LiveAnalysisAgent()
