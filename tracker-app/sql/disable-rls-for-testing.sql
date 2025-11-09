-- Temporarily disable RLS for testing
-- WARNING: Only for development! Re-enable for production

-- Disable RLS on tasks table
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- Disable RLS on phases table
ALTER TABLE phases DISABLE ROW LEVEL SECURITY;

-- Grant public access (for testing only)
GRANT ALL ON tasks TO anon;
GRANT ALL ON phases TO anon;
GRANT ALL ON tasks TO authenticated;
GRANT ALL ON phases TO authenticated;

-- Verify
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tasks', 'phases');
