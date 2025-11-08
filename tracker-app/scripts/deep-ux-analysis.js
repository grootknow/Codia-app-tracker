import puppeteer from 'puppeteer';
import fs from 'fs';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false, 
    slowMo: 50,
    defaultViewport: { width: 1920, height: 1080 }
  });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', error => console.log('❌ ERROR:', error.message));

  const analysis = {
    timestamp: new Date().toISOString(),
    views: {}
  };

  try {
    console.log('🔍 DEEP UX ANALYSIS - SOI KỸ APP THỰC TẾ\n');
    
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });
    await wait(2000);
    console.log('✅ App loaded\n');

    // ==================== DASHBOARD ====================
    console.log('📊 ANALYZING DASHBOARD...');
    await page.screenshot({ path: 'analysis-dashboard.png', fullPage: true });
    
    const dashboardData = await page.evaluate(() => {
      const stats = Array.from(document.querySelectorAll('.bg-white.rounded-lg')).map(card => ({
        text: card.textContent.trim().substring(0, 100)
      }));
      
      const buttons = Array.from(document.querySelectorAll('button')).map(btn => ({
        text: btn.textContent.trim(),
        classes: btn.className
      }));
      
      const hasRecommendations = document.body.textContent.includes('AI Recommendations') ||
                                  document.body.textContent.includes('Critical Path');
      
      return {
        stats: stats.length,
        buttons: buttons.filter(b => b.text.includes('View all')).length,
        hasRecommendations,
        bodyPreview: document.body.textContent.substring(0, 500)
      };
    });
    
    analysis.views.dashboard = {
      ...dashboardData,
      screenshot: 'analysis-dashboard.png',
      findings: []
    };
    
    if (dashboardData.stats === 0) {
      analysis.views.dashboard.findings.push('❌ No stat cards rendered');
    }
    if (!dashboardData.hasRecommendations) {
      analysis.views.dashboard.findings.push('⚠️ No AI recommendations visible');
    }
    
    console.log(`  Stats cards: ${dashboardData.stats}`);
    console.log(`  View all buttons: ${dashboardData.buttons}`);
    console.log(`  Has recommendations: ${dashboardData.hasRecommendations}`);
    console.log(`  Findings: ${analysis.views.dashboard.findings.length}\n`);

    // ==================== LIST VIEW ====================
    console.log('📋 ANALYZING LIST VIEW...');
    await page.click('text/Tasks');
    await wait(1000);
    await page.click('text/List');
    await wait(1500);
    await page.screenshot({ path: 'analysis-list.png', fullPage: true });
    
    const listData = await page.evaluate(() => {
      const filters = document.querySelectorAll('select').length;
      const searchBox = document.querySelector('input[placeholder*="Search"]');
      const taskCards = document.querySelectorAll('.cursor-pointer');
      
      // Check first task card details
      const firstCard = taskCards[0];
      const cardHTML = firstCard?.innerHTML || '';
      const hasBlockedBadge = cardHTML.includes('BLOCKED');
      const hasProgress = cardHTML.includes('Progress') || cardHTML.includes('%');
      const hasCurrentStep = cardHTML.includes('current_step') || cardHTML.includes('⚡');
      
      // Check for Human/AI split
      const hasHumanTab = document.body.textContent.includes('Human Tasks');
      const hasAITab = document.body.textContent.includes('AI Agent Tasks');
      
      return {
        filters,
        hasSearchBox: !!searchBox,
        taskCards: taskCards.length,
        hasBlockedBadge,
        hasProgress,
        hasCurrentStep,
        hasHumanTab,
        hasAITab,
        firstCardPreview: cardHTML.substring(0, 200)
      };
    });
    
    analysis.views.list = {
      ...listData,
      screenshot: 'analysis-list.png',
      findings: []
    };
    
    if (!listData.hasSearchBox) analysis.views.list.findings.push('❌ No search box');
    if (listData.filters < 3) analysis.views.list.findings.push('⚠️ Missing filters');
    if (!listData.hasHumanTab) analysis.views.list.findings.push('❌ No Human/AI split');
    
    console.log(`  Filters: ${listData.filters}`);
    console.log(`  Search box: ${listData.hasSearchBox}`);
    console.log(`  Task cards: ${listData.taskCards}`);
    console.log(`  BLOCKED badge: ${listData.hasBlockedBadge}`);
    console.log(`  Progress tracking: ${listData.hasProgress}`);
    console.log(`  Human/AI tabs: ${listData.hasHumanTab && listData.hasAITab}\n`);

    // ==================== KANBAN VIEW ====================
    console.log('🎯 ANALYZING KANBAN VIEW...');
    await page.click('text/Board');
    await wait(1500);
    await page.screenshot({ path: 'analysis-kanban.png', fullPage: true });
    
    const kanbanData = await page.evaluate(() => {
      const columns = document.querySelectorAll('.flex-shrink-0.w-80');
      const filters = document.querySelectorAll('select').length;
      const searchBox = document.querySelector('input[placeholder*="Search"]');
      const taskCards = document.querySelectorAll('.bg-white.rounded-lg.border');
      
      const columnNames = Array.from(columns).map(col => {
        const header = col.querySelector('h3');
        return header?.textContent || 'Unknown';
      });
      
      // Check if cards are draggable
      const firstCard = taskCards[0];
      const isDraggable = firstCard?.getAttribute('draggable') === 'true';
      
      return {
        columns: columns.length,
        columnNames,
        filters,
        hasSearchBox: !!searchBox,
        taskCards: taskCards.length,
        isDraggable
      };
    });
    
    analysis.views.kanban = {
      ...kanbanData,
      screenshot: 'analysis-kanban.png',
      findings: []
    };
    
    if (!kanbanData.hasSearchBox) analysis.views.kanban.findings.push('❌ No search box');
    if (kanbanData.columns !== 3) analysis.views.kanban.findings.push('⚠️ Expected 3 columns (PENDING, IN_PROGRESS, DONE)');
    if (!kanbanData.isDraggable) analysis.views.kanban.findings.push('❌ Cards not draggable');
    
    console.log(`  Columns: ${kanbanData.columns} - ${kanbanData.columnNames.join(', ')}`);
    console.log(`  Filters: ${kanbanData.filters}`);
    console.log(`  Search box: ${kanbanData.hasSearchBox}`);
    console.log(`  Task cards: ${kanbanData.taskCards}`);
    console.log(`  Draggable: ${kanbanData.isDraggable}\n`);

    // ==================== GANTT VIEW ====================
    console.log('📊 ANALYZING GANTT VIEW...');
    await page.click('text/Gantt');
    await wait(2000);
    await page.screenshot({ path: 'analysis-gantt.png', fullPage: true });
    
    const ganttData = await page.evaluate(() => {
      const taskBars = document.querySelectorAll('.bg-brand-primary.rounded-md');
      const criticalPathToggle = document.querySelector('input[type="checkbox"]');
      const phaseHeaders = document.querySelectorAll('.font-bold.text-lg');
      const arrows = document.querySelectorAll('svg[class*="arrow"]');
      
      // Check for timeline
      const hasTimeline = document.body.textContent.includes('Week') || 
                         document.body.textContent.includes('Month');
      
      // Check zoom controls
      const hasZoom = document.body.textContent.includes('%') &&
                     (document.body.textContent.includes('+') || document.body.textContent.includes('-'));
      
      return {
        taskBars: taskBars.length,
        hasCriticalPath: !!criticalPathToggle,
        phaseHeaders: phaseHeaders.length,
        arrows: arrows.length,
        hasTimeline,
        hasZoom
      };
    });
    
    analysis.views.gantt = {
      ...ganttData,
      screenshot: 'analysis-gantt.png',
      findings: []
    };
    
    if (ganttData.taskBars === 0) analysis.views.gantt.findings.push('❌ No task bars rendered');
    if (!ganttData.hasCriticalPath) analysis.views.gantt.findings.push('⚠️ No Critical Path toggle');
    if (!ganttData.hasTimeline) analysis.views.gantt.findings.push('❌ No timeline visible');
    
    console.log(`  Task bars: ${ganttData.taskBars}`);
    console.log(`  Critical Path toggle: ${ganttData.hasCriticalPath}`);
    console.log(`  Phase headers: ${ganttData.phaseHeaders}`);
    console.log(`  Dependency arrows: ${ganttData.arrows}`);
    console.log(`  Timeline: ${ganttData.hasTimeline}`);
    console.log(`  Zoom controls: ${ganttData.hasZoom}\n`);

    // ==================== TIMELINE VIEW ====================
    console.log('⏱️ ANALYZING TIMELINE VIEW...');
    await page.click('text/Timeline');
    await wait(2000);
    await page.screenshot({ path: 'analysis-timeline.png', fullPage: true });
    
    const timelineData = await page.evaluate(() => {
      const phaseCards = document.querySelectorAll('.bg-background-secondary.rounded-xl');
      const filters = document.querySelectorAll('select').length;
      const searchBox = document.querySelector('input[placeholder*="Search"]');
      const expandIcons = document.querySelectorAll('svg'); // ChevronDown/Right
      
      // Check if phases are expanded
      const taskLists = document.querySelectorAll('.space-y-2');
      const visibleTasks = document.querySelectorAll('.hover\\:bg-background-tertiary');
      
      // Check for progress bars
      const progressBars = document.querySelectorAll('.bg-blue-500, .bg-green-500');
      
      return {
        phaseCards: phaseCards.length,
        filters,
        hasSearchBox: !!searchBox,
        expandIcons: expandIcons.length,
        visibleTasks: visibleTasks.length,
        progressBars: progressBars.length
      };
    });
    
    analysis.views.timeline = {
      ...timelineData,
      screenshot: 'analysis-timeline.png',
      findings: []
    };
    
    if (!timelineData.hasSearchBox) analysis.views.timeline.findings.push('❌ No search box');
    if (timelineData.visibleTasks === 0) analysis.views.timeline.findings.push('⚠️ No tasks visible (phases collapsed?)');
    if (timelineData.progressBars === 0) analysis.views.timeline.findings.push('⚠️ No progress bars');
    
    console.log(`  Phase cards: ${timelineData.phaseCards}`);
    console.log(`  Filters: ${timelineData.filters}`);
    console.log(`  Search box: ${timelineData.hasSearchBox}`);
    console.log(`  Visible tasks: ${timelineData.visibleTasks}`);
    console.log(`  Progress bars: ${timelineData.progressBars}\n`);

    // ==================== SPRINT VIEW ====================
    console.log('⚡ ANALYZING SPRINT VIEW...');
    await page.click('text/Sprint');
    await wait(2500);
    await page.screenshot({ path: 'analysis-sprint.png', fullPage: true });
    
    const sprintData = await page.evaluate(() => {
      const hasAISuggestions = document.body.textContent.includes('AI Sprint Suggestion');
      const hasVelocity = document.body.textContent.includes('Velocity') || 
                         document.body.textContent.includes('tasks/sprint');
      const hasCapacity = document.body.textContent.includes('Capacity');
      
      const backlogCards = document.querySelectorAll('.bg-white.rounded-lg.border');
      const sprintCards = document.querySelectorAll('.bg-blue-50');
      
      // Check for sprint info
      const hasSprints = document.body.textContent.includes('Sprint 1') ||
                        document.body.textContent.includes('Sprint Planning');
      
      return {
        hasAISuggestions,
        hasVelocity,
        hasCapacity,
        backlogCards: backlogCards.length,
        sprintCards: sprintCards.length,
        hasSprints
      };
    });
    
    analysis.views.sprint = {
      ...sprintData,
      screenshot: 'analysis-sprint.png',
      findings: []
    };
    
    if (!sprintData.hasAISuggestions) analysis.views.sprint.findings.push('❌ No AI Suggestions');
    if (!sprintData.hasVelocity) analysis.views.sprint.findings.push('⚠️ No velocity calculation');
    if (sprintData.backlogCards === 0) analysis.views.sprint.findings.push('⚠️ No backlog tasks');
    
    console.log(`  AI Suggestions: ${sprintData.hasAISuggestions}`);
    console.log(`  Velocity tracking: ${sprintData.hasVelocity}`);
    console.log(`  Capacity tracking: ${sprintData.hasCapacity}`);
    console.log(`  Backlog cards: ${sprintData.backlogCards}`);
    console.log(`  Sprint cards: ${sprintData.sprintCards}\n`);

    // ==================== ANALYTICS VIEW ====================
    console.log('📈 ANALYZING ANALYTICS VIEW...');
    await page.click('text/Analytics');
    await wait(2000);
    await page.screenshot({ path: 'analysis-analytics.png', fullPage: true });
    
    const analyticsData = await page.evaluate(() => {
      const hasRecommendations = document.body.textContent.includes('Recommended Tasks') ||
                                 document.body.textContent.includes('DO FIRST');
      const hasRisks = document.body.textContent.includes('Risk') ||
                      document.body.textContent.includes('BLOCKED');
      const hasProgress = document.body.textContent.includes('Progress') ||
                         document.body.textContent.includes('%');
      
      const taskCards = document.querySelectorAll('.cursor-pointer');
      
      return {
        hasRecommendations,
        hasRisks,
        hasProgress,
        taskCards: taskCards.length
      };
    });
    
    analysis.views.analytics = {
      ...analyticsData,
      screenshot: 'analysis-analytics.png',
      findings: []
    };
    
    if (!analyticsData.hasRecommendations) analysis.views.analytics.findings.push('⚠️ No recommendations');
    if (analyticsData.taskCards === 0) analysis.views.analytics.findings.push('❌ No task cards');
    
    console.log(`  Recommendations: ${analyticsData.hasRecommendations}`);
    console.log(`  Risk tracking: ${analyticsData.hasRisks}`);
    console.log(`  Progress tracking: ${analyticsData.hasProgress}`);
    console.log(`  Task cards: ${analyticsData.taskCards}\n`);

    // ==================== FINAL REPORT ====================
    console.log('='.repeat(70));
    console.log('📋 DEEP UX ANALYSIS SUMMARY');
    console.log('='.repeat(70));
    
    let totalFindings = 0;
    for (const [view, data] of Object.entries(analysis.views)) {
      console.log(`\n${view.toUpperCase()}:`);
      console.log(`  Screenshot: ${data.screenshot}`);
      if (data.findings.length > 0) {
        console.log(`  Issues (${data.findings.length}):`);
        data.findings.forEach(f => console.log(`    ${f}`));
        totalFindings += data.findings.length;
      } else {
        console.log(`  ✅ No issues found`);
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log(`TOTAL ISSUES: ${totalFindings}`);
    console.log('='.repeat(70));
    
    // Save analysis to JSON
    fs.writeFileSync('ux-analysis-report.json', JSON.stringify(analysis, null, 2));
    console.log('\n📄 Full report saved: ux-analysis-report.json');
    console.log('📸 Screenshots saved: analysis-*.png\n');

  } catch (error) {
    console.error('\n❌ Analysis failed:', error.message);
    await page.screenshot({ path: 'analysis-error.png', fullPage: true });
  } finally {
    await wait(2000);
    await browser.close();
  }
})();
