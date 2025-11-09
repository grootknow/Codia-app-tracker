# 🚨 CRITICAL ISSUES - NEXT SESSION

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

**🎯 GOAL: Make drag/resize SMOOTH at ALL zoom levels + NO RELOAD on validation!**
