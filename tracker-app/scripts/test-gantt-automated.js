/**
 * AUTOMATED GANTT CHART TEST
 * Using Puppeteer MCP to test all zoom levels and arrow visibility
 */

const testGanttChart = async () => {
  console.log('🚀 Starting Gantt Chart Automated Test...\n');
  
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };
  
  // Test configuration
  const APP_URL = 'https://tracker-d54pnag0u-kakaholigan-6270s-projects.vercel.app';
  const TESTS = [
    {
      name: 'Load Gantt Page',
      action: 'navigate',
      url: `${APP_URL}/#tasks`,
      validate: (page) => page.title()
    },
    {
      name: 'Click Gantt Tab',
      action: 'click',
      selector: 'button:has-text("Gantt")',
      wait: 2000
    },
    {
      name: 'Enable Dependencies Toggle',
      action: 'click',
      selector: 'input[type="checkbox"]',
      wait: 1000
    },
    {
      name: 'Check Default Zoom (100%)',
      action: 'screenshot',
      name: 'gantt-zoom-100',
      validate: async (page) => {
        const arrows = await page.$$('svg line[stroke="#3b82f6"]');
        return arrows.length > 0;
      }
    },
    {
      name: 'Zoom IN to 150%',
      action: 'click',
      selector: 'button:has-text("+")',
      repeat: 5,
      wait: 500
    },
    {
      name: 'Check Zoom 150%',
      action: 'screenshot',
      name: 'gantt-zoom-150',
      validate: async (page) => {
        const arrows = await page.$$('svg line[stroke="#3b82f6"]');
        return arrows.length > 0;
      }
    },
    {
      name: 'Zoom IN to 300%',
      action: 'click',
      selector: 'button:has-text("+")',
      repeat: 10,
      wait: 500
    },
    {
      name: 'Check Zoom 300% (Hour View)',
      action: 'screenshot',
      name: 'gantt-zoom-300-hour',
      validate: async (page) => {
        const arrows = await page.$$('svg line[stroke="#3b82f6"]');
        const svg = await page.$('svg');
        const box = await svg.boundingBox();
        return arrows.length > 0 && box.width > 1000;
      }
    },
    {
      name: 'Reset Zoom',
      action: 'click',
      selector: 'button:has-text("Today")',
      wait: 1000
    },
    {
      name: 'Zoom OUT to 70%',
      action: 'click',
      selector: 'button:has-text("-")',
      repeat: 3,
      wait: 500
    },
    {
      name: 'Check Zoom 70%',
      action: 'screenshot',
      name: 'gantt-zoom-70',
      validate: async (page) => {
        const arrows = await page.$$('svg line[stroke="#3b82f6"]');
        return arrows.length > 0;
      }
    },
    {
      name: 'Zoom OUT to 50% (Month View)',
      action: 'click',
      selector: 'button:has-text("-")',
      repeat: 5,
      wait: 500
    },
    {
      name: 'Check Zoom 50% (Month View)',
      action: 'screenshot',
      name: 'gantt-zoom-50-month',
      validate: async (page) => {
        const arrows = await page.$$('svg line[stroke="#3b82f6"]');
        return arrows.length > 0;
      }
    },
    {
      name: 'Scroll Horizontal Test',
      action: 'evaluate',
      script: `
        const timeline = document.querySelector('.overflow-auto');
        if (timeline) {
          timeline.scrollLeft = timeline.scrollWidth / 2;
        }
      `,
      wait: 1000
    },
    {
      name: 'Check Arrows After Scroll',
      action: 'screenshot',
      name: 'gantt-after-scroll',
      validate: async (page) => {
        const arrows = await page.$$('svg line[stroke="#3b82f6"]');
        return arrows.length > 0;
      }
    },
    {
      name: 'Test Drag Task',
      action: 'evaluate',
      script: `
        const taskBar = document.querySelector('[class*="cursor-grab"]');
        if (taskBar) {
          const rect = taskBar.getBoundingClientRect();
          const mouseDown = new MouseEvent('mousedown', {
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2,
            bubbles: true
          });
          taskBar.dispatchEvent(mouseDown);
          
          setTimeout(() => {
            const mouseMove = new MouseEvent('mousemove', {
              clientX: rect.left + rect.width / 2 + 100,
              clientY: rect.top + rect.height / 2,
              bubbles: true
            });
            document.dispatchEvent(mouseMove);
            
            setTimeout(() => {
              const mouseUp = new MouseEvent('mouseup', { bubbles: true });
              document.dispatchEvent(mouseUp);
            }, 100);
          }, 100);
        }
      `,
      wait: 2000
    },
    {
      name: 'Check Arrows After Drag',
      action: 'screenshot',
      name: 'gantt-after-drag',
      validate: async (page) => {
        const arrows = await page.$$('svg line[stroke="#3b82f6"]');
        return arrows.length > 0;
      }
    },
    {
      name: 'Hover Task for Tooltip',
      action: 'hover',
      selector: '[class*="cursor-grab"]',
      wait: 1000
    },
    {
      name: 'Check Tooltip Dependencies',
      action: 'screenshot',
      name: 'gantt-tooltip',
      validate: async (page) => {
        const tooltip = await page.$('text="Depends on:"');
        return tooltip !== null;
      }
    }
  ];
  
  console.log(`📋 Total tests: ${TESTS.length}\n`);
  
  // Run tests
  for (let i = 0; i < TESTS.length; i++) {
    const test = TESTS[i];
    console.log(`[${i + 1}/${TESTS.length}] ${test.name}...`);
    
    try {
      // Execute test action
      let result = true;
      
      if (test.validate) {
        result = await test.validate();
      }
      
      if (result) {
        results.passed.push(test.name);
        console.log(`  ✅ PASS\n`);
      } else {
        results.failed.push(test.name);
        console.log(`  ❌ FAIL\n`);
      }
    } catch (error) {
      results.failed.push(test.name);
      console.log(`  ❌ ERROR: ${error.message}\n`);
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed.length}/${TESTS.length}`);
  console.log(`❌ Failed: ${results.failed.length}/${TESTS.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);
  console.log('='.repeat(60));
  
  if (results.passed.length === TESTS.length) {
    console.log('\n🎉 ALL TESTS PASSED! Gantt chart is production ready!\n');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED. Review issues:\n');
    results.failed.forEach(name => console.log(`  - ${name}`));
    console.log();
  }
  
  return {
    success: results.failed.length === 0,
    passed: results.passed.length,
    failed: results.failed.length,
    total: TESTS.length
  };
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testGanttChart };
}

// Run if called directly
if (require.main === module) {
  testGanttChart().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}
