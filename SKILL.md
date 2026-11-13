---
name: dev-assistant
description: ผู้ช่วย Developer 5 โหมด: FAST (ค่าเริ่มต้น แก้เฉพาะจุด เร็ว ประหยัด token), SENIOR DEV (โค้ด/บัก/ความปลอดภัย), TESTER (เทียบ Req-Code-Test 4 มิติ/เอกสาร), DESIGN (Design System UI) และ API (มาตรฐาน API BE/FE) ใช้เมื่อแก้โค้ด รีวิว เทส เอกสาร หรือจัดการ UI/API
---

# Dev Assistant (5-Mode Router)

## Input
- **แท็ก (ต้นข้อความ):** ไม่ใส่ = `FAST` (แก้/เขียนโค้ด ยกเว้นรีวิว/เทส/เอกสารเข้าโหมดตรงงาน) | ชั่วคราว: `[DEEP]` / *"ตรวจละเอียด"* / *"ตรวจให้รอบคอบ"* / *"ตรวจทุกอย่าง"*, `[DEEP+TEST]` | โหมดเฉพาะ: `[SENIOR DEV]`, `[TESTER]`, `[BOTH]`, `[DESIGN-SCAN]`, `[DESIGN-UPDATE]`, `[API-SCAN]`, `[API-UPDATE]`
- **แนบได้:** โค้ด, `ไฟล์:บรรทัด`, `git diff`, Requirement, เอกสาร

## ตารางแท็ก -> ไฟล์ที่โหลด
| แท็ก / บริบท | สคริปต์ (`node scripts/... --summary`) | `references/` | ไฟล์ความจำโปรเจกต์ |
| :--- | :--- | :--- | :--- |
| **`FAST` (ค่าเริ่มต้น)** | `detect_stack.js` (เฉพาะไร้ `.agents/docs/*`), `check_guard.js` (เฉพาะแก้ API/fallback/SQL) | `api-rules.md` (เฉพาะ BE Query/API ไร้ของเดิม) | UI->`.agents/docs/design-system.md` / API->`.agents/docs/api-conventions.md` |
| **`[DEEP]` / `[SENIOR DEV]`** | `detect_stack.js`, `git_diff_extract.js`, `scan_secrets.js`, `check_guard.js` | `modes.md`, `security-checklist.md` (+`api-rules.md` ถ้าแตะ API) | เฉพาะเมื่อแตะ UI/API |
| **`[TESTER]`** | - | `modes.md`, `test-checklist.md` หรือ `doc-template.md` | - |
| **`[DEEP+TEST]` / `[BOTH]`** | `detect_stack.js`, `git_diff_extract.js`, `scan_secrets.js`, `check_guard.js` | `modes.md`, `security-checklist.md`, `test-checklist.md` (+`api-rules.md` ถ้าแตะ API) | เฉพาะเมื่อแตะ UI/API |
| **`[DESIGN-SCAN]` / `UPDATE`** | `scan_design.js` | `modes.md`, `design-template.md` | `.agents/docs/design-system.md` (ไม่โหลด API) |
| **`[API-SCAN]` / `UPDATE`** | `scan_api.js` | `modes.md`, `api-template.md`, `api-rules.md` | `.agents/docs/api-conventions.md` (ไม่โหลด UI) |

## Workflow (FAST ค่าเริ่มต้น)
1. **Stack & อ่านแบบ Parallel:** ไร้ `.agents/docs/*` -> รัน `detect_stack.js` (`UNKNOWN_STACK` -> ถาม 1 คำถามหยุด) | search หาบรรทัดก่อน แล้ว**อ่านพร้อมกันรอบเดียวเฉพาะ ±40 บรรทัด (ห้ามอ่านทั้งไฟล์)** | **ได้ URL `localhost`:** grep route->ไฟล์ตรงๆ **ห้ามเปิด `browser`/subagent**
2. **UI:** แตะ UI -> อ่าน `.agents/docs/design-system.md` (ไม่มี -> เสนอ `[DESIGN-SCAN]`) ทำตามเดิม ยกเว้น *"เป็น design ใหม่"* แล้วถาม 1 คำถามบันทึกไหม (งาน UI ล้วนห้ามวิ่งค้น API/BE)
3. **API, BE & ASK BEFORE FALLBACK:**
   - แตะ API -> โหลดตามตาราง | **Verify Gate:** ต่อ API/จับ key ต้องตรวจ response จริง/BE endpoint ให้เห็น 1 path ก่อน **ไม่เห็นห้ามเดา/เขียน ให้หยุดถาม**
   - **ASK BEFORE FALLBACK:** จับ 1 key เขียน 1 path ตรงๆ **ห้ามเขียน `??`, `||`, `?:`, `if` ดักหลาย path, wrapper (`res?.data ?? res`), ค่าสำรอง (`val || '-'`), หรือ `catch` คืนค่าว่างลงไฟล์ก่อนถาม** — จำเป็นต้องมี fallback **หยุดถามก่อนทุกครั้ง**
   - **BE Min-Queries:** ห้าม N+1 (`await` ในลูป -> `IN`/`JOIN`+`Map`), `Promise.all`, Bulk Ops, ห้าม `SELECT *`, ใช้ DB `COUNT/SUM/EXISTS`
   - **Guard:** หลังแก้จุดต่อ API/fallback/SQL รัน `check_guard.js <file>` หาก `BLOCKED` โดยยังไม่อนุญาต **ลบ fallback ทันทีแล้วค่อยถาม**
4. **ความปลอดภัย & ขอบเขต:** ห้ามฝัง secrets, ต่อ SQL string, ข้าม auth/validation (คำสั่งเสี่ยง -> ทำแล้วเตือน 1 บรรทัด) | **แก้เฉพาะหน้า/ไฟล์ที่สั่ง (แก้คอมโพเนนต์เดียวได้ห้ามลาม มีหน้าอื่นเกี่ยวให้ถามก่อน)** | **ห้ามรัน `build` (`vite build`), `tsc`, `lint`, `test` หรือเปิดเบราว์เซอร์ใน `FAST` เว้นแต่สั่ง** (ปัญหานอกขอบเขต/เทสพังแจ้ง 1 บรรทัด)
5. **โหมดอื่น:** โหลด `references/modes.md` และไฟล์ตามตาราง จบ `[DEEP]`/`[DEEP+TEST]` กลับ `FAST` อัตโนมัติ

## Output
- **`FAST`:** สรุป `1-3 บรรทัด` (+ เตือนช่องโหว่/เบี่ยง convention/นอกขอบเขต อย่างละ `≤ 1 บรรทัด` รวม `≤ 5 บรรทัด`) + `diff` เฉพาะจุด
- **`[DEEP]` / `[SENIOR DEV]`:** ตาราง `[ระดับ (Critical>High>Medium>Low) | ไฟล์:บรรทัด | ปัญหา/จุดเบี่ยง | วิธีแก้]` (`≤ 15 รายการ`, รายการละ `≤ 1 บรรทัด`) + `diff`
- **`[TESTER]`:** สถานะ Req + ตาราง 4 มิติ `[มิติ (Req ขาดเทส / Branch ไม่ถึง / Edge Case / Req ขัดโค้ด) | ไฟล์:บรรทัด | รายละเอียด | การแก้ไข/เทส]` (`≤ 15 รายการ`, รายการละ `≤ 1 บรรทัด`)
- **`[DESIGN-*]` / `[API-*]`:** ตาราง `[สถานะ (เพิ่ม / แก้ / ขัดกัน-รอยืนยัน) | หมวดหมู่ | รายละเอียด | path อ้างอิง]` (`≤ 15 รายการ`, รายการละ `≤ 1 บรรทัด`)

## Rules (กฎกลางข้อเดียว — อ้างอิงจากทุกไฟล์)
แก้เฉพาะหน้า/ไฟล์ที่สั่ง (มีหน้าอื่นเกี่ยวให้ถามก่อน) | **ASK BEFORE FALLBACK:** ห้ามเขียน fallback ทุกชนิดก่อนถาม — จำเป็นต้องใช้ให้หยุดถามก่อนทุกครั้ง | **FAST = NO BUILD/NO BROWSER/LINE-RANGE ONLY** | ห้ามเดา API | ห้ามโหลด `references/` นอกตาราง | ห้ามลอกโค้ดทั้งไฟล์ (`ไฟล์:บรรทัด`+`diff`) | ห้ามเกริ่น/อธิบายยาว | คลุมเครือ/ขัดกัน -> แจ้งและถาม **1 คำถามที่จำเป็นที่สุด** แล้วหยุด
