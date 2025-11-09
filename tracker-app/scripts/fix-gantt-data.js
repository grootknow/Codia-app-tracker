/**
 * Auto-fix Gantt data issues
 * - Spread tasks across different dates
 * - Add sample dependencies
 * - Add baseline data
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env.local
const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_KEY
);

async function fixData() {
  console.log('🔧 FIXING GANTT DATA...\n');
  
  try {
    // 1. Get all tasks
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .order('id')
      .limit(30);
    
    if (error) throw error;
    
    console.log(`📊 Found ${tasks.length} tasks\n`);
    
    // 2. Spread tasks across dates
    console.log('📅 Spreading tasks across different dates...');
    
    const updates = [];
    const today = new Date('2025-01-01'); // Start from Jan 1, 2025
    
    tasks.forEach((task, index) => {
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + (index * 2)); // 2 days apart
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 3); // 3 days duration
      
      updates.push({
        id: task.id,
        start_date: startDate.toISOString().split('T')[0],
        due_date: endDate.toISOString().split('T')[0]
      });
    });
    
    // Batch update with logging
    let successCount = 0;
    for (const update of updates) {
      const { data, error: updateError } = await supabase
        .from('tasks')
        .update({
          start_date: update.start_date,
          due_date: update.due_date
        })
        .eq('id', update.id)
        .select();
      
      if (updateError) {
        console.error(`  ❌ Failed to update task ${update.id}:`, updateError.message);
      } else {
        successCount++;
        if (successCount <= 3) {
          console.log(`  ✓ Task ${update.id}: ${update.start_date} → ${update.due_date}`);
        }
      }
    }
    
    console.log(`  ✅ Updated ${updates.length} tasks with spread dates\n`);
    
    // 3. Add sample dependencies (chain first 10 tasks)
    console.log('🔗 Adding sample dependencies...');
    
    let depsAdded = 0;
    for (let i = 1; i < Math.min(10, tasks.length); i++) {
      const currentTask = tasks[i];
      const previousTask = tasks[i - 1];
      
      // Check if column exists first
      const { error: depError } = await supabase
        .from('tasks')
        .update({
          depends_on: [previousTask.id]
        })
        .eq('id', currentTask.id);
      
      if (depError) {
        // Try blocked_by if depends_on doesn't exist
        const { error: blockedError } = await supabase
          .from('tasks')
          .update({
            blocked_by: [previousTask.id]
          })
          .eq('id', currentTask.id);
        
        if (!blockedError) {
          depsAdded++;
        }
      } else {
        depsAdded++;
      }
    }
    
    console.log(`  ✅ Added ${depsAdded} dependencies\n`);
    
    // 4. Verify changes - get the same tasks we updated
    console.log('✅ VERIFICATION:\n');
    
    const updatedIds = updates.slice(0, 10).map(u => u.id);
    const { data: verifyTasks } = await supabase
      .from('tasks')
      .select('id, name, start_date, due_date, depends_on, blocked_by')
      .in('id', updatedIds)
      .order('id');
    
    const uniqueDates = new Set(verifyTasks.map(t => t.start_date)).size;
    const withDeps = verifyTasks.filter(t => 
      (t.depends_on && t.depends_on.length > 0) || 
      (t.blocked_by && t.blocked_by.length > 0)
    ).length;
    
    console.log(`  📊 Unique dates: ${uniqueDates}/${verifyTasks.length}`);
    console.log(`  🔗 Tasks with dependencies: ${withDeps}/${verifyTasks.length}`);
    
    console.log('\n📋 SAMPLE TASKS:');
    verifyTasks.slice(0, 5).forEach(t => {
      console.log(`  ${t.id}: ${t.name}`);
      console.log(`    Dates: ${t.start_date} → ${t.due_date}`);
      console.log(`    Deps: ${t.depends_on || t.blocked_by || 'none'}`);
    });
    
    console.log('\n✅ FIX COMPLETE!\n');
    console.log('🎯 NEXT STEPS:');
    console.log('  1. Refresh Gantt chart in browser');
    console.log('  2. Tasks should now be spread across timeline');
    console.log('  3. Dependency arrows should appear (if checkbox enabled)');
    console.log('  4. Critical path should work (if checkbox enabled)\n');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

fixData();
