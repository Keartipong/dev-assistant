# สารบัญ: [1. FAST vs DEEP](#1-fast-vs-deep) | [2. SENIOR DEV & DEEP](#2-senior-dev--deep) | [3. TESTER & BOTH](#3-tester--both) | [4. DESIGN](#4-design) | [5. API](#5-api)

> ยึดกฎกลางใน `SKILL.md#Rules` เสมอ

## 1. FAST vs DEEP
| | FAST | DEEP |
| :--- | :--- | :--- |
| ทำอะไร | แก้เฉพาะจุดที่สั่ง | แก้ + ตรวจละเอียด |
| อ่านไฟล์ | เฉพาะที่เกี่ยวข้องโดยตรง | รวมไฟล์ที่เรียกใช้/ถูกเรียกใช้ |
| security/edge case | เฉพาะที่เห็นชัดในจุดที่แก้ | ตาม checklist เต็ม |
| Output | 1-3 บรรทัด + diff | รายงานตามตาราง |
| convention design/api | ตรวจเงียบ แจ้งเมื่อเบี่ยง | ตรวจและรายงานเต็ม |

- **เงื่อนไขเข้า `DEEP` ชั่วคราว:** มีแท็ก `[DEEP]` หรือคำว่า *"ตรวจละเอียด"* / *"ตรวจให้รอบคอบ"* / *"ตรวจทุกอย่าง"*
- **`[DEEP]`:** แก้ตามสั่ง + รันโหมด `SENIOR DEV` เต็มรูปแบบ -> จบงานกลับสู่ `FAST` อัตโนมัติ
- **`[DEEP+TEST]`:** รัน `[DEEP]` + ต่อด้วยโหมด `TESTER` ตรวจความรอบคอบเทส -> จบงานกลับสู่ `FAST` อัตโนมัติ

## 2. SENIOR DEV & DEEP
- **ภารกิจ:** Coding, Debugging, Security Review
- **ขั้นตอน:**
  1. ยึด convention เดิมของโปรเจกต์ก่อนเสมอ (`docs/design-system.md`, `docs/api-conventions.md`)
  2. อ่านไฟล์เป้าหมาย + ไฟล์ที่เรียกใช้ (caller) และถูกเรียกใช้ (callee)
  3. รัน `node scripts/git_diff_extract.js --summary` และ `node scripts/scan_secrets.js --summary`
  4. โหลด `references/security-checklist.md` ตรวจช่องโหว่ (injection, secrets หลุด, auth ผิดพลาด) และ edge case
  5. รายงานตามตารางใน `SKILL.md#Output` (`≤ 15 รายการ`, รายการละ `≤ 1 บรรทัด`)

## 3. TESTER & BOTH
- **Input 3 ส่วน:** (1) Requirement (2) โค้ด (3) เทสที่มีอยู่
- **ขั้นตอนงาน Testing:** โหลด `references/test-checklist.md`
  - ไม่มี Req -> แจ้งว่า *"ตรวจได้เฉพาะโค้ดกับเทส และไม่สามารถบอกได้ว่าขาดฟีเจอร์หรือไม่"*
  - Req ไม่ชัด/ขัดกับโค้ด -> แจ้งว่าขัดกันทันทีตาม `SKILL.md#Rules`
  - เทียบ 4 มิติ: (1) req ที่ยังไม่มีเทส (2) โค้ดที่เทสไม่ถึง (branch/เงื่อนไข/error path) (3) edge case ที่ขาด (4) จุดที่ req กับโค้ดไม่ตรงกัน
- **ขั้นตอนงาน Documentation:** โหลด `references/doc-template.md`
  - ทิศทาง 1: เขียนเอกสารจากโค้ด (เช่น API doc)
  - ทิศทาง 2: ตรวจเอกสารเทียบโค้ดว่าตรงกันไหม
- **`[BOTH]`:** รัน `SENIOR DEV` แล้วตามด้วย `TESTER` ทวนซ้ำในคำตอบเดียว

## 4. DESIGN
- **ไฟล์ความจำ:** `docs/design-system.md` (ในโปรเจกต์ผู้ใช้, `key: value` ย่อ `≤ 60 บรรทัด`)
- **กฎบังคับใช้ (รวมใน FAST เมื่อแตะ UI):**
  - อ่าน `docs/design-system.md` ก่อนเสมอ (ไม่มีไฟล์ -> แจ้งและเสนอ `[DESIGN-SCAN]`)
  - ข้ามกฎเดิมได้เฉพาะเมื่อผู้ใช้ระบุ *"เป็น design ใหม่"* -> ทำเสร็จถาม 1 คำถามว่าจะบันทึกเพิ่มไหม
  - หลังสร้าง/แก้ เทียบ `docs/design-system.md` รายงานเฉพาะจุดที่เบี่ยง
- **`[DESIGN-SCAN]` (ครั้งแรก):**
  1. รัน `node scripts/scan_design.js --summary` ดึงสี, font, spacing, breakpoint, รายชื่อ component, โครงสร้างโฟลเดอร์ UI
  2. อ่านไฟล์ตัวแทน 3-5 ไฟล์ต่อประเภท (หน้า, form, table, modal) โปรเจกต์ใหญ่สแกนทีละโมดูล
  3. โหลด `references/design-template.md` เขียน `docs/design-system.md` (พบหลายสไตล์ปนกัน -> ระบุ `ขัดกัน-รอยืนยัน` และถามตาม `SKILL.md#Rules`)
- **`[DESIGN-UPDATE]` (อัปเดต):**
  1. อ่าน `docs/design-system.md` เดิม + รัน `node scripts/scan_design.js --summary` เทียบความต่าง
  2. อัปเดตแบบ **"เพิ่ม/แก้"** เท่านั้น ห้ามลบของเดิมเอง ส่วนที่ขัดกัน/หายไปแสดงรายการรอยืนยัน
  3. สรุปตารางสั้น (`เพิ่ม / แก้ / ขัดกัน-รอยืนยัน`)

## 5. API
- **ไฟล์ความจำ:** `docs/api-conventions.md` (ในโปรเจกต์ผู้ใช้, `key: value` ย่อ `≤ 60 บรรทัด`)
- **กฎบังคับใช้ (รวมใน FAST เมื่อแตะ API BE/FE):**
  - อ่าน `docs/api-conventions.md` ก่อนเสมอ (ไม่มีไฟล์ -> แจ้งและเสนอ `[API-SCAN]`)
  - มีรูปแบบเดิม -> ทำตามเดิม ยกเว้นระบุ *"เป็นแบบใหม่"*
  - ไม่มีรูปแบบเดิมในหัวข้อนั้น -> โหลด `references/api-rules.md` ออกแบบตามหลักประสิทธิภาพ แล้วถาม 1 คำถามว่าจะบันทึกไหม
  - หลังเขียน เทียบ `docs/api-conventions.md` รายงานเฉพาะจุดที่เบี่ยง
- **`[API-SCAN]` (ครั้งแรก):**
  1. รัน `node scripts/scan_api.js --summary` ดึง route/endpoint, สถิติชื่อ key (`camelCase` vs `snake_case`), รายชื่อไฟล์ API BE/FE
  2. อ่านไฟล์ตัวแทน 3-5 ไฟล์ต่อประเภท (route, controller, service, FE api client)
  3. โหลด `references/api-template.md` เขียน `docs/api-conventions.md` (หลายสไตล์ปนกัน -> ระบุ `ขัดกัน-รอยืนยัน`)
- **`[API-UPDATE]` (อัปเดต):**
  1. อ่าน `docs/api-conventions.md` เดิม + รัน `node scripts/scan_api.js --summary` เทียบ
  2. อัปเดตแบบ **"เพิ่ม/แก้"** เท่านั้น ห้ามลบของเดิมเอง ส่วนที่ขัดกันถามยืนยันก่อนแก้ + สรุปตาราง (`เพิ่ม / แก้ / ขัดกัน-รอยืนยัน`)

