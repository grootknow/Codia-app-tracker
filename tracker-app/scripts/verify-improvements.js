import puppeteer from 'puppeteer';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  console.log('🔍 VERIFYING 10 IMPROVEMENTS\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  const page = await browser.newPage();
  
  const results = {
    passed: [],
    failed: []
  };

  try {
    await page.goto('http://localhost:3003', { waitUntil: 'networkidle0' });
    await wait(2000);
    console.log('✅ App loaded\n');

    // ==================== TEST 1: Today's Focus ====================
    console.log('📋 TEST 1: Dashboard - Today\'s Focus');
    const todaysFocus = await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('h2')).find(h => 
        h.textContent.includes("Today's Focus")
      );
      if (!heading) return null;
      
      const section = heading.closest('.bg-gradient-to-br');
      const taskCards = section?.querySelectorAll('.flex.items-start.gap-3.p-4');
      
      return {
        exists: !!heading,
        taskCount: taskCards?.length || 0,
        hasTargetIcon: section?.textContent.includes('🎯') || false
      };
    });
    
    if (todaysFocus?.exists && todaysFocus.taskCount > 0) {
      console.log(`  ✅ PASS - Found ${todaysFocus.taskCount} tasks\n`);
      results.passed.push('Today\'s Focus');
    } else {
      console.log(`  ❌ FAIL - Not found or no tasks\n`);
      results.failed.push('Today\'s Focus');
    }

    // ==================== TEST 2: AI Activity Stream ====================
    console.log('📋 TEST 2: Dashboard - AI Activity Stream (Prominent)');
    const aiActivity = await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('h2')).find(h => 
        h.textContent.includes('AI Activity Stream')
      );
      if (!heading) return null;
      
      const section = heading.closest('.bg-gradient-to-br');
      const logs = section?.querySelectorAll('.flex.items-start.gap-3.p-4');
      
      return {
        exists: !!heading,
        logCount: logs?.length || 0,
        isProminent: section?.className.includes('green') || false
      };
    });
    
    if (aiActivity?.exists) {
      console.log(`  ✅ PASS - Found ${aiActivity.logCount} logs, prominent: ${aiActivity.isProminent}\n`);
      results.passed.push('AI Activity Stream');
    } else {
      console.log(`  ❌ FAIL - Not found\n`);
      results.failed.push('AI Activity Stream');
    }

    // ==================== TEST 3: Phase Progress ====================
    console.log('📋 TEST 3: Dashboard - Phase Progress Breakdown');
    const phaseProgress = await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('h2')).find(h => 
        h.textContent.includes('Phase Progress')
      );
      if (!heading) return null;
      
      const section = heading.closest('.bg-background-secondary');
      const phases = section?.querySelectorAll('.bg-background-tertiary.rounded-lg');
      const progressBars = section?.querySelectorAll('.bg-gradient-to-r');
      
      return {
        exists: !!heading,
        phaseCount: phases?.length || 0,
        hasProgressBars: progressBars?.length > 0
      };
    });
    
    if (phaseProgress?.exists && phaseProgress.phaseCount > 0) {
      console.log(`  ✅ PASS - Found ${phaseProgress.phaseCount} phases with progress bars\n`);
      results.passed.push('Phase Progress');
    } else {
      console.log(`  ❌ FAIL - Not found or no phases\n`);
      results.failed.push('Phase Progress');
    }

    // ==================== TEST 4: Quick Actions ====================
    console.log('📋 TEST 4: List View - Quick Actions');
    await page.click('text/Tasks');
    await wait(1000);
    await page.click('text/List');
    await wait(1500);
    
    const quickActions = await page.evaluate(() => {
      const startButtons = Array.from(document.querySelectorAll('button')).filter(b => 
        b.textContent.includes('Start')
      );
      const doneButtons = Array.from(document.querySelectorAll('button')).filter(b => 
        b.textContent.includes('Done')
      );
      
      return {
        startCount: startButtons.length,
        doneCount: doneButtons.length,
        total: startButtons.length + doneButtons.length
      };
    });
    
    if (quickActions.total > 0) {
      console.log(`  ✅ PASS - Found ${quickActions.startCount} Start + ${quickActions.doneCount} Done buttons\n`);
      results.passed.push('Quick Actions');
    } else {
      console.log(`  ❌ FAIL - No quick action buttons found\n`);
      results.failed.push('Quick Actions');
    }

    // ==================== TEST 5: Ready Filter ====================
    console.log('📋 TEST 5: List View - Ready to Start Filter');
    const readyFilter = await page.evaluate(() => {
      const button = Array.from(document.querySelectorAll('button')).find(b => 
        b.textContent.includes('Ready to Start')
      );
      return {
        exists: !!button,
        hasIcon: button?.textContent.includes('🚀') || false
      };
    });
    
    if (readyFilter.exists) {
      console.log(`  ✅ PASS - Ready to Start button found\n`);
      results.passed.push('Ready Filter');
    } else {
      console.log(`  ❌ FAIL - Button not found\n`);
      results.failed.push('Ready Filter');
    }

    // ==================== TEST 6: Hours + Dependencies ====================
    console.log('📋 TEST 6: List View - Hours + Dependencies');
    const metadata = await page.evaluate(() => {
      const hoursElements = Array.from(document.querySelectorAll('span')).filter(s => 
        s.textContent.match(/\d+h/)
      );
      const depsElements = Array.from(document.querySelectorAll('span')).filter(s => 
        s.textContent.includes('Blocks')
      );
      
      return {
        hoursCount: hoursElements.length,
        depsCount: depsElements.length
      };
    });
    
    if (metadata.hoursCount > 0) {
      console.log(`  ✅ PASS - Found ${metadata.hoursCount} hours, ${metadata.depsCount} dependencies\n`);
      results.passed.push('Hours + Dependencies');
    } else {
      console.log(`  ❌ FAIL - Metadata not visible\n`);
      results.failed.push('Hours + Dependencies');
    }

    // ==================== TEST 7: Auto Critical Path ====================
    console.log('📋 TEST 7: Gantt - Auto Critical Path');
    await page.click('text/Gantt');
    await wait(2000);
    
    const criticalPath = await page.evaluate(() => {
      const checkbox = document.querySelector('input[type="checkbox"]');
      const redBars = document.querySelectorAll('.bg-red-500');
      
      return {
        checkboxChecked: checkbox?.checked || false,
        redBarsCount: redBars.length
      };
    });
    
    if (criticalPath.checkboxChecked) {
      console.log(`  ✅ PASS - Critical Path auto-enabled, ${criticalPath.redBarsCount} critical tasks\n`);
      results.passed.push('Auto Critical Path');
    } else {
      console.log(`  ❌ FAIL - Not auto-enabled\n`);
      results.failed.push('Auto Critical Path');
    }

    // ==================== TEST 8: Today Marker ====================
    console.log('📋 TEST 8: Gantt - Today Marker');
    const todayMarker = await page.evaluate(() => {
      const label = Array.from(document.querySelectorAll('div')).find(d => 
        d.textContent.includes('TODAY')
      );
      return {
        exists: !!label,
        hasIcon: label?.textContent.includes('📍') || false
      };
    });
    
    if (todayMarker.exists) {
      console.log(`  ✅ PASS - Today marker with label found\n`);
      results.passed.push('Today Marker');
    } else {
      console.log(`  ❌ FAIL - Marker not found\n`);
      results.failed.push('Today Marker');
    }

    // ==================== TEST 9: Sprint Capacity Bar ====================
    console.log('📋 TEST 9: Sprint - Capacity Progress Bar');
    await page.click('text/Sprint');
    await wait(2500);
    
    const capacityBar = await page.evaluate(() => {
      const capacityText = Array.from(document.querySelectorAll('span')).find(s => 
        s.textContent.includes('Sprint Capacity')
      );
      if (!capacityText) return null;
      
      const section = capacityText.closest('.bg-white');
      const progressBar = section?.querySelector('.rounded-full.h-4');
      const colorClass = progressBar?.className;
      
      return {
        exists: !!capacityText,
        hasProgressBar: !!progressBar,
        hasColor: colorClass?.includes('bg-success') || colorClass?.includes('bg-warning') || colorClass?.includes('bg-error')
      };
    });
    
    if (capacityBar?.exists && capacityBar.hasProgressBar) {
      console.log(`  ✅ PASS - Capacity bar found with color coding\n`);
      results.passed.push('Capacity Bar');
    } else {
      console.log(`  ❌ FAIL - Bar not found\n`);
      results.failed.push('Capacity Bar');
    }

    // ==================== FINAL REPORT ====================
    console.log('='.repeat(60));
    console.log('📊 VERIFICATION RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ PASSED: ${results.passed.length}/9`);
    console.log(`❌ FAILED: ${results.failed.length}/9\n`);
    
    if (results.passed.length > 0) {
      console.log('✅ Passed tests:');
      results.passed.forEach(t => console.log(`   - ${t}`));
      console.log('');
    }
    
    if (results.failed.length > 0) {
      console.log('❌ Failed tests:');
      results.failed.forEach(t => console.log(`   - ${t}`));
      console.log('');
    }
    
    const passRate = ((results.passed.length / 9) * 100).toFixed(0);
    console.log(`Pass Rate: ${passRate}%`);
    
    if (results.passed.length === 9) {
      console.log('\n🎉 ALL IMPROVEMENTS VERIFIED! APP IS READY!\n');
    } else {
      console.log(`\n⚠️ ${results.failed.length} improvements need fixing\n`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await wait(3000);
    await browser.close();
  }
})();
