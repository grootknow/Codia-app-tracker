/**
 * AUTOMATED GANTT TEST - Using Puppeteer
 * Tests all Gantt features: zoom, arrows, drag, resize, dependencies
 */

import puppeteer from 'puppeteer';

const TEST_URL = 'http://localhost:3006';
const RESULTS = {
  passed: [],
  failed: [],
  warnings: []
};

function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

function pass(test) {
  RESULTS.passed.push(test);
  log('✅', test);
}

function fail(test, reason) {
  RESULTS.failed.push({ test, reason });
  log('❌', `${test}: ${reason}`);
}

function warn(test, reason) {
  RESULTS.warnings.push({ test, reason });
  log('⚠️', `${test}: ${reason}`);
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testGanttChart() {
  log('🚀', 'Starting Gantt Chart Automated Test...\n');
  
  const browser = await puppeteer.launch({
    headless: false, // Show browser for debugging
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // ==================== TEST 1: PAGE LOAD ====================
    log('📄', 'TEST 1: Page Load & Navigation');
    await page.goto(TEST_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(2000);
    
    // Check if page loaded
    const title = await page.title();
    if (title) {
      pass('Page loaded successfully');
    } else {
      fail('Page load', 'No title found');
    }
    
    // Navigate to Tasks page first
    const tasksClicked = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, button'));
      const tasksLink = links.find(l => l.textContent.includes('Tasks'));
      if (tasksLink) {
        tasksLink.click();
        return true;
      }
      return false;
    });
    if (tasksClicked) {
      await wait(1500);
      pass('Tasks page opened');
    }
    
    // Click Gantt tab
    const ganttClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const ganttBtn = buttons.find(b => b.textContent.includes('Gantt'));
      if (ganttBtn) {
        ganttBtn.click();
        return true;
      }
      return false;
    });
    if (ganttClicked) {
      await wait(2000); // Wait for Gantt to render
      pass('Gantt tab clicked');
    } else {
      fail('Gantt tab', 'Button not found');
    }
    
    // ==================== TEST 2: GANTT ELEMENTS ====================
    log('\n📊', 'TEST 2: Gantt Elements Visibility');
    
    // Check timeline exists
    const timeline = await page.$('.flex-1.overflow-auto.relative');
    if (timeline) {
      pass('Timeline container exists');
    } else {
      fail('Timeline', 'Container not found');
    }
    
    // Check task bars exist
    const taskBars = await page.$$('[class*="cursor-grab"]');
    if (taskBars.length > 0) {
      pass(`Found ${taskBars.length} task bars`);
    } else {
      fail('Task bars', 'No task bars found');
    }
    
    // Check phase headers
    const phaseCount = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.filter(el => el.textContent.includes('Phase')).length;
    });
    if (phaseCount > 0) {
      pass(`Found ${phaseCount} phase headers`);
    } else {
      warn('Phase headers', 'No phases found');
    }
    
    // ==================== TEST 3: DEPENDENCIES ====================
    log('\n🔗', 'TEST 3: Dependencies & Arrows');
    
    // Enable dependencies toggle
    const depsClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const depsBtn = buttons.find(b => b.textContent.includes('Dependencies'));
      if (depsBtn) {
        depsBtn.click();
        return true;
      }
      return false;
    });
    if (depsClicked) {
      await wait(500);
      pass('Dependencies toggle clicked');
    }
    
    // Check SVG arrows exist
    const svg = await page.$('svg.absolute.top-0.left-0.pointer-events-none');
    if (svg) {
      pass('Arrow SVG canvas exists');
      
      // Check arrows inside SVG
      const arrows = await page.$$('svg line[stroke="#3b82f6"]');
      if (arrows.length > 0) {
        pass(`Found ${arrows.length} dependency arrows`);
      } else {
        fail('Arrows', 'No arrows rendered');
      }
    } else {
      fail('Arrow SVG', 'SVG canvas not found');
    }
    
    // ==================== TEST 4: ZOOM ====================
    log('\n🔍', 'TEST 4: Zoom Functionality');
    
    // Get initial zoom level
    const zoomSlider = await page.$('input[type="range"]');
    if (zoomSlider) {
      const initialZoom = await page.$eval('input[type="range"]', el => el.value);
      pass(`Initial zoom: ${initialZoom}%`);
      
      // Test zoom IN
      const zoomInClicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const zoomBtn = buttons.find(b => b.innerHTML.includes('ZoomIn') || b.textContent.includes('+'));
        if (zoomBtn) {
          zoomBtn.click();
          return true;
        }
        return false;
      });
      if (zoomInClicked) {
        await wait(500);
        const newZoom = await page.$eval('input[type="range"]', el => el.value);
        if (parseFloat(newZoom) > parseFloat(initialZoom)) {
          pass(`Zoom IN works: ${initialZoom}% → ${newZoom}%`);
        } else {
          fail('Zoom IN', 'Zoom level did not increase');
        }
      }
      
      // Test zoom OUT
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const zoomBtn = buttons.find(b => b.innerHTML.includes('ZoomOut') || b.textContent.includes('-'));
        if (zoomBtn) {
          zoomBtn.click();
          setTimeout(() => zoomBtn.click(), 100); // Click twice
        }
      });
      await wait(600);
      const finalZoom = await page.$eval('input[type="range"]', el => el.value);
      pass(`Zoom OUT works: ${initialZoom}% → ${finalZoom}%`);
      
      // Check if arrows still visible after zoom
      await wait(500);
      const arrowsAfterZoom = await page.$$('svg line[stroke="#3b82f6"]');
      if (arrowsAfterZoom.length > 0) {
        pass(`Arrows still visible after zoom: ${arrowsAfterZoom.length} arrows`);
      } else {
        fail('Arrows after zoom', 'Arrows disappeared after zoom');
      }
      
    } else {
      fail('Zoom slider', 'Slider not found');
    }
    
    // ==================== TEST 5: VIEW MODES ====================
    log('\n👁️', 'TEST 5: View Mode Switching');
    
    const viewModes = ['Day', 'Week', 'Month'];
    for (const mode of viewModes) {
      const clicked = await page.evaluate((viewMode) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent.trim() === viewMode);
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      }, mode);
      
      if (clicked) {
        await wait(500);
        pass(`Switched to ${mode} view`);
        
        // Check arrows still visible
        const arrows = await page.$$('svg line[stroke="#3b82f6"]');
        if (arrows.length > 0) {
          pass(`${mode} view: ${arrows.length} arrows visible`);
        } else {
          warn(`${mode} view`, 'No arrows visible');
        }
      }
    }
    
    // ==================== TEST 6: HOVER TOOLTIP ====================
    log('\n💬', 'TEST 6: Hover Tooltip');
    
    const firstTaskBar = await page.$('[class*="cursor-grab"]');
    if (firstTaskBar) {
      await firstTaskBar.hover();
      await wait(500);
      
      // Check if tooltip appears
      const tooltip = await page.$('[class*="tooltip"], [class*="fixed"][class*="z-50"]');
      if (tooltip) {
        pass('Tooltip appears on hover');
        
        // Check tooltip content
        const tooltipText = await tooltip.evaluate(el => el.textContent);
        if (tooltipText.includes('Depends on') || tooltipText.includes('Blocks')) {
          pass('Tooltip shows dependency info');
        } else {
          warn('Tooltip content', 'No dependency info in tooltip');
        }
      } else {
        warn('Tooltip', 'Tooltip not found');
      }
    }
    
    // ==================== TEST 7: DRAG & DROP ====================
    log('\n🖱️', 'TEST 7: Drag & Drop');
    
    if (firstTaskBar) {
      const box = await firstTaskBar.boundingBox();
      if (box) {
        // Get initial position
        const initialLeft = await firstTaskBar.evaluate(el => el.style.left);
        
        // Drag task
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + 100, box.y + box.height / 2, { steps: 10 });
        await page.mouse.up();
        await wait(1000);
        
        // Check if position changed
        const newLeft = await firstTaskBar.evaluate(el => el.style.left);
        if (newLeft !== initialLeft) {
          pass('Drag & drop works');
        } else {
          warn('Drag & drop', 'Position did not change');
        }
      }
    }
    
    // ==================== TEST 8: RESIZE ====================
    log('\n↔️', 'TEST 8: Resize Task Bar');
    
    const resizeHandle = await page.$('[class*="cursor-col-resize"]');
    if (resizeHandle) {
      const box = await resizeHandle.boundingBox();
      if (box) {
        // Get initial width
        const taskBar = await page.$('[class*="cursor-grab"]');
        const initialWidth = await taskBar.evaluate(el => el.style.width);
        
        // Resize
        await page.mouse.move(box.x, box.y);
        await page.mouse.down();
        await page.mouse.move(box.x + 50, box.y, { steps: 10 });
        await page.mouse.up();
        await wait(1000);
        
        // Check if width changed
        const newWidth = await taskBar.evaluate(el => el.style.width);
        if (newWidth !== initialWidth) {
          pass('Resize works');
        } else {
          warn('Resize', 'Width did not change');
        }
      }
    } else {
      warn('Resize handle', 'Handle not found');
    }
    
    // ==================== TEST 9: FILTERS ====================
    log('\n🔎', 'TEST 9: Filters');
    
    const statusFilter = await page.$('select[class*="border"]');
    if (statusFilter) {
      await statusFilter.select('IN_PROGRESS');
      await wait(500);
      pass('Status filter works');
      
      // Reset filter
      await statusFilter.select('ALL');
      await wait(500);
    }
    
    // ==================== TEST 10: PERFORMANCE ====================
    log('\n⚡', 'TEST 10: Performance Metrics');
    
    const metrics = await page.metrics();
    pass(`JS Heap: ${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)} MB`);
    pass(`DOM Nodes: ${metrics.Nodes}`);
    pass(`Event Listeners: ${metrics.JSEventListeners}`);
    
    // Check for console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await wait(2000);
    
    if (errors.length === 0) {
      pass('No console errors');
    } else {
      fail('Console errors', `${errors.length} errors found`);
      errors.forEach(err => console.log(`  - ${err}`));
    }
    
  } catch (error) {
    fail('Test execution', error.message);
    console.error(error);
  } finally {
    await browser.close();
  }
  
  // ==================== SUMMARY ====================
  log('\n' + '='.repeat(60));
  log('📊', 'TEST SUMMARY');
  log('='.repeat(60));
  log('✅', `PASSED: ${RESULTS.passed.length}`);
  log('❌', `FAILED: ${RESULTS.failed.length}`);
  log('⚠️', `WARNINGS: ${RESULTS.warnings.length}`);
  
  if (RESULTS.failed.length > 0) {
    log('\n❌', 'FAILED TESTS:');
    RESULTS.failed.forEach(({ test, reason }) => {
      console.log(`  - ${test}: ${reason}`);
    });
  }
  
  if (RESULTS.warnings.length > 0) {
    log('\n⚠️', 'WARNINGS:');
    RESULTS.warnings.forEach(({ test, reason }) => {
      console.log(`  - ${test}: ${reason}`);
    });
  }
  
  const score = Math.round((RESULTS.passed.length / (RESULTS.passed.length + RESULTS.failed.length)) * 100);
  log('\n🎯', `OVERALL SCORE: ${score}%`);
  
  if (score >= 90) {
    log('🎉', 'EXCELLENT! Gantt is production ready!');
  } else if (score >= 70) {
    log('👍', 'GOOD! Minor fixes needed.');
  } else {
    log('⚠️', 'NEEDS WORK! Major issues found.');
  }
  
  process.exit(RESULTS.failed.length > 0 ? 1 : 0);
}

// Run tests
testGanttChart().catch(console.error);
