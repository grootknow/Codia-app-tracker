import puppeteer from 'puppeteer';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Listen to console logs
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  try {
    console.log('🚀 Testing WorkflowDashboard Modal...');
    
    // Navigate to app
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });
    console.log('✅ App loaded');

    // Click Tasks tab
    await page.waitForSelector('text/Tasks', { timeout: 5000 });
    await page.click('text/Tasks');
    await wait(1000);
    console.log('✅ Navigated to Tasks page');

    // Click List view button to show WorkflowDashboard
    await page.waitForSelector('text/List', { timeout: 5000 });
    await page.click('text/List');
    await wait(1000);
    console.log('✅ Switched to List view (WorkflowDashboard)');

    // Wait for tasks to load
    await page.waitForSelector('.cursor-pointer', { timeout: 5000 });
    console.log('✅ Tasks loaded');

    // Click first task card
    const taskCards = await page.$$('.cursor-pointer');
    if (taskCards.length > 0) {
      await taskCards[0].click();
      await wait(1500);
      console.log('✅ Clicked first task');

      // Screenshot after click
      await page.screenshot({ path: 'after-click.png', fullPage: true });
      console.log('📸 Screenshot after click saved');

      // Check DOM for modal
      const hasModal = await page.evaluate(() => {
        const overlay = document.querySelector('.fixed.inset-0');
        const modalContent = document.querySelector('.bg-white.rounded-lg');
        return {
          hasOverlay: !!overlay,
          hasModalContent: !!modalContent,
          bodyHTML: document.body.innerHTML.substring(0, 500)
        };
      });
      console.log('🔍 Modal check:', hasModal);

      // Check if modal appeared
      const modal = await page.$('.fixed.inset-0');
      if (modal) {
        console.log('✅ TaskDetailModal opened!');
        
        // Take screenshot
        await page.screenshot({ path: 'workflow-modal-test.png', fullPage: true });
        console.log('✅ Screenshot saved: workflow-modal-test.png');

        // Close modal
        const closeButton = await page.$('button[aria-label="Close"]');
        if (closeButton) {
          await closeButton.click();
          await wait(500);
          console.log('✅ Modal closed');
        }
      } else {
        console.log('❌ Modal did NOT appear!');
      }
    } else {
      console.log('❌ No task cards found');
    }

    console.log('\n🎉 TEST COMPLETE!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'workflow-modal-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
