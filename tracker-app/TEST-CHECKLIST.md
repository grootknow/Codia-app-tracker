# 🧪 GANTT TEST CHECKLIST

## ✅ PHẢI TEST TRƯỚC KHI COMMIT

### 1. Drag & Drop (Move Task)
- [ ] Click giữ vào giữa task bar
- [ ] Kéo sang trái/phải
- [ ] **KIỂM TRA:** Bar di chuyển MƯỢT, không giật
- [ ] **KIỂM TRA:** KHÔNG có loading indicator
- [ ] **KIỂM TRA:** Thả chuột → task update vị trí mới
- [ ] **KIỂM TRA:** Reload page → vị trí mới được lưu

### 2. Resize Task (Change Duration)
- [ ] Hover vào **đầu trái** task bar
- [ ] **KIỂM TRA:** Cursor đổi thành `col-resize` (↔)
- [ ] **KIỂM TRA:** Thấy thanh trắng nhỏ ở edge
- [ ] Click giữ và kéo trái/phải
- [ ] **KIỂM TRA:** Bar resize MƯỢT, không giật
- [ ] **KIỂM TRA:** KHÔNG có loading indicator
- [ ] Thả chuột
- [ ] Lặp lại với **đầu phải** task bar

### 3. Tooltip on Hover
- [ ] Hover chuột vào task bar (không click)
- [ ] **KIỂM TRA:** Tooltip hiện với thông tin:
  - Task name
  - Status
  - Priority
  - Duration
  - Assigned to
- [ ] Di chuyển chuột → tooltip follow
- [ ] Move ra ngoài → tooltip biến mất

### 4. Tasks Stacking (Vertical Layout)
- [ ] Kiểm tra tasks trong cùng phase
- [ ] **KIỂM TRA:** Mỗi task có row riêng (height 40px)
- [ ] **KIỂM TRA:** Tasks KHÔNG chồng lên nhau theo chiều dọc
- [ ] **NẾU tasks cùng ngày:** Chúng sẽ ở cùng vị trí X (đúng!)
  - Đây là behavior chuẩn của Gantt
  - Cần data có dates khác nhau để spread ra

### 5. Resize Handles Visibility
- [ ] Hover vào task bar
- [ ] **KIỂM TRA:** Thấy 2 handles ở 2 đầu
- [ ] **KIỂM TRA:** Handles có background trắng mờ
- [ ] **KIỂM TRA:** Hover vào handle → sáng hơn
- [ ] **KIỂM TRA:** Cursor thay đổi thành `col-resize`

## 🐛 KNOWN ISSUES (Không phải lỗi code)

### Tasks cùng ngày nằm chồng X position
**Nguyên nhân:** Database có nhiều tasks cùng `start_date`
**Giải pháp:** Update data, không phải fix code
```sql
-- Example: Spread tasks
UPDATE tasks SET start_date = '2025-01-01' WHERE id = 1;
UPDATE tasks SET start_date = '2025-01-05' WHERE id = 2;
UPDATE tasks SET start_date = '2025-01-10' WHERE id = 3;
```

## 🚀 DEPLOY CHECKLIST

- [ ] Tất cả tests ở trên PASS
- [ ] Console không có errors
- [ ] Network tab: Drag/resize chỉ gọi 1 API call khi thả chuột
- [ ] Git commit với message rõ ràng
- [ ] Git push
- [ ] Deploy Vercel: `npx vercel --prod`
- [ ] Test trên production URL
