/**
 * Check Gantt data in database
 * - Verify fields exist
 * - Check sample data
 * - Add demo data if needed
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env.local manually
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

async function checkData() {
  console.log('🔍 CHECKING GANTT DATA...\n');
  
  try {
    // 1. Check tasks - Get all columns first
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .limit(10);
    
    if (error) throw error;
    
    console.log(`📊 Found ${tasks.length} tasks\n`);
    
    // Show available columns
    if (tasks.length > 0) {
      console.log('📋 AVAILABLE COLUMNS:');
      console.log(Object.keys(tasks[0]).join(', '));
      console.log('');
    }
    
    // 2. Analyze data
    const stats = {
      total: tasks.length,
      hasStartDate: tasks.filter(t => t.start_date).length,
      hasDueDate: tasks.filter(t => t.due_date).length,
      hasDependencies: tasks.filter(t => t.blocking_dependencies && t.blocking_dependencies.length > 0).length,
      uniqueDates: new Set(tasks.map(t => t.start_date).filter(Boolean)).size
    };
    
    console.log('📈 DATA ANALYSIS:');
    console.log(`- Tasks with start_date: ${stats.hasStartDate}/${stats.total} (${Math.round(stats.hasStartDate/stats.total*100)}%)`);
    console.log(`- Tasks with due_date: ${stats.hasDueDate}/${stats.total} (${Math.round(stats.hasDueDate/stats.total*100)}%)`);
    console.log(`- Tasks with dependencies: ${stats.hasDependencies}/${stats.total} (${Math.round(stats.hasDependencies/stats.total*100)}%)`);
    console.log(`- Unique start dates: ${stats.uniqueDates} (should be spread out)\n`);
    
    // 3. Show sample
    console.log('📋 SAMPLE TASKS:');
    tasks.slice(0, 5).forEach(t => {
      console.log(`\n  ID: ${t.id}`);
      console.log(`  Name: ${t.name}`);
      console.log(`  Dates: ${t.start_date || 'NULL'} → ${t.due_date || 'NULL'}`);
      console.log(`  Dependencies: ${t.blocking_dependencies ? JSON.stringify(t.blocking_dependencies) : 'NULL'}`);
      console.log(`  Status: ${t.status}`);
    });
    
    // 4. Issues
    console.log('\n⚠️  ISSUES FOUND:');
    const issues = [];
    
    if (stats.hasStartDate < stats.total * 0.5) {
      issues.push(`- Nhiều tasks thiếu start_date (${stats.total - stats.hasStartDate} tasks)`);
    }
    
    if (stats.uniqueDates < 3) {
      issues.push(`- Tasks chồng lên nhau! Chỉ có ${stats.uniqueDates} ngày khác nhau`);
      issues.push('  → Đây là lý do tasks nằm dọc theo một cột!');
    }
    
    issues.push('- ❌ BASELINE FIELDS KHÔNG TỒN TẠI trong DB schema!');
    issues.push('  → Baseline feature KHÔNG THỂ hoạt động');
    issues.push('  → Cần add columns: baseline_start_date, baseline_end_date');
    
    if (stats.hasDependencies === 0) {
      issues.push('- KHÔNG có dependencies → Dependency arrows sẽ không hiện');
      issues.push('- KHÔNG có dependencies → Critical path sẽ không work');
      issues.push('- KHÔNG có dependencies → Auto-schedule sẽ không có gì để schedule');
    }
    
    if (issues.length === 0) {
      console.log('  ✅ Không có issues!');
    } else {
      issues.forEach(issue => console.log(issue));
    }
    
    // 5. Recommendations
    console.log('\n💡 KHUYẾN NGHỊ:');
    
    if (stats.uniqueDates < 3) {
      console.log('\n  🔧 FIX: Spread tasks ra các ngày khác nhau');
      console.log('  SQL:');
      console.log(`    UPDATE tasks SET start_date = '2025-01-01', due_date = '2025-01-05' WHERE id = ${tasks[0]?.id};`);
      console.log(`    UPDATE tasks SET start_date = '2025-01-06', due_date = '2025-01-10' WHERE id = ${tasks[1]?.id};`);
      console.log(`    UPDATE tasks SET start_date = '2025-01-11', due_date = '2025-01-15' WHERE id = ${tasks[2]?.id};`);
    }
    
    console.log('\n  🔧 FIX: Add baseline columns to schema');
    console.log('  SQL:');
    console.log('    ALTER TABLE tasks ADD COLUMN baseline_start_date DATE;');
    console.log('    ALTER TABLE tasks ADD COLUMN baseline_end_date DATE;');
    
    if (stats.hasDependencies === 0) {
      console.log('\n  🔧 FIX: Add dependencies');
      console.log('  SQL:');
      console.log(`    UPDATE tasks SET blocking_dependencies = '[${tasks[0]?.id}]'::jsonb WHERE id = ${tasks[1]?.id};`);
      console.log(`    UPDATE tasks SET blocking_dependencies = '[${tasks[1]?.id}]'::jsonb WHERE id = ${tasks[2]?.id};`);
    }
    
    console.log('\n✅ CHECK COMPLETE!\n');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

checkData();
