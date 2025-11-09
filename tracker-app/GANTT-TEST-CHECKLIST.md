# GANTT DRAG & RESIZE TEST CHECKLIST

## ✅ MUST WORK:

### 1. **Drag Task Bar (Move)**
- [ ] Click and hold on task bar center
- [ ] Cursor changes to `grabbing` (closed hand)
- [ ] Drag left/right to move task
- [ ] Bar moves smoothly with mouse
- [ ] No text selection during drag
- [ ] Tooltip disappears during drag
- [ ] Release to save new dates
- [ ] Cursor resets to normal

### 2. **Resize Left Handle (Change Start Date)**
- [ ] Hover over LEFT edge of task bar
- [ ] Cursor changes to `col-resize` (↔️)
- [ ] Click and hold LEFT edge
- [ ] Drag left to make task start earlier
- [ ] Drag right to make task start later
- [ ] Bar resizes smoothly
- [ ] Cannot resize past end date
- [ ] Release to save
- [ ] Cursor resets

### 3. **Resize Right Handle (Change End Date)**
- [ ] Hover over RIGHT edge of task bar
- [ ] Cursor changes to `col-resize` (↔️)
- [ ] Click and hold RIGHT edge
- [ ] Drag left to make task shorter
- [ ] Drag right to make task longer
- [ ] Bar resizes smoothly
- [ ] Cannot resize before start date
- [ ] Release to save
- [ ] Cursor resets

### 4. **Tooltip Behavior**
- [ ] Hover over task bar → tooltip appears
- [ ] Start dragging → tooltip disappears immediately
- [ ] Release drag → tooltip can appear again
- [ ] Tooltip doesn't interfere with drag

### 5. **Visual Feedback**
- [ ] Task bar has `cursor-grab` on hover (open hand)
- [ ] Task bar has `cursor-grabbing` while dragging (closed hand)
- [ ] Resize handles have `cursor-col-resize` (↔️)
- [ ] Dragging task has `opacity-50` and `scale-105`
- [ ] No text selection during any interaction

### 6. **Performance**
- [ ] Drag is smooth (60fps)
- [ ] No lag or stuttering
- [ ] Works on first try (no need to retry)
- [ ] Consistent behavior across all tasks

## 🐛 KNOWN ISSUES TO AVOID:

- ❌ Resize handles not clickable
- ❌ Drag starts but doesn't move
- ❌ Cursor doesn't change
- ❌ Text gets selected during drag
- ❌ Tooltip stays visible during drag
- ❌ Stuck state (can't release drag)

## 🧪 TEST PROCEDURE:

1. Open Gantt view: http://localhost:3006/#tasks
2. Click "Gantt Pro" view mode
3. Find any task bar
4. Test each checklist item above
5. Try on multiple tasks (different phases)
6. Test on different zoom levels

## ✅ PASS CRITERIA:

ALL items in "MUST WORK" section should work perfectly.
NO items in "KNOWN ISSUES" should occur.

If ANY test fails, DO NOT DEPLOY!
