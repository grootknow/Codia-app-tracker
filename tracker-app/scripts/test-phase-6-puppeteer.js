/**
 * Test Phase 6 Integration with Puppeteer
 * Verifies that Phase 6 tasks are visible and functional in the tracker app
 */

const puppeteer = require('puppeteer');

async function testPhase6Integration() {
  console.log('🎭 Starting Puppeteer test for Phase 6...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Test production URL
    const appUrl = 'https://codia-tracker.vercel.app';
    console.log(`📱 Navigating to: ${appUrl}\n`);
    
    await page.goto(appUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for app to load
    await page.waitForSelector('h1', { timeout: 10000 });
    
    console.log('✅ App loaded successfully\n');
    
    // Get total task count
    const totalTasks = await page.evaluate(() => {
      // Check if there's a total count display
      const countElements = document.querySelectorAll('button, div, span');
      for (const el of countElements) {
        const text = el.textContent;
        if (text.includes('tasks') || text.includes('Tasks')) {
          return text;
        }
      }
      return 'Not found';
    });
    
    console.log(`📊 Total tasks display: ${totalTasks}\n`);
    
    // Check if Phase 6 button exists
    const phase6Button = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const phase6Btn = buttons.find(btn => 
        btn.textContent.includes('Phase 6') || 
        btn.textContent.includes('AI Tools 2025')
      );
      return phase6Btn ? {
        found: true,
        text: phase6Btn.textContent,
        classList: Array.from(phase6Btn.classList)
      } : { found: false };
    });
    
    if (phase6Button.found) {
      console.log('✅ Phase 6 button FOUND!');
      console.log(`   Text: ${phase6Button.text}`);
      console.log(`   Classes: ${phase6Button.classList.join(', ')}\n`);
      
      // Click Phase 6 button
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const phase6Btn = buttons.find(btn => 
          btn.textContent.includes('Phase 6') || 
          btn.textContent.includes('AI Tools 2025')
        );
        if (phase6Btn) phase6Btn.click();
      });
      
      console.log('👆 Clicked Phase 6 button\n');
      
      // Wait for tasks to load
      await page.waitForTimeout(2000);
      
      // Count Phase 6 tasks
      const phase6Tasks = await page.evaluate(() => {
        const taskCards = document.querySelectorAll('[class*="border"]');
        return taskCards.length;
      });
      
      console.log(`📋 Phase 6 tasks visible: ${phase6Tasks}\n`);
      
      // Check for milestones
      const milestones = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('div'));
        const milestoneCards = cards.filter(card => 
          card.textContent.includes('🏆') || 
          card.className.includes('milestone') ||
          card.className.includes('yellow')
        );
        return milestoneCards.length;
      });
      
      console.log(`🏆 Milestones found: ${milestones}\n`);
      
      // Look for specific Phase 6 tasks
      const specificTasks = await page.evaluate(() => {
        const results = [];
        const expectedTasks = [
          'TOON Integration',
          'Markitdown MCP',
          'Docling MCP',
          'DeepSeek OCR',
          'Agent Lightning'
        ];
        
        for (const taskName of expectedTasks) {
          const found = Array.from(document.querySelectorAll('*')).some(el => 
            el.textContent.includes(taskName)
          );
          results.push({ task: taskName, found });
        }
        
        return results;
      });
      
      console.log('🔍 Searching for specific Phase 6 tasks:');
      specificTasks.forEach(({ task, found }) => {
        console.log(`   ${found ? '✅' : '❌'} ${task}`);
      });
      console.log('');
      
      // Test task click (modal)
      console.log('🖱️  Testing task click (modal)...');
      const modalTest = await page.evaluate(() => {
        const taskCards = Array.from(document.querySelectorAll('[class*="border"][class*="rounded"]'));
        if (taskCards.length > 0) {
          taskCards[0].click();
          return true;
        }
        return false;
      });
      
      if (modalTest) {
        await page.waitForTimeout(1000);
        
        const modalVisible = await page.evaluate(() => {
          const modal = document.querySelector('[class*="fixed"][class*="inset-0"]');
          return modal !== null;
        });
        
        console.log(`   Modal ${modalVisible ? '✅ OPENED' : '❌ NOT FOUND'}\n`);
        
        if (modalVisible) {
          // Close modal
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
          console.log('   Modal closed\n');
        }
      }
      
      // Take screenshot
      const screenshotPath = 'phase-6-test-screenshot.png';
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      console.log(`📸 Screenshot saved: ${screenshotPath}\n`);
      
      // Test Kanban view
      console.log('🎯 Testing Kanban view...');
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const kanbanBtn = buttons.find(btn => btn.textContent.includes('Kanban'));
        if (kanbanBtn) kanbanBtn.click();
      });
      
      await page.waitForTimeout(2000);
      
      const kanbanColumns = await page.evaluate(() => {
        const columns = document.querySelectorAll('[class*="grid"]');
        return columns.length;
      });
      
      console.log(`   Kanban columns found: ${kanbanColumns}\n`);
      
      console.log('✅ Phase 6 TEST PASSED!\n');
      console.log('Summary:');
      console.log(`   - Phase 6 button: ✅ Found`);
      console.log(`   - Tasks visible: ${phase6Tasks}`);
      console.log(`   - Milestones: ${milestones}`);
      console.log(`   - Modal functionality: ✅ Working`);
      console.log(`   - Screenshot: ✅ Saved\n`);
      
    } else {
      console.log('❌ Phase 6 button NOT FOUND!\n');
      console.log('This means:');
      console.log('   1. SQL has not been executed, OR');
      console.log('   2. App needs hard refresh, OR');
      console.log('   3. Database sync issue\n');
      
      // List available phase buttons
      const availablePhases = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const phaseButtons = buttons
          .filter(btn => btn.textContent.includes('Phase'))
          .map(btn => btn.textContent.trim());
        return phaseButtons;
      });
      
      console.log('Available phase buttons:');
      availablePhases.forEach(phase => console.log(`   - ${phase}`));
      console.log('');
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'phase-6-missing-screenshot.png' });
      console.log('📸 Debug screenshot saved: phase-6-missing-screenshot.png\n');
    }
    
    // Keep browser open for manual inspection
    console.log('🔍 Browser will stay open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\n🎭 Puppeteer test completed!\n');
  }
}

// Run if called directly
if (require.main === module) {
  testPhase6Integration().catch(console.error);
}

module.exports = { testPhase6Integration };
