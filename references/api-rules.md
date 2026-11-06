# สารบัญ: [1. รายการตรวจของเดิม BE](#1-รายการตรวจของเดิม-be) | [2. รายการตรวจของเดิม FE](#2-รายการตรวจของเดิม-fe) | [3. หลักออกแบบใหม่เมื่อไม่มีของเดิม](#3-หลักออกแบบใหม่เมื่อไม่มีของเดิม)

> ยึดกฎกลางใน `SKILL.md#Rules`

## 1. รายการตรวจของเดิม BE
- **Key Naming:** รูปแบบชื่อ key ใน request/response (`camelCase` vs `snake_case`), ชื่อ field วันที่ (`createdAt`/`created_at`), `id`, `status`
- **Response & Error Format:** โครงสร้าง JSON สำเร็จ/ผิดพลาด, รหัส `error_code`, `message`
- **File & Layer Structure:** การแบ่งชั้น `route -> controller -> service -> repository` (หรือรูปแบบอื่นที่ใช้จริง)
- **Endpoint URL:** คำนามพหูพจน์, versioning (`/api/v1/...`), การคั่นคำ (`kebab-case`)
- **Query & Middleware:** รูปแบบ pagination, filter, sort, schema validation, auth/RBAC middleware, HTTP status code
- **Naming & Logging:** การตั้งชื่อไฟล์/ฟังก์ชัน และรูปแบบ central error handling / logging

## 2. รายการตรวจของเดิม FE
- **API Client Location & Style:** พาธไฟล์เชื่อม API (`api client` / `service` / `hooks`) และรูปแบบการเขียน
- **HTTP Config & Interceptors:** การตั้ง `baseURL`, request/response interceptor, การแนบ token, การจัดการ error และ retry
- **Loading/Error & Cache:** การจัดการ loading/error/empty state และระบบ cache (`React Query`, `SWR`, store หรือแบบเดิม)
- **Key Transformation:** จุดแปลงชื่อ key (เช่น `snake_case` จาก BE เป็น `camelCase` ใน FE) หรือใช้ตรงกัน
- **Naming & Types:** การตั้งชื่อไฟล์/ฟังก์ชัน และตำแหน่งเก็บ `type`/`interface`

## 3. หลักออกแบบใหม่เมื่อไม่มีของเดิม
เมื่อโปรเจกต์ยังไม่มีรูปแบบในหัวข้อนั้น ให้ใช้หลักประสิทธิภาพสูงสุดนี้ แล้วถาม 1 คำถามว่าจะบันทึกเข้า `.agents/docs/api-conventions.md` ไหม:
- **ฝั่ง BE:**
  - ใช้ชื่อ key รูปแบบเดียวทั้งระบบ และโครงสร้าง response/error code มาตรฐานเดียวกันทุก endpoint
  - บังคับเพดาน pagination เสมอ (cursor หรือ `limit/offset` ที่มี `maxLimit`)
  - ส่งเฉพาะ field ที่จำเป็น (ห้าม `SELECT *` หรือส่งฟิลด์ลับ)
  - Validate input ที่ขอบระบบก่อนเข้าถึง logic และแยก layer (`route -> controller -> service -> repository`) ชัดเจน
  - ป้องกัน N+1 query (ใช้ batch/eager load), ใส่ index คอลัมน์ค้นหา/เรียงลำดับ, รองรับ caching/compression ตามความเหมาะสม
- **ฝั่ง FE:**
  - รวมการเรียก API ไว้ที่ client กลางที่เดียว (ห้าม `fetch`/เรียกกระจายในแต่ละ component)
  - ใช้ interceptor กลางจัดการแนบ token และดักจับ error
  - ใช้ caching และ deduplicate request เพื่อไม่เรียก API ซ้ำโดยไม่จำเป็น
  - ทำ debounce ช่องค้นหา และใช้ `AbortController` ยกเลิก request ที่ไม่ใช้แล้วเมื่อเปลี่ยนหน้า/พิมพ์ใหม่
  - จัดการ `loading`, `error`, `empty state` ครบทุกจุด และรวม `type` ของ request/response ไว้ที่เดียว

