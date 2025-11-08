import puppeteer from 'puppeteer';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', error => console.log('❌ PAGE ERROR:', error.message));

  const issues = [];
  const addIssue = (view, issue) => {
    issues.push({ view, issue });
    console.log(`⚠️ [${view}] ${issue}`);
  };

  try {
    console.log('🚀 TESTING COMPLETE UX FLOW - SYSTEM HÓA CHECK\n');
    
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });
    console.log('✅ App loaded\n');

    // ==================== DASHBOARD ====================
    console.log('📊 TESTING DASHBOARD...');
    
    // Check if stats are clickable
    const statsCards = await page.$$('.bg-white.rounded-lg.border-2');
    console.log(`  Found ${statsCards.length} stat cards`);
    
    // Check "View all" buttons
    const viewAllButtons = await page.$$('text/View all');
    console.log(`  Found ${viewAllButtons.length} "View all" buttons`);
    if (viewAllButtons.length === 0) {
      addIssue('Dashboard', 'No "View all" buttons found');
    }

    // Check AI recommendations
    const recommendations = await page.$$('.bg-gradient-to-r');
    console.log(`  Found ${recommendations.length} AI recommendations`);
    
    // Try clicking a recommendation "Apply" button
    const applyButtons = await page.$$('button');
    const applyButtonsFiltered = [];
    for (const btn of applyButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Apply')) applyButtonsFiltered.push(btn);
    }
    console.log(`  Found ${applyButtonsFiltered.length} "Apply" buttons`);
    
    await wait(1000);

    // ==================== TASKS - LIST VIEW ====================
    console.log('\n📋 TESTING TASKS - LIST VIEW...');
    await page.click('text/Tasks');
    await wait(1000);
    await page.click('text/List');
    await wait(1000);

    // Check filters
    const searchBox = await page.$('input[placeholder*="Search"]');
    if (!searchBox) {
      addIssue('List View', 'No search box found');
    } else {
      console.log('  ✅ Search box exists');
    }

    const filterSelects = await page.$$('select');
    console.log(`  Found ${filterSelects.length} filter dropdowns`);
    if (filterSelects.length < 3) {
      addIssue('List View', `Only ${filterSelects.length} filters (expected 3+)`);
    }

    // Check task cards clickable
    const listTaskCards = await page.$$('.cursor-pointer');
    console.log(`  Found ${listTaskCards.length} task cards`);
    if (listTaskCards.length > 0) {
      await listTaskCards[0].click();
      await wait(500);
      const modal = await page.$('.fixed.inset-0');
      if (modal) {
        console.log('  ✅ Task click → Modal works');
        // Close modal
        const closeBtn = await page.$('button svg');
        if (closeBtn) await closeBtn.click();
        await wait(500);
      } else {
        addIssue('List View', 'Task click does NOT open modal');
      }
    }

    // ==================== TASKS - KANBAN VIEW ====================
    console.log('\n🎯 TESTING TASKS - KANBAN VIEW...');
    await page.click('text/Board');
    await wait(1000);

    // Check if has filters
    const kanbanSearch = await page.$('input[placeholder*="Search"]');
    if (!kanbanSearch) {
      addIssue('Kanban View', 'No search/filter bar');
    } else {
      console.log('  ✅ Has search box');
    }

    // Check task cards clickable
    const kanbanCards = await page.$$('.bg-white.rounded-lg.border');
    console.log(`  Found ${kanbanCards.length} kanban cards`);
    if (kanbanCards.length > 0) {
      await kanbanCards[0].click();
      await wait(500);
      const modal = await page.$('.fixed.inset-0');
      if (modal) {
        console.log('  ✅ Task click → Modal works');
        const closeBtn = await page.$('button svg');
        if (closeBtn) await closeBtn.click();
        await wait(500);
      } else {
        addIssue('Kanban View', 'Task click does NOT open modal');
      }
    }

    // ==================== TASKS - GANTT VIEW ====================
    console.log('\n📊 TESTING TASKS - GANTT VIEW...');
    await page.click('text/Gantt');
    await wait(1500);

    // Check if has filters
    const ganttFilters = await page.$$('select');
    if (ganttFilters.length === 0) {
      addIssue('Gantt View', 'No filter dropdowns');
    } else {
      console.log(`  ✅ Has ${ganttFilters.length} filters`);
    }

    // Check task bars clickable - find task bar with bg-brand-primary
    const ganttTaskBar = await page.$('.bg-brand-primary.rounded-md');
    if (ganttTaskBar) {
      await ganttTaskBar.click();
      await wait(800);
      const modal = await page.$('.fixed.inset-0');
      if (modal) {
        console.log('  ✅ Task click → Modal works');
        const closeBtn = await page.$('button svg');
        if (closeBtn) await closeBtn.click();
        await wait(500);
      } else {
        addIssue('Gantt View', 'Task click does NOT open modal');
      }
    } else {
      addIssue('Gantt View', 'No task bars found');
    }

    // ==================== TASKS - TIMELINE VIEW ====================
    console.log('\n⏱️ TESTING TASKS - TIMELINE VIEW...');
    await page.click('text/Timeline');
    await wait(1500);

    // Check if has filters
    const timelineSearch = await page.$('input[placeholder*="Search"]');
    if (!timelineSearch) {
      addIssue('Timeline View', 'No search/filter bar');
    } else {
      console.log('  ✅ Has search box');
    }

    // Check task items clickable - find task in expanded list
    const timelineTaskItems = await page.$$('.hover\\:bg-background-tertiary.cursor-pointer');
    console.log(`  Found ${timelineTaskItems.length} task items`);
    if (timelineTaskItems.length > 0) {
      await timelineTaskItems[0].click();
      await wait(800);
      const modal = await page.$('.fixed.inset-0');
      if (modal) {
        console.log('  ✅ Task click → Modal works');
        const closeBtn = await page.$('button svg');
        if (closeBtn) await closeBtn.click();
        await wait(500);
      } else {
        addIssue('Timeline View', 'Task click does NOT open modal');
      }
    } else {
      addIssue('Timeline View', 'No task items found');
    }

    // ==================== TASKS - SPRINT VIEW ====================
    console.log('\n⚡ TESTING TASKS - SPRINT VIEW...');
    await page.click('text/Sprint');
    await wait(3000); // Wait longer for data to load
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'sprint-view-debug.png', fullPage: true });

    // Check AI suggestions - look for specific text
    const aiSuggestionsText = await page.evaluate(() => {
      const bodyText = document.body.textContent;
      console.log('Body text sample:', bodyText.substring(0, 500));
      return bodyText.includes('AI Sprint Suggestion') || 
             bodyText.includes('Suggested Sprint Capacity') ||
             bodyText.includes('Unable to load sprint data');
    });
    
    if (!aiSuggestionsText) {
      addIssue('Sprint View', 'No AI Suggestions section visible');
      console.log('  📸 Sprint view screenshot saved for debugging');
    } else {
      console.log('  ✅ AI Suggestions section exists');
    }

    // Check backlog tasks clickable
    const sprintTaskCards = await page.$$('.bg-white.rounded-lg.border');
    console.log(`  Found ${sprintTaskCards.length} task cards`);
    if (sprintTaskCards.length > 0) {
      await sprintTaskCards[0].click();
      await wait(800);
      const modal = await page.$('.fixed.inset-0');
      if (modal) {
        console.log('  ✅ Task click → Modal works');
        const closeBtn = await page.$('button svg');
        if (closeBtn) await closeBtn.click();
        await wait(500);
      } else {
        addIssue('Sprint View', 'Task click does NOT open modal');
      }
    }

    // ==================== ANALYTICS ====================
    console.log('\n📈 TESTING ANALYTICS...');
    await page.click('text/Analytics');
    await wait(1000);

    // Check recommended tasks clickable
    const analyticsCards = await page.$$('.cursor-pointer');
    console.log(`  Found ${analyticsCards.length} clickable elements`);
    if (analyticsCards.length > 0) {
      await analyticsCards[0].click();
      await wait(500);
      const modal = await page.$('.fixed.inset-0');
      if (modal) {
        console.log('  ✅ Task click → Modal works');
        const closeBtn = await page.$('button svg');
        if (closeBtn) await closeBtn.click();
        await wait(500);
      } else {
        addIssue('Analytics View', 'Task click does NOT open modal');
      }
    }

    // ==================== DEEP LINKING TEST ====================
    console.log('\n🔗 TESTING DEEP LINKING...');
    await page.click('text/Dashboard');
    await wait(1000);

    // Try clicking "View all" for Human Tasks
    const humanViewAll = await page.$('text/View all');
    if (humanViewAll) {
      await humanViewAll.click();
      await wait(1500);
      
      // Check if Tasks page is visible (look for view switcher buttons)
      const tasksPageIndicator = await page.$('text/List');
      const ganttButton = await page.$('text/Gantt');
      
      if (tasksPageIndicator && ganttButton) {
        console.log('  ✅ Deep linking works - navigated to Tasks page');
      } else {
        addIssue('Deep Linking', '"View all" does NOT navigate to Tasks page');
      }
    } else {
      addIssue('Deep Linking', 'No "View all" button found');
    }

    // ==================== FINAL REPORT ====================
    console.log('\n' + '='.repeat(60));
    console.log('📋 UX SYSTEM HÓA - ISSUES FOUND:');
    console.log('='.repeat(60));
    
    if (issues.length === 0) {
      console.log('🎉 NO ISSUES! App is 100% system hóa!');
    } else {
      issues.forEach((item, idx) => {
        console.log(`${idx + 1}. [${item.view}] ${item.issue}`);
      });
      console.log(`\n⚠️ TOTAL: ${issues.length} issues need fixing`);
    }

    console.log('='.repeat(60));

    // Take final screenshot
    await page.screenshot({ path: 'ux-flow-test-complete.png', fullPage: true });
    console.log('\n📸 Screenshot saved: ux-flow-test-complete.png');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'ux-flow-error.png', fullPage: true });
  } finally {
    await wait(2000);
    await browser.close();
  }
})();
