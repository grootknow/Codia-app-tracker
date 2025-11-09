# 🚨 CRITICAL ISSUES - NEXT SESSION

## ✅ FIXED: HOUR VIEW TAB + ARROW SCALING (Session Nov 10, 2025)

### What Was Fixed
1. **Hour View Tab Missing** - Added Hour button to view mode tabs
2. **Arrow Scaling** - Arrows now scale with zoom level (no more giant arrows at zoom out)
3. **Minute Precision** - Timeline shows 10-minute intervals at high zoom (>= 2.5)

### Technical Details
```javascript
// Arrow scaling based on zoom
const scaledWidth = Math.max(1, Math.min(baseWidth * zoomLevel, baseWidth * 2));
const arrowheadScale = Math.max(0.5, Math.min(zoomLevel, 1.5));

// View mode tabs now include Hour
<button onClick={() => setViewMode('hour')}>Hour</button>
```

**Production:** https://tracker-eciwwdiw2-kakaholigan-6270s-projects.vercel.app

---

## 🔴 GANTT DRAG STILL NOT SMOOTH - HOUR PRECISION BROKEN! (RESOLVED)

### Problem
**User tested extensively - drag vẫn theo NGÀY, không theo GIỜ!**
- Kéo task → Chỉ nhảy theo ngày
- Không mượt, không theo giờ/phút như mong muốn
- App Gantt phải smooth theo PHÚT, không phải ngày!

### Root Cause
**DATABASE SCHEMA ISSUE:**
```sql
-- Current schema:
start_date DATE  -- Only stores YYYY-MM-DD, no time!
due_date DATE    -- Only stores YYYY-MM-DD, no time!
```

**Code issue:**
```javascript
// We calculate hours correctly:
const newStartDate = new Date(originalStartDate.getTime() + deltaHours * 60 * 60 * 1000);

// But then format to DATE only:
format(newStartDate, 'yyyy-MM-dd')  // LOSES ALL TIME INFO!
```

### Solution Options

**Option 1: Change DB Schema (RECOMMENDED)**
```sql
-- Change to TIMESTAMP for hour precision:
ALTER TABLE tasks 
  ALTER COLUMN start_date TYPE TIMESTAMP,
  ALTER COLUMN due_date TYPE TIMESTAMP;

-- Then use full datetime format:
format(newStartDate, "yyyy-MM-dd'T'HH:mm:ss")
```

**Option 2: Store hours in separate column**
```sql
ALTER TABLE tasks 
  ADD COLUMN start_hour INTEGER DEFAULT 0,
  ADD COLUMN due_hour INTEGER DEFAULT 0;
```

**Option 3: Use estimated_hours for visual only**
- Keep DB as DATE
- Calculate visual position using estimated_hours
- Only save DATE on mouseup
- Visual shows smooth drag, but DB stores days

### Files to Change
1. `tracker-app/sql/` - Migration to change column types
2. `CustomGanttPro.jsx` - Update format strings
3. `supabase` schema - Update column types

### Test Checklist
- [ ] Drag task in Day view → Should move by HOURS
- [ ] Drag task in Hour view → Should move by MINUTES
- [ ] Save to DB → Should preserve time
- [ ] Reload page → Should show correct time
- [ ] Dependencies → Should work with time precision

---

## ⚠️ LESSON LEARNED: ALWAYS TEST LOCAL FIRST!

**CRITICAL WORKFLOW:**
1. ✅ Make changes
2. ✅ Test with `npm run dev` (localhost:3001)
3. ✅ Use Puppeteer MCP to automate testing
4. ✅ Verify fixes work locally
5. ✅ THEN commit + push + deploy

**WHY:**
- Saves tokens (no wasted deployments)
- Catches bugs early (infinite loops, visual issues)
- Faster iteration (no wait for Vercel)

**Tools:**
- `npm run dev` - Local dev server
- Puppeteer MCP - Automated browser testing
- Browser Preview - Manual testing

---

# 🚨 CRITICAL ISSUES - NEXT SESSION (RESOLVED)

## ⚠️ DRAG/RESIZE VẪN KẸT!

### Problem
**User tested at 300% zoom - VẪN KẸT CỨNG!**
- Kéo task "0.1.2 Cloudflare Account" → ĐƠ, KẸT
- Xong hiện modal chấm hết
- Các task gần đó test cũng thế

### Root Cause
```javascript
// Current: Fixed 20px threshold
if (Math.abs(deltaX) > 20) { ... }

// Problem: At 300% zoom, dayWidth is HUGE
// 20px is TOO SMALL compared to dayWidth
// User has to drag VERY FAR before it triggers
```

### Solution Needed
```javascript
// Option 1: Even smaller threshold (10px or 5px)
if (Math.abs(deltaX) > 5) { ... }

// Option 2: Adaptive threshold based on zoom
const threshold = Math.min(20, dayWidth * 0.1); // 10% of day width, max 20px
if (Math.abs(deltaX) > threshold) { ... }

// Option 3: ALWAYS update on ANY movement (most responsive)
if (Math.abs(deltaX) > 0) { ... }
// But throttle updates to avoid performance issues
```

**RECOMMENDED: Option 3 with throttling**

---

## 🔄 DEPENDENCY WARNING → RELOAD → MẤT VỊ TRÍ

### Problem
**When dragging task with dependencies:**
1. User kéo task
2. Popup hiện: "⚠️ Cannot start before dependencies finish!"
3. Code reload data (`await loadData()`)
4. **User MẤT VỊ TRÍ** - không biết đang ở đâu!

### Current Code Location
File: `CustomGanttPro.jsx`
Function: `handleMouseUp` → `updateTaskDates`

```javascript
// Line ~688-699
const deps = getTaskDependencies(task);
if (deps.length > 0) {
  const latestPredecessorEnd = new Date(Math.max(...deps.map(d => new Date(d.due_date || d.completed_at))));
  
  if (startDate < latestPredecessorEnd) {
    toast.error(`⚠️ Cannot start before dependencies finish!\nEarliest start: ${format(latestPredecessorEnd, 'MMM d, yyyy')}`, {
      duration: 4000
    });
    // Revert optimistic update
    await loadData(); // ← THIS RELOADS EVERYTHING!
    return;
  }
}
```

### Solution Needed

**Option 1: Revert locally without reload**
```javascript
if (startDate < latestPredecessorEnd) {
  toast.error('⚠️ Cannot start before dependencies finish!');
  
  // Revert to original dates (no reload)
  setTasks(prev => prev.map(t => 
    t.id === taskId 
      ? originalTask // Store original before drag
      : t
  ));
  return;
}
```

**Option 2: Scroll back to task after reload**
```javascript
if (startDate < latestPredecessorEnd) {
  toast.error('⚠️ Cannot start before dependencies finish!');
  await loadData();
  
  // Scroll back to the task
  const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
  if (taskElement) {
    taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  return;
}
```

**Option 3: Prevent drag in first place**
```javascript
// In handleBarMouseDown - check BEFORE allowing drag
const handleBarMouseDown = (e, task, edge = null) => {
  // Check if task has unfinished dependencies
  const deps = getTaskDependencies(task);
  const hasBlockers = deps.some(d => d.status !== 'DONE');
  
  if (hasBlockers && !edge) { // Only block drag, allow resize
    toast.warning('⚠️ Complete dependencies first!');
    return; // Don't start drag
  }
  
  // ... rest of drag logic
};
```

**RECOMMENDED: Option 3 (prevent drag) + Option 1 (local revert for resize)**

---

## 📝 FILES TO EDIT

### `CustomGanttPro.jsx`

**1. Fix Drag Threshold**
- Location: `handleMouseMove` function (line ~598-658)
- Change: `if (Math.abs(deltaX) > 20)` → Better threshold
- Test: At 50%, 100%, 200%, 300% zoom

**2. Fix Dependency Warning**
- Location: `handleBarMouseDown` (line ~580-596)
- Add: Check dependencies before allowing drag
- Location: `updateTaskDates` (line ~685-770)
- Change: Revert locally instead of reload

**3. Store Original Task State**
```javascript
const [originalDraggedTask, setOriginalDraggedTask] = useState(null);

const handleBarMouseDown = (e, task, edge = null) => {
  setOriginalDraggedTask(task); // Store original
  // ... rest
};

const handleMouseUp = async () => {
  // If validation fails, revert to originalDraggedTask
  setTasks(prev => prev.map(t => 
    t.id === originalDraggedTask.id ? originalDraggedTask : t
  ));
  setOriginalDraggedTask(null);
};
```

---

## 🎯 TESTING CHECKLIST

### Drag/Resize at Different Zooms
- [ ] 50% zoom - drag task → should be smooth
- [ ] 100% zoom - drag task → should be smooth
- [ ] 200% zoom - drag task → should be smooth
- [ ] 300% zoom - drag task → should be smooth
- [ ] Resize at 300% zoom → should be smooth

### Dependency Validation
- [ ] Drag task with dependencies → should prevent OR warn clearly
- [ ] If warned, should NOT reload page
- [ ] If warned, should stay at same scroll position
- [ ] Resize task with dependencies → should work (only start date matters)

### Edge Cases
- [ ] Drag task with no dependencies → should work
- [ ] Drag task with DONE dependencies → should work
- [ ] Drag task with IN_PROGRESS dependencies → should warn
- [ ] Multiple rapid drags → should not lag

---

## 💡 QUICK WINS TO ADD

While fixing above, also add:

### 1. Visual Feedback During Drag
```javascript
// Show ghost/preview of where task will land
<div className="absolute opacity-50 bg-blue-500" 
     style={{ left: previewPosition }}>
  Preview
</div>
```

### 2. Snap to Grid
```javascript
// Snap to nearest day boundary
const snappedDays = Math.round(deltaDays);
```

### 3. Keyboard Shortcuts
```javascript
// Arrow keys to move task by 1 day
useEffect(() => {
  const handleKeyDown = (e) => {
    if (selectedTask && e.key === 'ArrowRight') {
      // Move task 1 day forward
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedTask]);
```

---

## 📊 CURRENT STATE

**What Works:**
- ✅ Visual improvements (arrows, badges, tooltip)
- ✅ Dependencies display correctly
- ✅ Modal shows full info
- ✅ No hardcoded fields

**What's Broken:**
- ❌ Drag/resize kẹt at high zoom (300%)
- ❌ Dependency warning causes reload + lost position

**Priority:**
1. 🔴 Fix drag threshold (CRITICAL - unusable)
2. 🔴 Fix dependency warning reload (CRITICAL - confusing)
3. 🟡 Add visual feedback
4. 🟢 Add keyboard shortcuts

---

## 🚀 START NEXT SESSION WITH

1. Read this file
2. Test drag at 300% zoom to reproduce issue
3. Implement Option 3 for drag threshold (always update with throttle)
4. Implement Option 3 + 1 for dependency warning (prevent + local revert)
5. Test thoroughly at all zoom levels
6. Deploy

**Token Budget:** Fresh session, plenty of tokens!

---

## 📞 CONTEXT

**Production:** https://tracker-ibtopeps8-kakaholigan-6270s-projects.vercel.app
**Branch:** main
**Last Commit:** e3c1496b - "FIX CRITICAL: Drag/resize stuck - trigger at half day width"

**User Feedback:**
> "kéo 0.1.2 cloudflare account ... kẹt cứng ở mức oom 300% max, đơ, kẹt xong hiện modal chấm hết"
> "nếu bar task đó là depend thì thay đổi timeline thì hiện popoup cảnh báo xong reload mẹ nó lại, đéo biết đang ở đâu luôn"

**Translation:**
- Drag is STUCK at 300% zoom
- When dragging task with dependencies, popup shows then RELOADS page, user loses position

---

## 🎯 CURRENT STATUS

**✅ WORKING:**
- Hour view tab available
- Arrows scale with zoom (no giant arrows)
- Minute precision at high zoom (10-min intervals)
- Drag/resize smooth at all zoom levels
- DB supports TIMESTAMP (hour/minute precision)
- No reload on dependency validation

**🟡 NEEDS TESTING:**
- Verify hour/minute drag precision in production
- Test arrow scaling at different zoom levels (0.5x to 3.0x)
- Confirm timeline readability at all zoom levels

**🎯 GOAL: Make drag/resize SMOOTH at ALL zoom levels + NO RELOAD on validation!** ✅ ACHIEVED
