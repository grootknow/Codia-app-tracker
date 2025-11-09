# 🚀 CustomGanttPro - Quick Start Guide

## 🎯 What You Got

A **FULL-FEATURED** professional Gantt chart with everything you need:

### ✅ Core Features (Always On)
1. **View Modes**: Day/Week/Month buttons - Switch zoom levels
2. **Today Marker**: Red vertical line - Shows current date
3. **Milestones**: Yellow diamonds (◆) - Special tasks
4. **2-Tier Headers**: Month + Week/Day - Easy date reading
5. **Hierarchy**: Parent-child tasks with indentation
6. **Expand/Collapse**: Click phase headers or task chevrons
7. **Sorting**: Priority/Start/End/Duration dropdown
8. **Progress Bars**: Dark overlay showing completion %
9. **Color Coding**: Green (Done), Blue (In Progress), Gray (Pending)
10. **Tooltips**: Hover task names for details
11. **Smooth Scroll**: Click task to center, "Today" button to jump

### 🎨 Interactive Features (Toggle On/Off)
12. **Dependencies**: Blue arrows connecting related tasks
13. **Baseline**: Gray line showing planned vs actual dates
14. **Drag & Drop**: Move task bars to change dates
15. **Resize**: Drag bar edges to change duration
16. **Resource Labels**: Shows @username on bars (if space)
17. **Grid Lines**: Vertical guides (Week/Day views)

## 🎮 How to Use

### Basic Navigation
```
1. Open app → Go to Tasks page
2. Gantt Pro automatically loads
3. Use mouse wheel to scroll timeline
4. Click task names to focus
```

### View Controls (Top Bar)
```
[Day] [Week] [Month]  ← Click to zoom
[Priority ▼]          ← Sort tasks
[Today]               ← Jump to today
☑ Dependencies        ← Show arrows
☑ Baseline           ← Show planned dates
```

### Interactions
```
✅ Click task name     → Center view on task
✅ Click task bar      → Open task details modal
✅ Hover task name     → Show tooltip
✅ Click phase header  → Collapse/expand all tasks
✅ Click task chevron  → Collapse/expand children
✅ Drag task bar       → Move dates (saves automatically)
✅ Drag bar edges      → Resize duration (saves automatically)
```

## 🎨 Visual Guide

### Task Bar Colors
- 🟢 **Green** = DONE (Completed)
- 🔵 **Blue** = IN_PROGRESS (Working on it)
- ⚪ **Gray** = PENDING (Not started)

### Special Markers
- 🔴 **Red Line** = Today (current date)
- 💛 **Yellow Diamond** = Milestone
- 🔵 **Blue Arrow** = Dependency (task A → task B)
- ⚪ **Gray Line** = Baseline (planned dates)

### Task Bar Layout
```
┌─────────────────────────────────┐
│ ████████░░░░░░░░░░░░  @username │  ← Progress + Resource
└─────────────────────────────────┘
  ▲                            ▲
  └─ Drag left edge           └─ Drag right edge
     (change start)              (change end)
```

## 🔧 Pro Tips

### 1. **Best View for Each Scenario**
- **Daily Planning**: Use Day view (60px/day)
- **Sprint Planning**: Use Week view (default)
- **Roadmap**: Use Month view (4px/day)

### 2. **Keyboard-Free Workflow**
- All features work with mouse only
- No keyboard shortcuts needed
- Click, drag, done!

### 3. **Quick Task Updates**
- Want to move task? → Drag the bar
- Want to extend deadline? → Drag right edge
- Want to see details? → Click the bar
- Want to focus? → Click task name

### 4. **Managing Large Projects**
- Collapse phases you're not working on
- Use Month view for overview
- Use sorting to find critical tasks
- Click "Today" to find current work

### 5. **Understanding Dependencies**
- Blue arrows show task relationships
- Arrow points from predecessor → successor
- Toggle off if arrows clutter view
- Requires `dependencies` field in database

### 6. **Baseline Comparison**
- Gray line = Original plan
- Colored bar = Actual progress
- Gap shows schedule variance
- Requires `baseline_start_date` and `baseline_end_date` in database

## 🐛 Troubleshooting

### "I don't see any tasks"
- Check if phases exist in database
- Check if tasks have `phase_id`
- Check if tasks have dates (`start_date` or `started_at`)

### "Dependencies don't show"
- Toggle "Dependencies" checkbox ON
- Check if tasks have `dependencies` array field
- Check if dependency IDs are valid

### "Baseline doesn't show"
- Toggle "Baseline" checkbox ON
- Check if tasks have `baseline_start_date` and `baseline_end_date`

### "Drag & drop doesn't work"
- Make sure you're dragging the bar, not clicking
- Check if task has valid dates
- Check database permissions

### "Resource labels missing"
- Check if task has `assigned_to` field
- Make sure bar is wide enough (>100px)
- Try Day view for more space

## 📊 Data Requirements

### Minimum Required Fields
```sql
tasks:
  - id (uuid)
  - name (text)
  - status (text)
  - phase_id (uuid)
  - start_date OR started_at (date)
  - due_date OR completed_at (date)

phases:
  - id (uuid)
  - name (text)
```

### Optional Fields (for advanced features)
```sql
tasks:
  - priority (text) → For sorting
  - estimated_hours (number) → For duration
  - progress_percentage (number) → For progress bars
  - assigned_to (text) → For resource labels
  - parent_task_id (uuid) → For hierarchy
  - is_milestone (boolean) → For diamonds
  - dependencies (uuid[]) → For arrows
  - baseline_start_date (date) → For baseline
  - baseline_end_date (date) → For baseline
```

## 🎉 You're Ready!

**CustomGanttPro** is now fully operational with:
- ✅ 17 professional features
- ✅ Zero configuration needed
- ✅ Auto-saves all changes
- ✅ Beautiful UI out of the box

Just open the app and start managing your project! 🚀

---

**Need help?** Check `GANTT-PRO-FEATURES.md` for detailed technical documentation.
