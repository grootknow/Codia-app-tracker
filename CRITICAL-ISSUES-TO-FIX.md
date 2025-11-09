# 🔴 CRITICAL ISSUES - MUST FIX BEFORE PRODUCTION

## 1. CORS ERROR (BLOCKING)
**Error:** `Access-Control-Allow-Origin header is present`
**Cause:** Supabase RLS (Row Level Security) blocking requests
**Fix:** Run SQL in Supabase SQL Editor:

```sql
-- Disable RLS for testing
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE phases DISABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON tasks TO anon, authenticated;
GRANT ALL ON phases TO anon, authenticated;
```

**File:** `tracker-app/sql/disable-rls-for-testing.sql`

---

## 2. MONTH VIEW UNUSABLE
**Problem:** Bars quá nhỏ, không thấy gì
**Root Cause:** `dayWidth` quá nhỏ ở month view
**Current:** dayWidth = 40px * zoomLevel
**Need:** dayWidth phải scale theo view mode

**Fix Required:**
```javascript
const baseDayWidth = useMemo(() => {
  switch (viewMode) {
    case 'hour': return 200; // 200px per day for hour view
    case 'day': return 40;   // 40px per day
    case 'week': return 20;  // 20px per day  
    case 'month': return 10; // 10px per day
    default: return 40;
  }
}, [viewMode]);

const dayWidth = baseDayWidth * zoomLevel;
```

---

## 3. NO HOUR VIEW
**Problem:** Hour button added but no logic
**Need:** Render hours within each day

**Fix Required:**
- Add `renderTimelineHeaders()` case for 'hour'
- Show 24 hours per day
- Each hour = dayWidth / 24
- Grid lines every hour

---

## 4. NO MOUSE WHEEL ZOOM
**Problem:** Chỉ có slider, không zoom bằng chuột như Asana/Jira
**Need:** Ctrl + Mouse Wheel to zoom

**Fix Required:**
```javascript
useEffect(() => {
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel(prev => Math.max(0.5, Math.min(2, prev + delta)));
    }
  };
  
  timelineRef.current?.addEventListener('wheel', handleWheel, { passive: false });
  return () => timelineRef.current?.removeEventListener('wheel', handleWheel);
}, []);
```

---

## 5. DEPENDENCIES NOT REAL
**Problem:** Dependencies chỉ là visual, không enforce logic
**Current:** Arrows hiện nhưng không block/push tasks
**Need:** 
- Task B cannot start until Task A finishes
- Moving Task A should auto-move Task B
- Deleting Task A should warn about Task B

**Fix Required:**
- Add validation in `updateTaskDates()`
- Check dependencies before allowing move
- Auto-cascade date changes
- Show warning dialogs

---

## 6. AUTO-SCHEDULE NOT SMART
**Problem:** Auto-schedule chỉ set dates, không respect working hours/weekends
**Need:**
- Skip weekends
- Respect working hours (8h/day)
- Handle resource conflicts
- Show Gantt conflicts

---

## 7. PERFORMANCE ISSUES
**Problem:** Lag with many tasks
**Current:** Re-renders everything on every change
**Need:**
- React.memo for task bars
- Virtualization for large task lists
- Debounce drag updates
- useMemo for calculations

---

## 🎯 PRIORITY FIX ORDER

### P0 (MUST FIX NOW):
1. ✅ CORS Error - Run SQL
2. ✅ Month view dayWidth scaling
3. ✅ Mouse wheel zoom

### P1 (BEFORE PRODUCTION):
4. Hour view implementation
5. Dependencies enforcement
6. Performance optimization

### P2 (NICE TO HAVE):
7. Smart auto-schedule
8. Weekend/holiday handling
9. Resource leveling

---

## 📝 IMMEDIATE ACTIONS

### For User (5 minutes):
1. Go to Supabase Dashboard
2. SQL Editor → New Query
3. Paste SQL from `sql/disable-rls-for-testing.sql`
4. Run
5. Refresh Gantt → CORS fixed

### For Developer (30 minutes):
1. Fix dayWidth scaling per view mode
2. Add mouse wheel zoom handler
3. Test all view modes
4. Commit + Deploy

---

## 🚨 CURRENT STATE

**Working:**
- ✅ Drag & drop (with optimistic updates)
- ✅ Resize (with validation)
- ✅ Toast notifications
- ✅ Remember last page
- ✅ Browser back/forward

**Broken:**
- ❌ CORS (blocks all updates)
- ❌ Month view (unusable)
- ❌ Hour view (not implemented)
- ❌ Mouse zoom (missing)
- ❌ Dependencies (visual only)

**Status:** NOT PRODUCTION READY

**ETA to fix:** 1-2 hours of focused work
