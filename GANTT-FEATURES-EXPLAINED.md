# 📊 GANTT CHART PRO - FEATURES EXPLAINED

## 🎯 CORE FEATURES

### 1. **Baseline (Đường nền)**
**Mục đích:** So sánh kế hoạch ban đầu vs thực tế

**Cách hoạt động:**
- Khi tạo task, lưu `baseline_start_date` và `baseline_end_date`
- Hiển thị như đường mảnh màu xám phía trên task bar
- Giúp thấy task bị delay hay ahead of schedule

**Khi nào dùng:**
- Dự án cần track chặt chẽ timeline
- So sánh plan vs actual execution
- Báo cáo cho stakeholders

**Database fields:**
```sql
baseline_start_date DATE
baseline_end_date DATE
```

---

### 2. **Critical Path (Đường tới hạn)**
**Mục đích:** Xác định tasks quan trọng nhất ảnh hưởng đến deadline dự án

**Cách hoạt động:**
- Tính toán chuỗi tasks dài nhất từ đầu đến cuối dự án
- Tasks trên critical path được highlight màu đỏ
- Nếu 1 task trên critical path delay → toàn bộ dự án delay

**Logic tính toán:**
1. Tìm tasks không có dependencies (start tasks)
2. Tính earliest start/finish cho mỗi task
3. Tính latest start/finish (backward pass)
4. Tasks có slack = 0 là critical path

**Khi nào dùng:**
- Dự án phức tạp với nhiều dependencies
- Cần focus vào tasks quan trọng nhất
- Quản lý risk và deadline

**Database fields:**
```sql
blocking_dependencies JSONB -- Array of task IDs that must finish before this task
```

---

### 3. **Auto Schedule (Tự động sắp xếp)**
**Mục đích:** Tự động tính toán start/end dates dựa trên dependencies

**Cách hoạt động:**
1. User chỉ cần set dependencies và duration
2. System tự động tính:
   - Task A phải xong trước khi Task B bắt đầu
   - Task B start = Task A end + 1 day
   - Cascade qua toàn bộ dependency chain

**Logic:**
```javascript
// Pseudo code
for each task with dependencies:
  latestEndDate = max(dependency.end_date)
  task.start_date = latestEndDate + 1 day
  task.end_date = task.start_date + task.duration
```

**Khi nào dùng:**
- Dự án có nhiều tasks phụ thuộc nhau
- Thay đổi 1 task → tự động update các tasks phía sau
- Tiết kiệm thời gian planning

**Database fields:**
```sql
blocking_dependencies JSONB -- Tasks phải hoàn thành trước
estimated_hours INTEGER -- Duration để tính end_date
```

---

## 🔧 CURRENT STATUS

### ✅ Đã implement:
- [x] Baseline rendering (nếu có data)
- [x] Critical path calculation
- [x] Auto-schedule logic
- [x] Support `blocking_dependencies` field
- [x] Dependency arrows rendering

### ⚠️ Cần data để test:
- [ ] Tasks cần có `baseline_start_date` và `baseline_end_date`
- [ ] Tasks cần có `blocking_dependencies` array
- [ ] Ví dụ data:

```sql
-- Example: Task với baseline
UPDATE tasks 
SET 
  baseline_start_date = '2025-01-01',
  baseline_end_date = '2025-01-10'
WHERE id = 1;

-- Example: Task với dependencies
UPDATE tasks 
SET blocking_dependencies = '[2, 3]'::jsonb  -- Task này phụ thuộc vào tasks 2 và 3
WHERE id = 4;
```

---

## 🎨 UI CONTROLS

### Checkboxes trong Gantt:
- **Dependencies:** Show/hide dependency arrows
- **Critical Path:** Highlight critical tasks màu đỏ
- **Baseline:** Show/hide baseline bars
- **Auto Schedule:** Enable/disable auto-scheduling

### Buttons:
- **Auto Schedule Now:** Manually trigger auto-schedule calculation
- **Zoom In/Out:** Adjust timeline scale
- **View Mode:** Switch between Day/Week view

---

## 📝 RECOMMENDATIONS

### Để sử dụng hiệu quả:

1. **Baseline:**
   - Set baseline khi approve plan
   - Không thay đổi baseline sau khi start
   - Dùng để review performance

2. **Critical Path:**
   - Focus resources vào critical tasks
   - Monitor chặt chẽ
   - Có backup plan cho critical tasks

3. **Auto Schedule:**
   - Set dependencies đúng
   - Update duration realistic
   - Review auto-schedule results trước khi commit

---

## 🐛 KNOWN ISSUES

### Tasks chồng dọc (cùng ngày):
- **Nguyên nhân:** Database có nhiều tasks cùng `start_date`
- **Giải pháp:** Update data để tasks có dates khác nhau
- **Không phải lỗi code:** Layout đúng, chỉ cần data đúng

### Dependency arrows không hiện:
- **Check:** Tasks có field `blocking_dependencies` không?
- **Check:** Field có data không? (array of IDs)
- **Check:** Checkbox "Dependencies" có bật không?

---

## 🚀 NEXT STEPS

### Nếu muốn fix tasks chồng dọc:
```sql
-- Spread tasks ra theo thời gian
UPDATE tasks SET start_date = '2025-01-01' WHERE id = 1;
UPDATE tasks SET start_date = '2025-01-05' WHERE id = 2;
UPDATE tasks SET start_date = '2025-01-10' WHERE id = 3;
```

### Nếu muốn test dependencies:
```sql
-- Task 2 phụ thuộc Task 1
UPDATE tasks SET blocking_dependencies = '[1]'::jsonb WHERE id = 2;

-- Task 3 phụ thuộc Task 1 và 2
UPDATE tasks SET blocking_dependencies = '[1, 2]'::jsonb WHERE id = 3;
```

### Nếu muốn test baseline:
```sql
-- Set baseline cho task
UPDATE tasks 
SET 
  baseline_start_date = start_date,
  baseline_end_date = due_date
WHERE id IN (1, 2, 3);

-- Sau đó delay task để thấy difference
UPDATE tasks 
SET start_date = start_date + INTERVAL '3 days'
WHERE id = 2;
```
