# 🧪 FINAL TEST CHECKLIST - GANTT CHART PRO

## ✅ PRE-DEPLOYMENT TESTS

### 1. Navigation & Persistence
- [ ] Open app → Goes to last visited page (not always dashboard)
- [ ] Navigate: Dashboard → Tasks → Analytics → Activity
- [ ] Refresh page → Stays on same page
- [ ] Close tab → Reopen → Returns to last page
- [ ] Browser back button → Goes to previous page
- [ ] Browser forward button → Goes to next page
- [ ] URL shows `#tasks`, `#dashboard`, etc.

### 2. Gantt Chart - Data Display
- [ ] Tasks spread across timeline (NOT stacked vertically)
- [ ] Each task has own row (40px height)
- [ ] Timeline shows correct dates (Jan 2025)
- [ ] Timeline header is sticky (stays visible on scroll)
- [ ] Today marker shows (red line)
- [ ] Grid lines align with dates

### 3. Gantt Chart - Interactions
- [ ] **Hover task bar** → Tooltip appears with full info
- [ ] **Click task bar** → Modal opens, NO toast
- [ ] **Drag task bar** → Moves smoothly, NO reload
- [ ] **Drop task bar** → Toast shows "✅ Task dates updated"
- [ ] **Hover left edge** → Cursor changes to `↔`
- [ ] **Hover right edge** → Cursor changes to `↔`
- [ ] **Resize left** → Start date changes smoothly
- [ ] **Resize right** → End date changes smoothly
- [ ] **Drop after resize** → Toast shows "✅ Task dates updated"

### 4. Gantt Chart - Features
- [ ] **Task column toggle** → Hides/shows task list
- [ ] **Toggle button** → Moves with panel state
- [ ] **Expand All** → All phases expand
- [ ] **Collapse All** → All phases collapse
- [ ] **Phase click** → Toggles phase expand/collapse
- [ ] **Zoom slider** → Changes bar width
- [ ] **View mode: Day** → Shows days with hours
- [ ] **View mode: Week** → Shows weeks
- [ ] **View mode: Month** → Shows months

### 5. Dependencies (After enabling checkbox)
- [ ] **Enable Dependencies** → Arrows appear between tasks
- [ ] Arrows go from predecessor to successor
- [ ] Arrows don't overlap bars
- [ ] At least 9 arrows visible (chain structure)

### 6. Critical Path (After enabling checkbox)
- [ ] **Enable Critical Path** → Some tasks turn red
- [ ] Red tasks form a chain (longest path)
- [ ] Red tasks have red ring border
- [ ] Non-critical tasks stay original color

### 7. Auto-Schedule
- [ ] **Click Auto Schedule Now** → Loading toast appears
- [ ] Tasks with dependencies get new dates
- [ ] Success toast shows count
- [ ] Timeline updates to show new dates

### 8. Baseline (If columns added)
- [ ] **Enable Baseline** → Gray lines appear above bars
- [ ] Baseline shows planned vs actual
- [ ] Only tasks with baseline data show lines

### 9. Performance
- [ ] No lag when dragging
- [ ] No lag when resizing
- [ ] Smooth scrolling
- [ ] No console errors
- [ ] No console warnings (except known)

### 10. Mobile/Responsive (Optional)
- [ ] Sidebar collapses on mobile
- [ ] Gantt scrolls horizontally
- [ ] Touch drag works
- [ ] Touch resize works

---

## 🐛 KNOWN ISSUES (Expected)

1. **Baseline not working** - Columns not in schema (need SQL)
2. **Some tasks no dependencies** - Only first 10 have deps
3. **Critical path may be short** - Depends on dependency chain

---

## 📊 DATA VERIFICATION

Run these scripts to verify data:

```bash
# Check current data state
node scripts/check-gantt-data.js

# If tasks still stacked, run fix
node scripts/fix-gantt-data.js

# For baseline (shows SQL to run)
node scripts/add-baseline-columns.js
```

Expected output:
- ✅ 30 tasks with spread dates
- ✅ 9+ dependencies
- ✅ 10+ unique start dates

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] All tests above PASS
- [ ] No console errors
- [ ] Data verified (spread dates + dependencies)
- [ ] Git commit with clear message
- [ ] Git push to main
- [ ] Deploy to Vercel
- [ ] Test production URL
- [ ] Verify production works same as local

---

## 📝 TEST RESULTS

**Date:** _________
**Tester:** _________
**Environment:** Local / Production

**Pass Rate:** ___/50 tests

**Critical Issues:**
1. 
2. 
3. 

**Minor Issues:**
1. 
2. 
3. 

**Notes:**
