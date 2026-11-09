# สารบัญ: [1. กฎเหล็กต่อ API & จับ Key](#1-กฎเหล็กต่อ-api--จับ-key) | [2. กฎประสิทธิภาพ BE (Zero N+1 & Min Queries)](#2-กฎประสิทธิภาพ-be-zero-n1--min-queries) | [3. รายการตรวจของเดิม BE/FE](#3-รายการตรวจของเดิม-befe) | [4. หลักออกแบบใหม่เมื่อไม่มีของเดิม](#4-หลักออกแบบใหม่เมื่อไม่มีของเดิม)

> ยึดกฎกลางใน `SKILL.md#Rules`

## 1. กฎเหล็กต่อ API & จับ Key
- **ต้องเช็ค Key จริงของ API นั้นก่อนเสมอ:** เมื่อต่อ API ต้องยิงเช็ค response จริง หรือตรวจจากโค้ด BE/DTO/Schema ของ endpoint นั้นให้เห็นโครงสร้าง key จริงก่อนเขียนโค้ด ห้ามเดาโครงสร้างก้อนข้อมูลเอง
- **ห้ามดักหลาย Key เผื่อไว้เอง (Zero Speculative Fallback):** สั่งจับ key ไหน ให้เขียนจับแค่ path ของ key นั้นตัวเดียวตรงๆ (เช่น `Detail.value?.direct_loan_cheque`) **ห้ามเขียน `if` หรือ `||` / `??` ดักเผื่อหลายชั้นเองเด็ดขาด**
- **ถ้าต้องมี Fallback ต้องถามก่อนทุกครั้ง:** หากตรวจไม่พบโครงสร้าง API จริง หรือพบว่าข้อมูลจริงมีโอกาสอยู่ได้หลาย path จนต้องทำ fallback **ต้องหยุดและถามผู้ใช้ก่อนทุกครั้ง ห้ามเขียน fallback เองโดยพลการ**
- **แก้เฉพาะหน้าที่ระบุเท่านั้น:** หากเห็นว่าหน้าอื่นใช้ API เดียวกันหรือต้องแก้ตาม ห้ามตามไปแก้หน้าอื่นเอง ต้องแจ้งและถามผู้ใช้ก่อนเสมอ

## 2. กฎประสิทธิภาพ BE (Zero N+1 & Min Queries — บังคับใช้ทุกครั้งที่เขียน/แก้ BE)
1. **ห้ามเกิด N+1 Query เด็ดขาด:** ห้ามวาง DB query หรือ HTTP call ไว้ในลูป (`for`, `for..of`, `map`, `forEach`) ต้องรวบ ID ไปดึงครั้งเดียวด้วย `WHERE id IN (...)`, `JOIN`, หรือ Eager Load (`include`/`preload`) แล้วแปลงเป็น `Map`/`Set` เพื่อจับคู่ในหน่วยความจำด้วย `O(1)`
2. **ลดจำนวน Query (Round-trip) ให้เหลือน้อยที่สุด:**
   - รวบตารางที่เกี่ยวข้องด้วย `JOIN` หรือ `CTE` ใน query เดียวเมื่อเหมาะสม
   - หากมีหลาย query ที่ไม่พึ่งพาผลลัพธ์กัน (เช่น ดึง `rows` คู่กับ `count` หรือดึงข้อมูลคนละตาราง) ต้องรันขนานกันด้วย `Promise.all([...])` ห้าม `await` เรียงต่อกันทีละบรรทัด
   - การเพิ่ม/แก้ไขหลายรายการ ต้องใช้ **Bulk Insert / Bulk Update** คำสั่งเดียว ห้ามวนลูป `INSERT`/`UPDATE` ทีละแถว
3. **ผลักงานคำนวณไปที่ DB และดึงเฉพาะฟิลด์ที่ใช้:**
   - ใช้ `SUM`, `COUNT`, `GROUP BY`, `EXISTS` (ใช้ `EXISTS` แทน `COUNT(*) > 0`) ใน DB ห้ามดึงทุกแถวมา `.filter()` / `.reduce()` ในโค้ด
   - ระบุคอลัมน์ที่ใช้จริงเสมอ (`SELECT id, name`) ห้าม `SELECT *`
4. **เขียน Query ให้ใช้ Index ได้เต็มประสิทธิภาพ (SARGable):**
   - ห้ามครอบฟังก์ชันบนคอลัมน์ใน `WHERE` (เช่น ใช้ `created_at >= start AND created_at < end` แทน `DATE(created_at) = ...`) และบังคับเพดาน `LIMIT` เสมอ

## 3. รายการตรวจของเดิม BE/FE
### ฝั่ง BE:
- **Key Naming & Response:** รูปแบบชื่อ key (`camelCase` vs `snake_case`), ชื่อ field วันที่/id/status, โครงสร้าง JSON สำเร็จ/ผิดพลาด (`error_code`, `message`)
- **Layer & URL:** การแบ่งชั้น `route -> controller -> service -> repository`, คำนามพหูพจน์, versioning (`/api/v1/...`), `kebab-case`
- **Query, Auth & Logging:** รูปแบบ pagination, filter, sort, schema validation, auth/RBAC middleware, HTTP status code, central error handling

### ฝั่ง FE:
- **API Client & Interceptors:** พาธไฟล์เชื่อม API (`api client`/`service`/`hooks`), `baseURL`, การแนบ token, การดักจับ error และ retry
- **Cache, Key & Types:** การจัดการ loading/error/empty state, ระบบ cache, จุดแปลงชื่อ key, ตำแหน่งเก็บ `type`/`interface`

## 4. หลักออกแบบใหม่เมื่อไม่มีของเดิม
เมื่อโปรเจกต์ยังไม่มีรูปแบบในหัวข้อนั้น ให้ใช้หลักในหัวข้อที่ 2 (สำหรับ BE) ร่วมกับหลักต่อไปนี้ แล้วถาม 1 คำถามว่าจะบันทึกเข้า `.agents/docs/api-conventions.md` ไหม:
- **ฝั่ง BE:** ใช้ชื่อ key และโครงสร้าง response/error มาตรฐานเดียวทั้งระบบ, บังคับเพดาน pagination (`maxLimit` หรือ cursor), validate input ที่ขอบระบบ, แยก layer ชัดเจน, ยึดกฎหัวข้อที่ 2 (Zero N+1 & Min Queries) อย่างเคร่งครัด
- **ฝั่ง FE:** รวมการเรียก API ไว้ที่ client กลางที่เดียว, ใช้ interceptor จัดการ token/error, ใช้ caching/dedupe request, ทำ debounce ช่องค้นหา, ใช้ `AbortController` ยกเลิก request เก่า, จัดการ `loading`/`error`/`empty state` ครบ
