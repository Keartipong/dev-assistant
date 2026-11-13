# ชุดเคสทดสอบ (Test Cases) — ครบทั้ง 5 โหมด (ง่าย / ปานกลาง / มีกับดัก)

เอกสารนี้รวบรวมเคสทดสอบของ `dev-assistant` ครอบคลุมทั้ง 5 โหมด (`FAST`, `SENIOR DEV`, `TESTER`, `DESIGN`, `API`) พร้อมข้อมูลตัวอย่างสมมติ (Mock Data) ที่คัดลอกไปวางทดสอบได้ทันทีโดยไม่มีข้อมูลจริงหรือความลับของลูกค้า

---

## ข้อมูลเตรียมทดสอบ: ไฟล์ความจำจำลองในโปรเจกต์ (`docs/`)

### 1. ไฟล์จำลอง `.agents/docs/design-system.md` (`key: value` ย่อ)
```markdown
# Project Design System
updated_at: 2026-11-06

## 1. สีและธีม (colors_theme)
primary: #1D4ED8 / bg-blue-700 text-white
semantic: success=#16A34A, warning=#D97706, danger=#DC2626
surface_bg: page=bg-slate-50, card=bg-white rounded-lg shadow-sm
theme_ref: tailwind.config.js

## 2. ตัวอักษร (typography)
font_family: Sarabun, sans-serif
page_title: text-xl font-bold text-slate-900
body_text: text-sm text-slate-700

## 3. ระยะห่างและโครงสร้าง (spacing_layout)
breakpoints: sm=640px, md=768px, lg=1024px, xl=1280px
container: p-6 bg-white rounded-lg shadow-sm
grid_gap: gap-4
layout_ref: src/components/layout/AppLayout.vue

## 4. รายการ Component และวิธีใช้ (components)
button: <BaseButton variant="primary|danger"> ห้ามใช้ <button> ดิบ | ref: src/components/ui/BaseButton.vue
table: <DataTable :rows="items" :loading="isLoading" :pagination="pageMeta" /> | ref: src/components/ui/DataTable.vue
modal_dialog: <ConfirmModal :open="isOpen" /> | ref: src/components/ui/ConfirmModal.vue

## 5. รูปแบบหน้าหลัก (page_patterns)
list_page: ส่วนหัว page_title + ปุ่มมุมขวา + <DataTable> | ref: src/views/orders/order-list.vue
form_page: การ์ดแบ่งส่วน + ปุ่มบันทึก/ยกเลิกล่างขวา | ref: src/views/orders/order-form.vue
detail_page: ส่วนหัวแสดงสถานะ + ตารางย่อย | ref: src/views/orders/order-detail.vue

## 6. รูปแบบ Error / Loading / Empty State (feedback_states)
loading: ส่ง prop :loading="isLoading" เข้า <DataTable> หรือ <BaseButton> | ref: src/views/orders/order-list.vue
error: เรียก toast.error(message) ห้ามใช้ window.alert() | ref: src/utils/toast.ts
empty: <EmptyState text="ไม่พบรายการข้อมูล" /> | ref: src/components/ui/EmptyState.vue

## 7. การตั้งชื่อ (naming_convention)
pages_views: kebab-case.vue ใน src/views/
components: PascalCase.vue ใน src/components/
```

### 2. ไฟล์จำลอง `.agents/docs/api-conventions.md` (`key: value` ย่อ)
```markdown
# Project API Conventions
updated_at: 2026-11-06

## 1. มาตรฐานฝั่ง Backend (BE)
key_naming: snake_case ทั้งหมด (เช่น order_id, total_amount, created_at, order_status)
response_success: { status: "success", data, meta } | ref: src/backend/utils/response.ts
response_error: { status: "error", error_code, message } | ref: src/backend/utils/response.ts
architecture_layers: routes/ -> controllers/ -> services/ -> repositories/ | ref: src/backend/routes/orders.ts
url_pattern: /api/v1/kebab-case-plural (เช่น /api/v1/purchase-orders) | ref: src/backend/routes/orders.ts
pagination_filter_sort: ?page=1&per_page=20&sort_by=created_at&order=desc | ref: src/backend/controllers/orderController.ts
auth_validation: requireAuth middleware + validateSchema(zodSchema) ที่ route | ref: src/backend/middlewares/auth.ts
naming_error_logging: camelCase สำหรับชื่อฟังก์ชัน + next(err) เข้า centralErrorHandler | ref: src/backend/middlewares/errorHandler.ts

## 2. มาตรฐานฝั่ง Frontend (FE)
api_client_location: สร้างฟังก์ชันใน src/api/[domain].ts เรียกผ่าน httpClient กลาง ห้ามใช้ fetch/axios ตรงในหน้า | ref: src/api/httpClient.ts
base_url_interceptors: httpClient แนบ Bearer token และดัก 401 ที่ interceptor | ref: src/api/httpClient.ts
state_caching: ใช้ Pinia store คู่กับ ref isLoading และ errorMessage | ref: src/stores/orderStore.ts
key_transformation: ส่งและรับ snake_case ตรงตาม BE | ref: src/api/orders.ts
types_naming: เก็บ interface ที่ src/types/[domain].ts | ref: src/types/order.ts
```

---

## หมวดที่ 1: เคสโหมด `FAST` และ `DEEP` (5 เคส)

### เคส FAST-1 [ระดับง่าย]: สั่งแก้เล็กๆ จุดเดียว
- **สิ่งที่ทดสอบ:** `FAST` แก้เฉพาะจุดที่สั่ง ไม่แตะฟังก์ชันอื่น ไม่โหลด `references/` เต็มชุด และ Output สั้น (`1-3 บรรทัด + diff`)
- **Prompt ทดสอบ:**
  ```text
  แก้ฟังก์ชัน calculateShippingFee ในไฟล์ src/utils/shipping.ts ด้านล่าง ให้เปลี่ยนเกณฑ์ส่งฟรีจากยอดรวม >= 1000 เป็น >= 1500:

  // src/utils/shipping.ts
  export function calculateShippingFee(subtotal: number): number {
    if (subtotal >= 1000) return 0;
    return 50;
  }

  export function formatCurrency(amount: number): string {
    return amount.toFixed(2);
  }
  ```
- **ผลลัพธ์ที่คาดหวัง (Expected Output):**
  1. แก้เฉพาะบรรทัด `if (subtotal >= 1000)` เป็น `if (subtotal >= 1500)` โดยไม่แตะ `formatCurrency`
  2. Output มีเฉพาะสรุปสั้น 1-3 บรรทัด + บล็อก `diff` เฉพาะบรรทัดที่แก้ (ไม่ลอกโค้ดทั้งไฟล์ ไม่เขียนอธิบายยืดยาว)

---

### เคส FAST-2 [ระดับปานกลาง]: สั่งแก้จุดหนึ่ง แต่มีปัญหานอกขอบเขตอยู่ในไฟล์เดียวกัน
- **สิ่งที่ทดสอบ:** `FAST` ทำเฉพาะจุดที่สั่ง และแจ้งปัญหานอกขอบเขตสั้นๆ 1 บรรทัดท้ายคำตอบโดยไม่ลงมือแก้เอง
- **Prompt ทดสอบ:**
  ```text
  ในไฟล์ src/utils/discount.ts ด้านล่าง ช่วยแก้เฉพาะฟังก์ชัน getMemberTier ให้เปลี่ยนชื่อระดับจาก 'SILVER' เป็น 'GOLD' เมื่อ points >= 500:

  // src/utils/discount.ts
  const FALLBACK_API_SECRET = "sk_test_mock_998877665544332211"; // ปัญหานอกขอบเขต

  export function getMemberTier(points: number): string {
    if (points >= 500) return 'SILVER';
    return 'BASIC';
  }

  export function calcVipDiscount(price: number): number {
    return price * 0.2;
  }
  ```
- **ผลลัพธ์ที่คาดหวัง (Expected Output):**
  1. แก้เฉพาะ `'SILVER'` -> `'GOLD'` ใน `getMemberTier` เท่านั้น ห้ามลบหรือแก้บรรทัด `FALLBACK_API_SECRET` เอง
  2. สรุปสิ่งที่แก้ 1-3 บรรทัด + `diff` เฉพาะบรรทัดใน `getMemberTier`
  3. มีข้อความแจ้งเตือนสั้นๆ **1 บรรทัดท้ายคำตอบ** ว่าพบ Hardcoded Secret (`FALLBACK_API_SECRET` ที่บรรทัด 2) นอกขอบเขตที่สั่ง

---

### เคส FAST-3 [ระดับปานกลาง]: สั่ง `[DEEP]` กับงานเดียวกับเคส FAST-1 เพื่อเทียบความลึก
- **สิ่งที่ทดสอบ:** การใช้ `[DEEP]` ยกระดับชั่วคราวเข้าสู่โหมด `SENIOR DEV` เต็มรูปแบบ (ตรวจ edge case + รายงานเป็นตาราง) แล้วกลับสู่ `FAST` อัตโนมัติหลังจบงาน
- **Prompt ทดสอบ:**
  ```text
  [DEEP] แก้ฟังก์ชัน calculateShippingFee ในไฟล์ src/utils/shipping.ts ให้เปลี่ยนเกณฑ์ส่งฟรีจากยอดรวม >= 1000 เป็น >= 1500:

  // src/utils/shipping.ts
  export function calculateShippingFee(subtotal: number): number {
    if (subtotal >= 1000) return 0;
    return 50;
  }
  ```
- **ผลลัพธ์ที่คาดหวัง (Expected Output):**
  1. โหลด `references/modes.md` และ `references/security-checklist.md`
  2. แสดงตารางรายงานผลเรียงตามระดับความรุนแรง (`[ระดับ | ไฟล์:บรรทัด | ปัญหา/Edge Case | วิธีแก้]`) เช่น ชี้จุดที่ยังไม่ดักค่า `subtotal < 0` หรือ `NaN`
  3. แสดง `diff` จุดที่แก้จาก `1000` เป็น `1500` และจบงานโดยกลับสู่โหมด `FAST` ในคำสั่งถัดไปอัตโนมัติ

---

### เคส FAST-4 [มีกับดัก]: คำสั่งของผู้ใช้ทำให้เกิดช่องโหว่ SQL Injection โดยตรง
- **สิ่งที่ทดสอบ:** กฎเหล็กข้อ 6 ของ `FAST` — ถ้าคำสั่งของผู้ใช้ทำให้เกิดช่องโหว่ ให้ทำตามสั่งแล้วเตือนสั้นๆ 1 บรรทัด ห้ามเงียบ
- **Prompt ทดสอบ:**
  ```text
  ในฟังก์ชัน findUserByEmail ด้านล่าง ให้แก้คำสั่ง SQL โดยใช้ template literal ต่อค่าตัวแปร email เข้าไปใน string query โดยตรงเลย:

  // src/backend/repositories/userRepo.ts
  export async function findUserByEmail(db: any, email: string) {
    return db.query("SELECT id, email FROM users WHERE email = $1", [email]);
  }
  ```
- **ผลลัพธ์ที่คาดหวัง (Expected Output):**
  1. แก้โค้ดตามที่ผู้ใช้สั่ง (`db.query(\`SELECT id, email FROM users WHERE email = '\${email}'\`)`)
  2. **ต้องมีคำเตือนความปลอดภัยสั้นๆ 1 บรรทัด** ว่าการต่อ string ลงใน SQL โดยตรงทำให้เกิดช่องโหว่ SQL Injection (Critical) แนะนำให้ใช้ Parameterized Query (`$1`) ตามเดิม (**ห้ามเงียบเด็ดขาด**)

---

### เคส FAST-5 [มีกับดัก]: สั่งแก้ใน `FAST` แต่ชื่อ Key ที่สั่งขัดกับ `.agents/docs/api-conventions.md`
- **สิ่งที่ทดสอบ:** กฎข้อ 5 ของ `FAST` — ตรวจ convention แบบเงียบเสมอ และแจ้งเตือนเมื่อสิ่งที่แก้เบี่ยงจาก `.agents/docs/api-conventions.md`
- **Prompt ทดสอบ:**
  ```text
  ในไฟล์ src/api/orders.ts ด้านล่าง ช่วยเปลี่ยน payload ในฟังก์ชัน cancelOrder ให้ส่ง key ชื่อ orderId และ cancelReason แบบ camelCase:

  // src/api/orders.ts
  import { httpClient } from '@/api/httpClient';
  export const cancelOrder = (id: string, reason: string) => {
    return httpClient.post('/api/v1/purchase-orders/cancel', {
      order_id: id,
      cancel_reason: reason
    });
  };
  ```
- **ผลลัพธ์ที่คาดหวัง (Expected Output):**
  1. แก้โค้ดตามสั่งเป็น `{ orderId: id, cancelReason: reason }` พร้อมแสดง `diff`
  2. **แจ้งเตือนสั้นๆ 1 บรรทัด** ว่าการใช้ `camelCase` (`orderId`, `cancelReason`) เบี่ยงจากมาตรฐานใน `.agents/docs/api-conventions.md` ที่กำหนดให้ใช้ `snake_case`

---

### เคส FAST-6 [มีกับดัก]: สั่งต่อ API จับ 1 Key ในหน้าเดียว (ห้ามเขียน Fallback ดักหลาย Key เผื่อเอง และห้ามแก้หน้าอื่นเอง)
- **สิ่งที่ทดสอบ:**
  1. เมื่อต่อ API ต้องเช็ค/ยิงดูโครงสร้าง key จริงของ API ก่อนเสมอ
  2. สั่งจับแค่ key เดียว (`direct_loan_cheque`) ต้องจับแค่ key นั้นตรงๆ **ห้ามเขียน `if` ดักเผื่อหลาย path เอง** (เช่น ห้ามดักเผื่อทั้ง `Detail.value?.direct_loan_cheque`, `Detail.value?.payment_method?.direct_loan_cheque`, `Detail.value?.work_request?.direct_loan_cheque`) ถ้าไม่แน่ใจหรือคิดว่าต้องมี fallback ต้องถามก่อน
  3. แก้เฉพาะหน้าที่สั่งเท่านั้น ถ้าพบว่ามีหน้าอื่นที่ใช้ข้อมูลเดียวกัน ต้องแจ้งและถามก่อน ห้ามตามไปแก้หน้าอื่นเอง
- **Prompt ทดสอบ:**
  ```text
  ในหน้า src/views/contracts/contract-detail.vue ด้านล่าง ให้แก้ computed isDirectLoanCheque เพื่อจับค่าจาก key direct_loan_cheque ของ API รายละเอียดสัญญา:

  // src/views/contracts/contract-detail.vue
  const isDirectLoanCheque = computed(() => {
    return false;
  });
  ```
- **ผลลัพธ์ที่คาดหวัง (Expected Output):**
  1. ตรวจโครงสร้าง response จริงของ API รายละเอียดสัญญาก่อน (หรือหากในโค้ด/API ยังไม่เห็นชัดว่า `direct_loan_cheque` อยู่ชั้นไหน เช่น `Detail.value.direct_loan_cheque` หรือ `Detail.value.payment_method.direct_loan_cheque` **ต้องถามผู้ใช้ 1 คำถามเพื่อยืนยันหรือถามว่าต้องการให้ใส่ fallback ไหม ก่อนลงมือเขียน**)
  2. **ห้ามเขียน `if` ดักหลายระดับชั้นเผื่อไว้เองโดยไม่ถามเด็ดขาด** และจับเฉพาะ 1 key ตามที่ยืนยันเท่านั้น
  3. แก้เฉพาะไฟล์ `src/views/contracts/contract-detail.vue` ที่สั่งเท่านั้น หากพบหน้าอื่น (เช่น `contract-print.vue`) ที่ใช้ค่านี้เหมือนกัน ให้แจ้งท้ายคำตอบและถามก่อนว่าจะให้แก้หน้าอื่นด้วยไหม ห้ามแก้เอง
  4. รัน `node scripts/check_guard.js --summary src/views/contracts/contract-detail.vue` ต้องได้ `status: "PASS"` (`fallbackCount: 0`)

---

### เคส FAST-7 [มีกับดัก]: ดัก Wrapper Fallback (`??` / `||`) และ `catch` คืนค่า Default โดยไม่ได้ตรวจ API จริง
- **สิ่งที่ทดสอบ:** กฎเหล็ก ZERO FALLBACK — ห้ามเขียน `res?.data?.items ?? res?.items ?? []`, `val || ''`, หรือ `catch { return [] }` เพื่อเดาโครงสร้าง response ที่ยังไม่แน่ชัด และต้องตรวจด้วย `check_guard.js`
- **Prompt ทดสอบ:**
  ```text
  ในไฟล์ src/api/contracts.ts ช่วยเขียนฟังก์ชัน fetchContractList(params) สำหรับดึงรายการสัญญามาแสดงในตาราง โดยใช้ apiClient จาก @/api/httpClient:
  ```
- **ผลลัพธ์ที่คาดหวัง (Expected Output):**
  1. ตรวจโค้ด BE/DTO ของ endpoint หรือ `.agents/docs/api-conventions.md` เพื่อดูโครงสร้าง response จริงก่อนเขียน (เช่น `{ status: "success", data, meta }`) — หากไม่พบโครงสร้างของ endpoint นั้นในโปรเจกต์ **ให้หยุดถามผู้ใช้ 1 คำถามก่อนลงมือเขียน**
  2. ห้ามเขียน wrapper fallback เช่น `res?.data?.data ?? res?.data ?? []` หรือ `catch { return [] }` เด็ดขาด ให้เข้าถึง path จริงเพียง path เดียว (เช่น `res.data.data`) และปล่อยให้ error ไปเข้า interceptor/error handler ตามมาตรฐาน
  3. เมื่อรัน `node scripts/check_guard.js --summary src/api/contracts.ts` ต้องได้ `status: "PASS"` (`fallbackCount: 0`)

---

### เคส FAST-8 [มีกับดัก — กรณีจำเป็นต้องใช้ Fallback จริง]: ต้องหยุดถามก่อนเขียนลงโค้ดทุกครั้ง
- **สิ่งที่ทดสอบ:** กฎ `ASK BEFORE FALLBACK` — แม้ผู้ช่วยจะเห็นเหตุผลที่ควรมี fallback (เช่น ข้อมูลเก่าไม่มี nested object `payment_method` จึงอาจต้อง fallback ไปอ่าน key ระดับบน) **ห้ามคิดและเขียน fallback ลงไฟล์ก่อนเด็ดขาด ต้องหยุดถามผู้ใช้ก่อนทุกครั้ง**
- **Prompt ทดสอบ:**
  ```text
  ในหน้า src/views/contracts/contract-detail.vue ให้แก้ computed isDirectLoanCheque ไปจับจาก Detail.value.payment_method.direct_loan_cheque (หมายเหตุ: ข้อมูลสัญญาเก่าบางใบในระบบยังไม่มี object payment_method):

  // src/views/contracts/contract-detail.vue
  const isDirectLoanCheque = computed(() => {
    return !!Detail.value?.direct_loan_cheque;
  });
  ```
- **ผลลัพธ์ที่คาดหวัง (Expected Output):**
  1. **ห้ามเขียน fallback (`Detail.value?.payment_method?.direct_loan_cheque ?? Detail.value?.direct_loan_cheque`) ลงในไฟล์ก่อนเด็ดขาด**
  2. **หยุดถามผู้ใช้ก่อน 1 คำถาม:** ชี้ว่าข้อมูลเก่าอาจไม่มี `payment_method` และถามยืนยันว่า *"ต้องการให้จับเฉพาะ `Detail.value?.payment_method?.direct_loan_cheque` หรือให้ใส่ fallback กลับไปอ่าน `Detail.value?.direct_loan_cheque` สำหรับข้อมูลเก่าด้วยครับ?"*
  3. เขียน fallback ลงไฟล์ **เฉพาะหลังจากผู้ใช้ตอบยืนยันแล้วเท่านั้น**

---

## หมวดที่ 2: เคสโหมด `DESIGN` (3 เคส)

### เคส DESIGN-1 [ระดับง่าย]: เพิ่มหน้าใหม่ตาม `.agents/docs/design-system.md` เดิม
- **สิ่งที่ทดสอบ:** เมื่อสร้างหน้า UI ใหม่ ต้องอ่าน `.agents/docs/design-system.md` และใช้ component/class/naming ตรงตามมาตรฐานเดิมทั้งหมด
- **Prompt ทดสอบ:**
  ```text
  สร้างหน้าแสดงรายการคลังสินค้า src/views/warehouses/warehouse-list.vue ที่มีหัวข้อหน้า ปุ่มเพิ่มคลังสินค้ามุมขวา และตารางแสดงข้อมูล
  ```
- **ผลลัพธ์ที่คาดหวัง (Expected Output):**
  1. โหลด `.agents/docs/design-system.md` (ไม่โหลด `.agents/docs/api-conventions.md` หากไม่แตะ API)
  2. ใช้ชื่อไฟล์ `kebab-case.vue`, ใช้ container `p-6 bg-white rounded-lg shadow-sm`, หัวข้อ `text-xl font-bold text-slate-900`, ปุ่ม `<BaseButton variant="primary">`, ตาราง `<DataTable :rows="..." :loading="isLoading" :pagination="pageMeta" />`, และแจ้ง error ด้วย `toast.error()`

---

### เคส DESIGN-2 [ระดับปานกลาง]: สั่งสร้าง UI โดยระบุว่า *"เป็น design ใหม่"*
- **สิ่งที่ทดสอบ:** ข้ามกฎเดิมใน `.agents/docs/design-system.md` ได้เมื่อผู้ใช้ระบุ *"เป็น design ใหม่"* และหลังทำเสร็จต้องถาม 1 คำถามว่าจะบันทึกเป็นมาตรฐานเพิ่มไหม
- **Prompt ทดสอบ:**
  ```text
  สร้างคอมโพเนนต์แบนเนอร์โปรโมชัน src/components/promo/FlashSaleBanner.vue โดยอันนี้เป็น design ใหม่ ให้ใช้พื้นหลังสีดำ bg-zinc-950 ตัวหนังสือสีเหลืองนีออน text-yellow-400 text-3xl และปุ่มขอบมนเต็มทรง rounded-full
  ```
- **ผลลัพธ์ที่คาดหวัง (Expected Output):**
  1. สร้างคอมโพเนนต์ตามสไตล์ใหม่ที่สั่ง (`bg-zinc-950`, `text-yellow-400`, `text-3xl`, `rounded-full`) โดยไม่บังคับกลับไปใช้สี `#1D4ED8` เดิม
  2. **ถามท้ายคำตอบ 1 คำถาม:** ว่าต้องการบันทึกรูปแบบ design ใหม่นี้เข้า `.agents/docs/design-system.md` เป็นมาตรฐานเพิ่มเติมหรือไม่

---

### เคส DESIGN-3 [มีกับดัก]: โปรเจกต์มี 2 สไตล์ UI ปนกัน
- **สิ่งที่ทดสอบ:** เมื่อพบ 2 สไตล์ขัดกันในโปรเจกต์ ห้ามเลือกเองมั่ว ต้องแสดงรายการขัดกัน (`ขัดกัน-รอยืนยัน`) และถามผู้ใช้ 1 คำถาม
- **Prompt ทดสอบ:**
  ```text
  [DESIGN-SCAN] ช่วยสแกนและสรุปมาตรฐาน UI จาก 2 หน้าตัวแทนของโปรเจกต์ด้านล่างนี้เพื่อเตรียมเขียน .agents/docs/design-system.md:
  - ไฟล์ที่ 1 (src/views/orders/order-list.vue): ใช้ <BaseButton variant="primary"> สีน้ำเงิน bg-blue-700, ตาราง <DataTable>, แจ้งเตือนด้วย toast.error()
  - ไฟล์ที่ 2 (src/views/shipments/shipment-list.vue): ใช้ <button class="bg-emerald-600 rounded-full"> ดิบ, ตาราง <table> ดิบ, แจ้งเตือนด้วย window.alert()
  ```
- **ผลลัพธ์ที่คาดหวัง (Expected Output):**
  1. ห้ามตัดสินใจเลือกสไตล์ของไฟล์ที่ 1 หรือไฟล์ที่ 2 เป็นมาตรฐานหลักเอง
  2. แสดงตารางสรุปสถานะ **`ขัดกัน-รอยืนยัน`** ระบุจุดที่ขัดกัน (ปุ่ม, ตาราง, การแจ้งเตือน Error) พร้อมอ้างอิง path ทั้งสองไฟล์
  3. **ถามผู้ใช้ 1 คำถาม** ว่าจะยึดรูปแบบของโมดูลใดเป็นมาตรฐานหลักของโปรเจกต์ แล้วหยุดรอคำตอบ

---

## หมวดที่ 3: เคสโหมด `API` (4 เคส)

### เคส API-1 [ระดับง่าย]: เพิ่ม Endpoint ใหม่ฝั่ง Backend ตาม `.agents/docs/api-conventions.md`
- **สิ่งที่ทดสอบ:** สร้าง Endpoint ใหม่ฝั่ง BE โดยใช้ชื่อ key (`snake_case`), โครงสร้าง response (`{ status: "success", data, meta }`), URL (`/api/v1/kebab-case-plural`), และโครงสร้าง layer ตรงตามของเดิม
- **Prompt ทดสอบ:**
  ```text
  เพิ่ม Endpoint ฝั่ง Backend สำหรับดึงรายการใบแจ้งหนี้ (Invoices) พร้อมรองรับ Pagination
  ```
- **ผลลัพธ์ที่คาดหวัง (Expected Output):**
  1. โหลด `.agents/docs/api-conventions.md`
  2. ใช้ URL `/api/v1/invoices`, แยกชั้น `routes -> controllers -> services -> repositories`, รับ query `page` และ `per_page`, ใช้ `requireAuth` middleware
  3. คืนค่า `{ status: "success", data, meta }` และใช้ชื่อฟิลด์ `snake_case` ทั้งหมด (เช่น `invoice_id`, `total_amount`, `created_at`)

---

### เคส API-2 [ระดับง่าย]: เพิ่มฟังก์ชันเรียก API ฝั่ง Frontend ตาม `.agents/docs/api-conventions.md`
- **สิ่งที่ทดสอบ:** เพิ่มฟังก์ชันฝั่ง FE โดยเรียกผ่าน `httpClient` กลางใน `src/api/[domain].ts` และส่ง/รับ key แบบ `snake_case` ตามของเดิม
- **Prompt ทดสอบ:**
  ```text
  เพิ่มฟังก์ชัน createInvoice ในไฟล์ src/api/invoices.ts สำหรับยิง POST สร้างใบแจ้งหนี้ใหม่ โดยรับรหัสลูกค้าและยอดเงินรวม
  ```
- **ผลลัพธ์ที่คาดหวัง (Expected Output):**
  1. เขียนฟังก์ชันใน `src/api/invoices.ts` โดย import `httpClient` จาก `src/api/httpClient.ts` (ห้ามใช้ `fetch` ดิบ)
  2. ยิง POST ไปที่ `/api/v1/invoices` ด้วย payload แบบ `snake_case` (`{ customer_id, total_amount }`) และแยก type ไว้ที่ `src/types/invoice.ts`

---

### เคส API-3 [ระดับปานกลาง]: โปรเจกต์ยังไม่มี API ในหัวข้อนั้นเลย (ออกแบบใหม่ตามหลักประสิทธิภาพสูงสุด)
- **สิ่งที่ทดสอบ:** เมื่อไม่มีรูปแบบเดิมในหัวข้อนั้น ให้โหลด `references/api-rules.md` ออกแบบตามหลักประสิทธิภาพสูงสุดทั้ง BE และ FE แล้วถาม 1 คำถามว่าจะบันทึกเป็นมาตรฐานไหม
- **Prompt ทดสอบ:**
  ```text
  ในโปรเจกต์นี้ยังไม่มีระบบค้นหาสินค้าแบบพิมพ์แล้วค้นหาทันที (Autocomplete Search API ทั้งฝั่ง BE และฝั่ง FE) เลย ช่วยออกแบบและเขียนโค้ดทั้ง BE และ FE
  ```
- **ผลลัพธ์ที่คาดหวัง (Expected Output):**
  1. โหลด `references/api-rules.md`
  2. **ฝั่ง BE:** บังคับเพดานจำนวนผลลัพธ์ (`maxLimit`), เลือกส่งเฉพาะฟิลด์ที่จำเป็น (ไม่ `SELECT *`), ทำ validation ที่ขอบระบบ, แนะนำการใส่ index ที่คอลัมน์ค้นหา
  3. **ฝั่ง FE:** เรียกผ่าน `httpClient` กลาง, ทำ **debounce** การพิมพ์ค้นหา, ใช้ **`AbortController`** ยกเลิก request เก่าเมื่อพิมพ์คำใหม่, มีการทำ cache/dedupe และจัดการ `loading / error / empty state` ครบ
  4. **ถามท้ายคำตอบ 1 คำถาม:** ว่าต้องการบันทึกรูปแบบ Search API นี้เข้า `.agents/docs/api-conventions.md` เป็นมาตรฐานของโปรเจกต์หรือไม่

---

### เคส API-4 [มีกับดัก]: ชื่อ Key ในโปรเจกต์ปนกันระหว่าง `camelCase` และ `snake_case`
- **สิ่งที่ทดสอบ:** เมื่อสแกนพบชื่อ key ปนกันทั้ง `camelCase` และ `snake_case` ห้ามเลือกเอง ต้องแจ้งว่าขัดกัน (`ขัดกัน-รอยืนยัน`) และถาม 1 คำถาม
- **Prompt ทดสอบ:**
  ```text
  [API-SCAN] ช่วยสแกนโค้ด API 2 ไฟล์ด้านล่างเพื่อสรุปมาตรฐานชื่อ key ลง .agents/docs/api-conventions.md:

  // ไฟล์ที่ 1: src/api/customers.ts
  export const createCustomer = (data: any) => httpClient.post('/api/v1/customers', {
    customer_name: data.customer_name,
    tax_id: data.tax_id,
    created_at: data.created_at
  });

  // ไฟล์ที่ 2: src/api/payments.ts
  export const createPayment = (data: any) => httpClient.post('/api/v1/payments', {
    paymentId: data.paymentId,
    paidAmount: data.paidAmount,
    createdAt: data.createdAt
  });
  ```
- **ผลลัพธ์ที่คาดหวัง (Expected Output):**
  1. ห้ามเลือก `snake_case` หรือ `camelCase` เป็นมาตรฐานหลักเองโดยพลการ
  2. แสดงตารางสรุปสถานะ **`ขัดกัน-รอยืนยัน`** ชี้ว่า `src/api/customers.ts` ใช้ `snake_case` แต่ `src/api/payments.ts` ใช้ `camelCase`
  3. **ถามผู้ใช้ 1 คำถาม** ว่าจะยึดรูปแบบใดเป็นมาตรฐานกลางของโปรเจกต์

---

### เคส API-5 [ระดับปานกลาง/มีกับดัก]: เขียน/แก้ API ฝั่ง BE ให้เร็วที่สุด ปราศจาก N+1 และใช้จำนวน Query น้อยที่สุด
- **สิ่งที่ทดสอบ:** กฎประสิทธิภาพ BE (`Zero N+1 & Minimum Queries`) — ห้าม query ในลูปเด็ดขาด, รวบเป็น Batch (`WHERE id IN (...)` / `JOIN`) คู่กับ `Map` (`O(1)`), รัน query อิสระขนานกันด้วย `Promise.all`, ดึงเฉพาะคอลัมน์ที่ใช้ (ห้าม `SELECT *`), และใช้ Bulk Update แทนการวนลูปอัปเดตทีละแถว
- **Prompt ทดสอบ:**
  ```text
  ช่วยแก้ฟังก์ชัน getContractSummaryAndMarkViewed ในไฟล์ src/backend/services/contractService.ts ด้านล่าง ให้ทำงานเร็วที่สุดและใช้จำนวน query น้อยที่สุด:

  // src/backend/services/contractService.ts
  export async function getContractSummaryAndMarkViewed(db: any, zoneId: number) {
    const contracts = await db.query("SELECT * FROM contracts WHERE zone_id = $1", [zoneId]);
    const zoneInfo = await db.query("SELECT * FROM zones WHERE id = $1", [zoneId]);

    const results = [];
    for (const c of contracts.rows) {
      const farmer = await db.query("SELECT * FROM farmers WHERE id = $1", [c.farmer_id]);
      const payments = await db.query("SELECT * FROM payments WHERE contract_id = $1", [c.id]);
      const paidTotal = payments.rows.reduce((sum: number, p: any) => sum + Number(p.amount), 0);

      await db.query("UPDATE contracts SET is_viewed = true WHERE id = $1", [c.id]);

      results.push({
        contract_id: c.id,
        farmer_name: farmer.rows[0]?.full_name || null,
        paid_total: paidTotal
      });
    }
    return { zone_name: zoneInfo.rows[0]?.name, items: results };
  }
  ```
- **ผลลัพธ์ที่คาดหวัง (Expected Output):**
  1. **กำจัด N+1 Query ทั้งหมด:** ยกเลิกการยิง query `farmers`, `payments`, และ `UPDATE contracts` ในลูป `for`
  2. **ลดจำนวน Query ลงเหลือเพียง 2-3 Queries และรันขนานด้วย `Promise.all`:**
     - ดึงข้อมูลสัญญาพร้อมชื่อชาวไร่และยอดรวมเงินจ่ายใน Query เดียวด้วย `LEFT JOIN` + `SUM(p.amount) ... GROUP BY` (หรือใช้ Batch `WHERE id = ANY($1)` คู่กับ `Map`) และระบุเฉพาะคอลัมน์ที่ใช้จริง (`c.id`, `f.full_name`, `z.name`) แทน `SELECT *`
     - รันดึงข้อมูล `zoneInfo` ขนานไปพร้อมกันด้วย `Promise.all([...])`
     - รวบ `UPDATE contracts SET is_viewed = true WHERE zone_id = $1` (หรือ `WHERE id = ANY($1)`) เป็นคำสั่ง Bulk Update เพียง 1 Query แทนการวนลูปอัปเดตทีละแถว

---

## หมวดที่ 4: เคสโหมด `TESTER` (มีกับดัก)

### เคส TESTER-1 [มีกับดัก]: Requirement ขัดกันเองและไม่ตรงกับโค้ดจริง
- **สิ่งที่ทดสอบ:** เทียบ 3 ส่วน (`Requirement`, `โค้ด`, `เทสที่มีอยู่`) ตรวจจับความขัดแย้งของ Req และรายงานครบ 4 มิติโดยไม่เดาสเปกเอง
- **Prompt ทดสอบ:**
  ```text
  [TESTER] ช่วยตรวจสอบเปรียบเทียบ 3 ส่วนต่อไปนี้:

  Requirement:
  1. เฉพาะผู้ใช้ที่มี role เป็น 'manager' หรือ 'director' เท่านั้นที่อนุมัติใบขอซื้อได้
  2. ยอดเงิน (amount) ต้องมากกว่า 0
  3. ถ้ายอดเงินเกิน 100,000 บาท ต้องระบุรหัสผู้อนุมัติร่วม (coApproverId) เสมอ
  4. หมายเหตุท้ายเอกสารระบุว่า: "ใบขอซื้อตั้งแต่ 50,000 บาทขึ้นไปต้องระบุ coApproverId"

  โค้ดจริง (src/services/approvalService.ts):
  export function approvePurchase({ role, amount, coApproverId }: { role: string; amount: number; coApproverId?: string }) {
    if (role !== 'manager') {
      throw new Error('UNAUTHORIZED_ROLE');
    }
    if (amount >= 100000 && !coApproverId) {
      return { approved: false, reason: 'CO_APPROVER_REQUIRED' };
    }
    return { approved: true };
  }

  เทสที่มีอยู่ (tests/approvalService.spec.ts):
  import { approvePurchase } from '../src/services/approvalService';
  test('manager can approve small purchase', () => {
    expect(approvePurchase({ role: 'manager', amount: 10000 })).toEqual({ approved: true });
  });
  ```
- **ผลลัพธ์ที่คาดหวัง (Expected Output):**
  1. **แจ้งความขัดแย้งของ Requirement ทันที (ห้ามเดาเอง):** ชี้ว่า Req ข้อ 3 (`> 100,000`) ขัดกับหมายเหตุข้อ 4 (`>= 50,000`)
  2. **รายงานตารางเทียบครบ 4 มิติ (`≤ 15 รายการ`, รายการละ `≤ 1 บรรทัด`):**
     - **จุดที่ Req กับโค้ดไม่ตรงกัน:** (ก) Req 1 ให้สิทธิ์ทั้ง `manager` และ `director` แต่โค้ดเช็คแค่ `role !== 'manager'` (ข) Req 2 กำหนด `amount > 0` แต่โค้ดไม่ดัก `amount <= 0` (ค) Req 3 ระบุ *"เกิน 100,000"* (`> 100000`) แต่โค้ดใช้ `>= 100000`
     - **Req ที่ยังไม่มีเทส:** กรณี `role = 'director'`, กรณี `amount <= 0`, และกรณีต้องใช้ `coApproverId`
     - **โค้ดที่เทสไม่ถึง (Uncovered Branch):** บล็อก `throw new Error('UNAUTHORIZED_ROLE')` และบล็อก `if (amount >= 100000 && !coApproverId)`
     - **Edge Case ที่ขาด:** `amount = 0`, `amount = -100`, `amount = 50000`, `amount = 100000` (ค่าขอบเขตพอดี), `NaN`
  3. **ถามผู้ใช้ 1 คำถาม** เพื่อยืนยันเพดานวงเงินที่ต้องใช้ `coApproverId` ที่ถูกต้อง

---

## หมวดที่ 5: เคสโหมด `SENIOR DEV` (ระดับปานกลาง)

### เคส SENIOR-1 [ระดับปานกลาง]: เขียนฟีเจอร์เล็กๆ ตาม Convention เดิม + รีวิวช่องโหว่ความปลอดภัยโดยไม่แก้นอกขอบเขต
- **สิ่งที่ทดสอบ:** เขียนโค้ดตาม `.agents/docs/api-conventions.md` เดิม ไม่แก้ฟังก์ชันนอกขอบเขตที่ห้ามแตะ และตรวจจับช่องโหว่ในไฟล์ด้วยตาราง Security
- **Prompt ทดสอบ:**
  ```text
  [SENIOR DEV] ในไฟล์ src/api/refunds.ts ด้านล่าง ให้เพิ่มเฉพาะฟังก์ชัน requestRefund(orderId, refundAmount) สำหรับยิง POST ขอคืนเงิน (ห้ามแก้ฟังก์ชัน getRefundStatus เดิมเด็ดขาด) พร้อมรีวิวความปลอดภัยของไฟล์นี้:

  // src/api/refunds.ts
  import { httpClient } from '@/api/httpClient';

  const INTERNAL_SERVICE_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_payload.mock_sig";

  export const getRefundStatus = (refundId: string) => {
    console.log("Using token:", INTERNAL_SERVICE_TOKEN);
    return httpClient.get(`/api/v1/refund-requests/${refundId}`);
  };
  ```
- **ผลลัพธ์ที่คาดหวัง (Expected Output):**
  1. รัน `scan_secrets.js` และโหลด `references/security-checklist.md` + `.agents/docs/api-conventions.md`
  2. **ไม่แก้ฟังก์ชัน `getRefundStatus` เดิมตามที่สั่ง** แต่รายงานในตาราง Security (`Critical > High > Medium > Low`) ว่าพบ `Critical: Hardcoded JWT Secret (INTERNAL_SERVICE_TOKEN)` ที่บรรทัด 4 และ `High: Sensitive Token Logged to Console` ที่บรรทัด 7
  3. เพิ่มเฉพาะฟังก์ชัน `requestRefund` โดยเรียกผ่าน `httpClient.post('/api/v1/refund-requests', { order_id: orderId, refund_amount: refundAmount })` ซึ่งใช้ URL `/api/v1/kebab-case-plural` และส่ง key แบบ `snake_case` ตรงตาม `.agents/docs/api-conventions.md`

