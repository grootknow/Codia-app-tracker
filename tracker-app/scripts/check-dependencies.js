// Check dependencies in database
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pmqocxdtypxobihxusqj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtcW9jeGR0eXB4b2JpaHh1c3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDYwMjEsImV4cCI6MjA3MzcyMjAyMX0.32zS3ZG9Y7eRYPXZE2dfVIGd1NHGVThVYN-Y4UXx9O8'
);

async function checkDependencies() {
  console.log('🔍 Checking dependencies in database...\n');
  
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id, name, depends_on, blocked_by')
    .order('id');
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log(`📊 Total tasks: ${tasks.length}\n`);
  
  let hasDepends = 0;
  let hasBlocked = 0;
  
  tasks.forEach(task => {
    const deps = task.depends_on;
    const blocked = task.blocked_by;
    
    if (deps && deps.length > 0) {
      hasDepends++;
      console.log(`✅ Task ${task.id}: ${task.name}`);
      console.log(`   depends_on: ${JSON.stringify(deps)}`);
    }
    
    if (blocked && blocked.length > 0) {
      hasBlocked++;
      console.log(`   blocked_by: ${JSON.stringify(blocked)}`);
    }
  });
  
  console.log(`\n📈 Summary:`);
  console.log(`   Tasks with depends_on: ${hasDepends}`);
  console.log(`   Tasks with blocked_by: ${hasBlocked}`);
}

checkDependencies();
