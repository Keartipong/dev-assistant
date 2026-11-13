# สารบัญ: [1. กฎเหล็ก ZERO FALLBACK & จับ Key](#1-กฎเหล็ก-zero-fallback--จับ-key) | [2. กฎประสิทธิภาพ BE (Zero N+1 & Min Queries)](#2-กฎประสิทธิภาพ-be-zero-n1--min-queries) | [3. รายการตรวจของเดิม BE/FE](#3-รายการตรวจของเดิม-befe) | [4. หลักออกแบบใหม่เมื่อไม่มีของเดิม](#4-หลักออกแบบใหม่เมื่อไม่มีของเดิม)

> ยึดกฎกลางใน `SKILL.md#Rules`

## 1. กฎเหล็ก ZERO FALLBACK & จับ Key
1. **พิสูจน์ Key จริงก่อนเสมอ:** ก่อนเขียนโค้ดต่อ API (FE/BE) ต้องยิงเช็ค response จริง หรืออ่านโค้ด BE Controller/DTO/Schema ของ endpoint นั้นให้เห็น 1 path แน่นอน **ถ้าไม่เห็นโครงสร้างจริง ห้ามเดา ห้ามเขียนโค้ด ให้หยุดถามผู้ใช้ก่อนทันที**
2. **ห้าม Fallback ทุกรูปแบบโดยไม่ถาม (ZERO FALLBACK):**
   - **ห้ามเด็ดขาด (BANNED):**
     - ดักหลาย path ด้วย `if`: `if (Detail.value?.x !== undefined) ...; if (Detail.value?.sub?.x !== undefined) ...;`
     - ดักด้วย `??` / `||` / `?:`: `res?.data?.items ?? res?.items ?? []`, `Detail.value?.k || Detail.value?.sub?.k`, `val ?? ''`
     - ซ่อน error/ค่าขาดด้วย `catch`: `try { ... } catch { return [] }` หรือรับ query หลายชื่อ (`req.query.limit ?? req.query.per_page`)
   - **ที่ถูกต้อง (REQUIRED):** จับเฉพาะ 1 path ที่พิสูจน์แล้วตรงๆ (เช่น `return !!Detail.value?.direct_loan_cheque`) **หากเห็นว่าจำเป็นต้องมี fallback** (เช่น ข้อมูลเก่าไม่มี nested key, ค่าอาจเป็น null, หรือมีของเก่าดักหลาย path อยู่) **ห้ามเขียน fallback ลงไฟล์ก่อน — ให้หยุดถามผู้ใช้ 1 คำถามพร้อมระบุเหตุผลและ path สำรอง รอผู้ใช้ตอบตกลงจึงค่อยเขียน**
3. **แก้เฉพาะหน้าที่ระบุเท่านั้น:** เห็นหน้าอื่นใช้ API เดียวกัน/ต้องแก้ตาม ให้แจ้งและถามก่อน ห้ามตามไปแก้เอง
4. **ตรวจซ้ำด้วยสคริปต์:** รัน `node scripts/check_guard.js --summary <ไฟล์ที่แก้>` ก่อนตอบ หากขึ้น `BLOCKED` โดยผู้ใช้ยังไม่อนุญาต fallback นั้น ต้องลบทิ้งออกจากไฟล์ทันทีแล้วค่อยถามผู้ใช้ (ห้ามปล่อย fallback ค้างไว้ในโค้ด)

## 2. กฎประสิทธิภาพ BE (Zero N+1 & Min Queries — บังคับใช้ทุกครั้งที่เขียน/แก้ BE)
1. **Zero N+1 Query:** ห้ามวาง DB query/HTTP call ในลูป (`for`/`while`/`forEach`/`map`) ต้องรวบ ID ด้วย `WHERE id IN (...)`, `JOIN`, หรือ Eager Load แล้วจับคู่ผ่าน `Map` (`O(1)`)
2. **ลด Round-trip ให้เหลือน้อยที่สุด:**
   - รวบตารางด้วย `JOIN` / `CTE` ใน query เดียวเมื่อเหมาะสม
   - รัน query ที่ไม่พึ่งพากันแบบขนานด้วย `Promise.all([...])` ห้าม `await` เรียงต่อกัน
   - ใช้ **Bulk Insert / Bulk Update** คำสั่งเดียว ห้ามวนลูป `INSERT`/`UPDATE` ทีละแถว
3. **ผลักงานคำนวณไปที่ DB & ระบุคอลัมน์:** ใช้ `SUM`/`COUNT`/`GROUP BY`/`EXISTS` ใน DB, ระบุเฉพาะคอลัมน์ที่ใช้ (ห้าม `SELECT *`)
4. **Index-Friendly (SARGable):** ห้ามครอบฟังก์ชันบนคอลัมน์ใน `WHERE` และบังคับเพดาน `LIMIT` เสมอ

## 3. รายการตรวจของเดิม BE/FE
- **BE:** Key naming (`camelCase`/`snake_case`), field วันที่/id/status, JSON response/error format, layer (`route->controller->service->repo`), URL (`/api/v1/kebab-case-plural`), pagination/filter/sort, schema validation, auth/RBAC middleware, central error logging
- **FE:** ตำแหน่ง/รูปแบบ API client, `baseURL`/interceptor/token/retry, loading/error/empty state และ cache (`React Query`/`SWR`/Store), จุดแปลง key, ตำแหน่งเก็บ `type`/`interface`

## 4. หลักออกแบบใหม่เมื่อไม่มีของเดิม
เมื่อหัวข้อนั้นไม่มีของเดิม ใช้หลักประสิทธิภาพข้อ 2 (BE) + หลักด้านล่าง แล้วถาม 1 คำถามว่าจะบันทึกเข้า `.agents/docs/api-conventions.md` ไหม:
- **BE:** Key และ response/error มาตรฐานเดียว, pagination มีเพดาน (`maxLimit`/cursor), validate input ที่ขอบระบบ, แยก layer ชัดเจน
- **FE:** รวม API ไว้ client กลางจุดเดียว, ใช้ interceptor จัดการ token/error, caching/dedupe request, debounce ค้นหา, `AbortController` ยกเลิก request เก่า, จัดการ `loading`/`error`/`empty state` ครบ
