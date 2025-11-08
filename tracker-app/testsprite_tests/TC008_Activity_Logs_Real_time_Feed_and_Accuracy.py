import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Click on the Logs button to navigate to Activity Logs view.
        frame = context.pages[-1]
        # Click on the Logs button to navigate to Activity Logs view.
        elem = frame.locator('xpath=html/body/div/div/nav/div[2]/div/button[13]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Navigate to a client or task update section to perform a task update on another client.
        frame = context.pages[-1]
        # Click on Phase 0: Prerequisites to navigate to a client or task update section for performing a task update.
        elem = frame.locator('xpath=html/body/div/div/nav/div[2]/div/button[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on the Logs button to return to Activity Logs view and then find a way to perform a task update on another client.
        frame = context.pages[-1]
        # Click on the Logs button to navigate to Activity Logs view.
        elem = frame.locator('xpath=html/body/div/div/nav/div[2]/div/button[13]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Phase 0: Prerequisites' to navigate to a client or task update section to perform a task update.
        frame = context.pages[-1]
        # Click on Phase 0: Prerequisites to navigate to a client or task update section for performing a task update.
        elem = frame.locator('xpath=html/body/div/div/nav/div[2]/div/button[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on the Logs button to navigate back to the Activity Logs view and verify the log feed updates live with the new event.
        frame = context.pages[-1]
        # Click on the Logs button to navigate back to the Activity Logs view.
        elem = frame.locator('xpath=html/body/div/div/nav/div[2]/div/button[13]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=PHASE_0_AI_GENERATED').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Created Phase 0 with 24 AI-generated tasks from V10 diagram analysis').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=11/5/2025, 5:58:57 PM').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=SUCCESS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=PHASE_0_CREATED').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Added Phase 0: Prerequisites with 31 tasks covering accounts, domains, API keys, third-party services, security, and local dev setup').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=11/5/2025, 5:44:36 PM').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=PROJECT_INITIALIZED').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=V10 ULTIMATE tracker initialized with 98 tasks (20 groups, 78 tasks) across 4 phases with parent-child hierarchy').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=11/5/2025, 5:20:57 PM').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=CODIA Platform Tracker • Real-time • Powered by Supabase').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    