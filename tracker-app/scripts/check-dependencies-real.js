/**
 * COMPREHENSIVE DEPENDENCY CHECK
 * Check ALL dependency fields: depends_on, blocked_by, blocking_dependencies
 * Verify logic in code vs actual DB data
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

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_KEY);

async function checkDependencies() {
  console.log('🔍 COMPREHENSIVE DEPENDENCY CHECK\n');
  console.log('=' .repeat(60));
  
  try {
    // Get all tasks - first check what columns exist
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, name, start_date, due_date, depends_on, blocked_by, status')
      .order('id');
    
    if (error) throw error;
    
    console.log(`\n📊 Total tasks: ${tasks.length}\n`);
    
    // Analyze each dependency field
    const analysis = {
      depends_on: {
        exists: tasks[0]?.hasOwnProperty('depends_on'),
        count: 0,
        type: null,
        samples: []
      },
      blocked_by: {
        exists: tasks[0]?.hasOwnProperty('blocked_by'),
        count: 0,
        type: null,
        samples: []
      },
      blocking_dependencies: {
        exists: false, // We know it doesn't exist from error
        count: 0,
        type: null,
        samples: []
      }
    };
    
    // Count and sample
    tasks.forEach(task => {
      // depends_on
      if (task.depends_on) {
        analysis.depends_on.count++;
        if (analysis.depends_on.samples.length < 3) {
          analysis.depends_on.samples.push({
            id: task.id,
            name: task.name,
            value: task.depends_on,
            type: typeof task.depends_on
          });
          if (!analysis.depends_on.type) {
            analysis.depends_on.type = Array.isArray(task.depends_on) ? 'array' : typeof task.depends_on;
          }
        }
      }
      
      // blocked_by
      if (task.blocked_by) {
        analysis.blocked_by.count++;
        if (analysis.blocked_by.samples.length < 3) {
          analysis.blocked_by.samples.push({
            id: task.id,
            name: task.name,
            value: task.blocked_by,
            type: typeof task.blocked_by
          });
          if (!analysis.blocked_by.type) {
            analysis.blocked_by.type = Array.isArray(task.blocked_by) ? 'array' : typeof task.blocked_by;
          }
        }
      }
      
      // blocking_dependencies - skip, doesn't exist
    });
    
    // Report
    console.log('📋 FIELD ANALYSIS:\n');
    
    Object.entries(analysis).forEach(([field, data]) => {
      console.log(`${field}:`);
      console.log(`  Exists in schema: ${data.exists ? '✅ YES' : '❌ NO'}`);
      console.log(`  Tasks with data: ${data.count}/${tasks.length} (${Math.round(data.count/tasks.length*100)}%)`);
      console.log(`  Data type: ${data.type || 'N/A'}`);
      
      if (data.samples.length > 0) {
        console.log(`  Samples:`);
        data.samples.forEach(s => {
          console.log(`    - Task ${s.id} (${s.name}): ${JSON.stringify(s.value)} [${s.type}]`);
        });
      }
      console.log('');
    });
    
    // Check code logic
    console.log('=' .repeat(60));
    console.log('\n🔧 CODE LOGIC CHECK:\n');
    
    const codeLogic = `
Code currently supports (in order of priority):
1. blocking_dependencies (array)
2. depends_on (array or single ID)
3. blocked_by (array or single ID)

Function: getTaskDependencies(task)
- Returns array of dependency IDs
- Checks all 3 fields with fallback
`;
    
    console.log(codeLogic);
    
    // Recommendations
    console.log('=' .repeat(60));
    console.log('\n💡 RECOMMENDATIONS:\n');
    
    const hasAnyDeps = analysis.depends_on.count > 0 || 
                       analysis.blocked_by.count > 0 || 
                       analysis.blocking_dependencies.count > 0;
    
    if (!hasAnyDeps) {
      console.log('❌ CRITICAL: NO DEPENDENCIES IN DATABASE!');
      console.log('\nTo fix:');
      console.log('1. Run: node scripts/fix-gantt-data.js');
      console.log('   This will add sample dependencies to depends_on field');
      console.log('');
      console.log('2. Or manually add via SQL:');
      console.log('   UPDATE tasks SET depends_on = 1 WHERE id = 2;');
      console.log('   UPDATE tasks SET depends_on = 2 WHERE id = 3;');
    } else {
      console.log('✅ Dependencies found in database');
      
      // Check which field is most used
      const mostUsed = Object.entries(analysis)
        .sort((a, b) => b[1].count - a[1].count)[0];
      
      console.log(`\nMost used field: ${mostUsed[0]} (${mostUsed[1].count} tasks)`);
      console.log(`Data type: ${mostUsed[1].type}`);
      
      if (mostUsed[1].type === 'number') {
        console.log('\n⚠️  WARNING: Dependencies are stored as single IDs (number)');
        console.log('   Code expects arrays for multiple dependencies');
        console.log('   This will work but limits to 1 dependency per task');
      }
      
      if (mostUsed[0] !== 'blocking_dependencies') {
        console.log(`\n💡 SUGGESTION: Code prioritizes blocking_dependencies`);
        console.log(`   But DB uses ${mostUsed[0]}`);
        console.log(`   Consider migrating data to blocking_dependencies for consistency`);
      }
    }
    
    // Test dependency chain
    console.log('\n' + '='.repeat(60));
    console.log('\n🔗 DEPENDENCY CHAIN TEST:\n');
    
    const tasksWithDeps = tasks.filter(t => 
      t.depends_on || t.blocked_by || t.blocking_dependencies
    );
    
    if (tasksWithDeps.length > 0) {
      console.log('Found dependency chains:');
      tasksWithDeps.slice(0, 5).forEach(task => {
        const deps = task.blocking_dependencies || task.depends_on || task.blocked_by;
        const depIds = Array.isArray(deps) ? deps : [deps];
        const depTasks = tasks.filter(t => depIds.includes(t.id));
        
        console.log(`\n  Task ${task.id}: ${task.name}`);
        console.log(`  Depends on: ${JSON.stringify(deps)}`);
        depTasks.forEach(dt => {
          console.log(`    → Task ${dt.id}: ${dt.name} (${dt.start_date} to ${dt.due_date})`);
        });
        console.log(`  Current dates: ${task.start_date} to ${task.due_date}`);
        
        // Check if dates are valid
        if (depTasks.length > 0 && task.start_date && depTasks[0].due_date) {
          const taskStart = new Date(task.start_date);
          const depEnd = new Date(depTasks[0].due_date);
          if (taskStart < depEnd) {
            console.log(`  ❌ INVALID: Task starts BEFORE dependency ends!`);
          } else {
            console.log(`  ✅ VALID: Task starts after dependency`);
          }
        }
      });
    } else {
      console.log('❌ No dependency chains found');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ CHECK COMPLETE!\n');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkDependencies();
