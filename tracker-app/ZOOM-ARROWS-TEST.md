# ZOOM + ARROWS TEST CHECKLIST

## ✅ WHAT WAS FIXED

### 1. Arrow SVG Canvas Scaling
- **Before**: SVG width/height fixed → arrows cut off when zoom
- **After**: SVG scales with `scaledGanttWidth = totalDays * dayWidth`
- **Result**: Canvas always big enough for all arrows

### 2. Arrow Visibility
- **Before**: strokeWidth="1" → too thin, hard to see
- **After**: strokeWidth="2" + opacity="0.8"
- **Result**: Thicker, more visible arrows

### 3. Arrowhead Size
- **Before**: markerWidth="4" → too small
- **After**: markerWidth="6" → bigger, clearer
- **Result**: Arrowheads visible at all zoom levels

### 4. Total Height Calculation
- **Before**: Used `currentY` (could be wrong)
- **After**: Track `totalHeight` separately
- **Result**: SVG height always correct

---

## 🧪 TEST STEPS

### Test 1: Default Zoom (100%)
1. Open Gantt Pro
2. Enable "Show Dependencies" toggle
3. **Expected**: All arrows visible, connecting tasks correctly
4. **Check**: No arrows cut off at edges

### Test 2: Zoom IN (150% - 300%)
1. Click Zoom IN button multiple times
2. Watch view mode auto-switch: Day → Hour
3. **Expected**: 
   - Arrows scale with tasks
   - No arrows disappear
   - Connections stay accurate
4. **Check**: Arrows visible at 300% zoom

### Test 3: Zoom OUT (50% - 70%)
1. Click Zoom OUT button multiple times
2. Watch view mode auto-switch: Day → Week → Month
3. **Expected**:
   - Arrows scale down with tasks
   - All connections still visible
   - No overlapping arrows
4. **Check**: Arrows visible at 50% zoom

### Test 4: Hour View (Most Detailed)
1. Zoom to 180%+ to trigger Hour view
2. Scroll horizontally
3. **Expected**:
   - Arrows visible across all hours
   - SVG canvas wide enough
   - No cut-off at right edge
4. **Check**: Can see arrows for tasks days apart

### Test 5: Month View (Least Detailed)
1. Zoom to 50% to trigger Month view
2. **Expected**:
   - Arrows still visible (thinner but present)
   - Connections clear
   - No performance issues
4. **Check**: Can see big-picture dependencies

### Test 6: Scroll Test
1. Set zoom to 150%
2. Scroll horizontally to far right
3. Scroll vertically to bottom
4. **Expected**:
   - Arrows stay in correct position
   - No arrows "jump" or "float"
   - Connections accurate throughout scroll
4. **Check**: Arrows follow tasks during scroll

---

## 🎯 SUCCESS CRITERIA

✅ **Arrows visible at ALL zoom levels (50% - 300%)**
✅ **No arrows cut off at canvas edges**
✅ **Arrows scale proportionally with tasks**
✅ **Connections accurate during scroll**
✅ **Arrowheads clearly visible**
✅ **No performance lag with 97 dependencies**

---

## 🐛 KNOWN ISSUES TO WATCH

⚠️ **If arrows still disappear**: Check browser console for SVG errors
⚠️ **If arrows misaligned**: Check `getTaskPosition()` calculation
⚠️ **If performance slow**: May need to throttle arrow rendering

---

## 📊 TECHNICAL DETAILS

### SVG Canvas Size
```javascript
// OLD (WRONG):
<svg style={{ width: ganttWidth, height: currentY }}>

// NEW (CORRECT):
const scaledGanttWidth = totalDays * dayWidth; // Scales with zoom
<svg style={{ width: scaledGanttWidth, height: totalHeight }}>
```

### Arrow Styling
```javascript
// OLD:
strokeWidth="1"
opacity="0.7"
markerWidth="4"

// NEW:
strokeWidth="2"      // Thicker
opacity="0.8"        // More visible
markerWidth="6"      // Bigger arrowhead
```

### Height Tracking
```javascript
// NEW: Separate totalHeight variable
let totalHeight = 40;
phases.forEach(phase => {
  // ... calculate rows ...
  totalHeight = currentY;  // Update after each phase
  totalHeight += 40;       // Add phase header
});
```

---

## 🚀 NEXT STEPS IF ISSUES FOUND

1. **Arrows still cut off**: Increase SVG width by 10%
2. **Arrows too thick**: Reduce strokeWidth to 1.5
3. **Performance issues**: Add `useMemo()` for arrow calculations
4. **Misalignment**: Debug `getTaskPosition()` with console.logs
