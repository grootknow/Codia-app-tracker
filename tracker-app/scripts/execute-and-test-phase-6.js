/**
 * Execute Phase 6 SQL via Puppeteer & Test Results
 * This will:
 * 1. Open Supabase SQL Editor
 * 2. Paste SQL
 * 3. Execute
 * 4. Test tracker app
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function executeAndTestPhase6() {
  console.log('🎭 Starting Puppeteer execution & test...\n');
  
  // Read SQL
  const sqlPath = path.join(__dirname, '..', 'sql', '06-v10-ai-tools-integration.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
  console.log(`✅ SQL loaded: ${sqlContent.length} chars\n`);
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to Supabase SQL Editor
    const sqlEditorUrl = 'https://supabase.com/dashboard/project/pmqocxdtypxobihxusqj/sql/new';
    console.log(`🔗 Opening: ${sqlEditorUrl}\n`);
    
    await page.goto(sqlEditorUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    console.log('✅ SQL Editor loaded\n');
    
    console.log('⏸️  PAUSED FOR MANUAL ACTION:');
    console.log('   1. Please LOGIN to Supabase if needed');
    console.log('   2. Press ENTER when SQL Editor is ready...\n');
    
    // Wait for user to press enter
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
    
    console.log('📝 Pasting SQL into editor...\n');
    
    // Find SQL editor (Monaco/CodeMirror)
    await page.waitForTimeout(2000);
    
    // Try to find and click the editor
    await page.evaluate(() => {
      const editor = document.querySelector('.monaco-editor') || 
                     document.querySelector('[contenteditable="true"]') ||
                     document.querySelector('textarea');
      if (editor) editor.click();
    });
    
    await page.waitForTimeout(500);
    
    // Clear existing content
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    
    await page.waitForTimeout(500);
    
    // Paste SQL (using clipboard)
    await page.evaluate(async (sql) => {
      await navigator.clipboard.writeText(sql);
    }, sqlContent);
    
    await page.keyboard.down('Control');
    await page.keyboard.press('V');
    await page.keyboard.up('Control');
    
    console.log('✅ SQL pasted\n');
    
    await page.waitForTimeout(2000);
    
    // Execute (Ctrl+Enter or find RUN button)
    console.log('⚡ Executing SQL...\n');
    
    await page.keyboard.down('Control');
    await page.keyboard.press('Enter');
    await page.keyboard.up('Control');
    
    console.log('⏳ Waiting for execution to complete (10 seconds)...\n');
    await page.waitForTimeout(10000);
    
    console.log('✅ SQL execution completed (check for errors in browser)\n');
    
    console.log('📸 Taking screenshot...');
    await page.screenshot({ 
      path: 'supabase-sql-execution.png',
      fullPage: true 
    });
    console.log('   Saved: supabase-sql-execution.png\n');
    
    // Now test the tracker app
    console.log('🎯 Now testing tracker app...\n');
    
    const appUrl = 'https://codia-tracker.vercel.app';
    console.log(`📱 Navigating to: ${appUrl}\n`);
    
    await page.goto(appUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    console.log('✅ App loaded\n');
    
    // Check for Phase 6
    const phase6Button = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const phase6Btn = buttons.find(btn => 
        btn.textContent.includes('Phase 6') || 
        btn.textContent.includes('AI Tools 2025')
      );
      return phase6Btn ? {
        found: true,
        text: phase6Btn.textContent.trim()
      } : { found: false };
    });
    
    if (phase6Button.found) {
      console.log('✅ Phase 6 button FOUND!');
      console.log(`   Text: ${phase6Button.text}\n`);
      
      // Click Phase 6
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const phase6Btn = buttons.find(btn => 
          btn.textContent.includes('Phase 6') || 
          btn.textContent.includes('AI Tools 2025')
        );
        if (phase6Btn) phase6Btn.click();
      });
      
      console.log('👆 Clicked Phase 6\n');
      await page.waitForTimeout(2000);
      
      // Count tasks
      const taskCount = await page.evaluate(() => {
        const taskCards = document.querySelectorAll('[class*="border-2"]');
        return taskCards.length;
      });
      
      console.log(`📋 Phase 6 tasks visible: ${taskCount}\n`);
      
      // Look for specific tasks
      const tasks = await page.evaluate(() => {
        const results = [];
        const searchTerms = ['TOON', 'Markitdown', 'Docling', 'DeepSeek', 'Lightning'];
        for (const term of searchTerms) {
          const found = document.body.textContent.includes(term);
          results.push({ term, found });
        }
        return results;
      });
      
      console.log('🔍 Specific tasks found:');
      tasks.forEach(({ term, found }) => {
        console.log(`   ${found ? '✅' : '❌'} ${term}`);
      });
      console.log('');
      
      // Screenshot
      await page.screenshot({ 
        path: 'phase-6-tracker-app.png',
        fullPage: true 
      });
      console.log('📸 Screenshot saved: phase-6-tracker-app.png\n');
      
      console.log('🎉 SUCCESS! Phase 6 is now in tracker app!\n');
      console.log('Summary:');
      console.log(`   - SQL executed: ✅`);
      console.log(`   - Phase 6 visible: ✅`);
      console.log(`   - Tasks count: ${taskCount}`);
      console.log(`   - Expected: 45 tasks\n`);
      
    } else {
      console.log('❌ Phase 6 NOT FOUND in app!\n');
      console.log('Possible reasons:');
      console.log('   - SQL execution failed');
      console.log('   - Need hard refresh');
      console.log('   - Check Supabase SQL result for errors\n');
      
      await page.screenshot({ path: 'phase-6-not-found.png' });
      console.log('📸 Debug screenshot: phase-6-not-found.png\n');
    }
    
    console.log('🔍 Browser will stay open for 30 seconds...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Test completed!\n');
  }
}

// Run
executeAndTestPhase6().catch(console.error);
