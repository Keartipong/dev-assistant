# สารบัญ: [1. กฎเขียนไฟล์ความจำ API](#1-กฎเขียนไฟล์ความจำ-api) | [2. แม่แบบ .agents/docs/api-conventions.md](#2-แม่แบบ-agentsdocsapi-conventionsmd)

> ยึดกฎกลางใน `SKILL.md#Rules`

## 1. กฎเขียนไฟล์ความจำ API
- บันทึกที่ `.agents/docs/api-conventions.md` ในโปรเจกต์ผู้ใช้
- รูปแบบ `key: value` ย่อ ความยาวรวม **ไม่เกิน 60 บรรทัด**
- อ้างอิง `path` ไฟล์ตัวอย่างแทนการวางโค้ดยาว
- หากพบหลายสไตล์ปนกัน ให้ใส่ในหมวด `conflicts` สถานะ `ขัดกัน-รอยืนยัน` ห้ามเลือกเอง

## 2. แม่แบบ .agents/docs/api-conventions.md
```markdown
# Project API Conventions
updated_at: YYYY-MM-DD

## 1. มาตรฐานฝั่ง Backend (BE)
key_naming: [camelCase หรือ snake_case | ฟิลด์วันที่: created_at, id: id, status: status]
response_success: [เช่น { status: "success", data, meta }] | ref: [path]
response_error: [เช่น { status: "error", error_code, message } + HTTP status] | ref: [path]
architecture_layers: [เช่น route -> controller -> service -> repository] | ref: [path]
url_pattern: [เช่น /api/v1/kebab-case-plural] | ref: [path]
pagination_filter_sort: [เช่น ?page=1&limit=20&sort_by=created_at&order=desc] | ref: [path]
auth_validation: [เช่น JWT middleware + Zod/Joi schema ที่ขอบระบบ] | ref: [path]
naming_error_logging: [รูปแบบชื่อไฟล์/ฟังก์ชัน + central error handler/logger] | ref: [path]

## 2. มาตรฐานฝั่ง Frontend (FE)
api_client_location: [ตำแหน่งและรูปแบบ เช่น src/api/[domain].ts เรียกผ่าน httpClient] | ref: [path]
base_url_interceptors: [การตั้งค่า baseURL, แนบ Bearer token, จัดการ 401/error, retry] | ref: [path]
state_caching: [การจัดการ loading/error/empty state และ cache เช่น React Query/Pinia] | ref: [path]
key_transformation: [ตรงตาม BE หรือแปลง snake_case <-> camelCase ที่จุดไหน] | ref: [path]
types_naming: [ชื่อฟังก์ชันเรียก API และตำแหน่งเก็บ type/interface เช่น src/types/] | ref: [path]

## 3. รายการขัดกัน-รอยืนยัน (conflicts)
- [ไม่มี หรือ ระบุหัวข้อ: รูปแบบ A (path) vs รูปแบบ B (path) | สถานะ: ขัดกัน-รอยืนยัน]
```

