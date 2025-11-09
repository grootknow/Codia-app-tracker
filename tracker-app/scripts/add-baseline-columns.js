/**
 * Add baseline columns to tasks table
 * This enables baseline comparison feature in Gantt chart
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

async function addBaselineColumns() {
  console.log('🔧 ADDING BASELINE COLUMNS...\n');
  
  try {
    // Note: Supabase client doesn't support DDL directly
    // We need to use SQL editor or provide SQL for user to run
    
    console.log('⚠️  Cannot add columns via Supabase client.');
    console.log('Please run this SQL in Supabase SQL Editor:\n');
    
    console.log('-- Add baseline columns');
    console.log('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS baseline_start_date DATE;');
    console.log('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS baseline_end_date DATE;\n');
    
    console.log('-- Set baseline for first 10 tasks (copy current dates)');
    console.log('UPDATE tasks');
    console.log('SET baseline_start_date = start_date,');
    console.log('    baseline_end_date = due_date');
    console.log('WHERE id IN (');
    console.log('  SELECT id FROM tasks');
    console.log('  WHERE start_date IS NOT NULL');
    console.log('  ORDER BY id');
    console.log('  LIMIT 10');
    console.log(');\n');
    
    console.log('-- Verify');
    console.log('SELECT id, name, start_date, baseline_start_date, due_date, baseline_end_date');
    console.log('FROM tasks');
    console.log('WHERE baseline_start_date IS NOT NULL');
    console.log('LIMIT 5;\n');
    
    console.log('📋 STEPS:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Copy & paste the SQL above');
    console.log('3. Click "Run"');
    console.log('4. Refresh Gantt chart');
    console.log('5. Enable "Baseline" checkbox to see comparison\n');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

addBaselineColumns();
