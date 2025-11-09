# 📊 GANTT CHART PRO - FEATURES DOCUMENTATION

## 🎯 BASELINE (Kế hoạch gốc)

### Mục đích:
- So sánh **kế hoạch ban đầu** vs **thực tế**
- Giúp phát hiện tasks bị trễ hoặc sớm hơn dự kiến

### Cách dùng:
1. Set `baseline_start_date` và `baseline_end_date` cho task
2. Bật checkbox "Baseline" ở header
3. Sẽ thấy **đường mảnh màu xám** phía trên task bar = kế hoạch gốc
4. Task bar = thực tế hiện tại

### Ví dụ:
```
Baseline: 1-5 Jan (kế hoạch)
Actual:   3-8 Jan (thực tế - trễ 2 ngày, kéo dài thêm 1 ngày)
```

---

## 🔴 CRITICAL PATH (Đường găng)

### Mục đích:
- Tìm **chuỗi tasks quan trọng nhất** quyết định thời gian hoàn thành project
- Tasks trên critical path **KHÔNG được trễ** vì sẽ làm trễ cả project

### Logic:
1. Tính tổng thời gian của mỗi task + dependencies của nó
2. Tìm chuỗi tasks có tổng thời gian **dài nhất**
3. Đây là critical path

### Cách dùng:
1. Bật checkbox "Critical Path"
2. Tasks trên critical path sẽ **màu đỏ** với red ring
3. Focus vào những tasks này để đảm bảo project đúng deadline

### Ví dụ:
```
Task A (3 days) → Task B (5 days) → Task C (2 days) = 10 days TOTAL
Task D (4 days) → Task E (3 days) = 7 days TOTAL

Critical Path = A → B → C (10 days - dài nhất)
```

---

## 🤖 AUTO-SCHEDULE (Tự động xếp lịch)

### Mục đích:
- Tự động tính toán **ngày bắt đầu tối ưu** cho mỗi task
- Đảm bảo dependencies được respect

### Logic:
1. Tasks không có dependencies → Bắt đầu hôm nay
2. Tasks có dependencies → Bắt đầu **1 ngày sau** khi dependency cuối cùng kết thúc
3. Update tất cả tasks trong database

### Cách dùng:
1. Click button "🤖 Auto-Schedule"
2. Confirm dialog
3. Tất cả tasks sẽ được xếp lịch tự động

### Ví dụ:
```
Task A: No deps → Start today (Nov 9)
Task B: Depends on A (3 days) → Start Nov 13 (A ends Nov 12)
Task C: Depends on B (5 days) → Start Nov 19 (B ends Nov 18)
```

---

## 🔗 DEPENDENCIES (Ràng buộc)

### Mục đích:
- Hiển thị **mối quan hệ** giữa các tasks
- Task B phải đợi Task A hoàn thành mới bắt đầu được

### Cách hoạt động:
- Đọc field `blocking_dependencies` từ database
- Format: Array of task IDs, ví dụ: `[1, 2, 3]`
- Vẽ **mũi tên xanh** từ task dependency → task hiện tại

### Cách dùng:
1. Set `blocking_dependencies` trong database
2. Bật checkbox "Dependencies"
3. Sẽ thấy arrows nối các tasks

---

## ⚙️ DRAG & DROP / RESIZE

### Drag (Di chuyển):
- Click giữ task bar → Kéo trái/phải
- Thay đổi `start_date` và `due_date` cùng lúc
- Tự động save vào database

### Resize (Kéo dài/ngắn):
- Hover vào **đầu/cuối** task bar → Thấy handle trắng
- Kéo trái: Thay đổi start_date
- Kéo phải: Thay đổi end_date
- Tự động save vào database

---

## 📝 NOTES

### Database Fields:
- `start_date`: Ngày bắt đầu
- `due_date`: Ngày kết thúc
- `baseline_start_date`: Kế hoạch bắt đầu
- `baseline_end_date`: Kế hoạch kết thúc
- `blocking_dependencies`: Array of task IDs
- `estimated_hours`: Số giờ ước tính (dùng cho auto-schedule)

### Calculations:
- 1 day = 8 hours (working day)
- Duration = (due_date - start_date) in days
- Auto-schedule uses estimated_hours / 8 to calculate days
