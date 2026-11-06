# สารบัญ: [1. Critical](#1-critical) | [2. High](#2-high) | [3. Medium & Low](#3-medium--low)

> ยึดกฎกลางใน `SKILL.md#Rules` เรียงผลตรวจ `Critical > High > Medium > Low` (`≤ 15 รายการ`, รายการละ `≤ 1 บรรทัด`)

## 1. Critical
- **Hardcoded Secrets:** ฝัง API Key, Password, JWT Secret, Private Key, Token ในโค้ดหรือ commit `.env`
- **Injection:** ต่อ string สร้าง SQL/NoSQL/OS Command/LDAP query โดยไม่ใช้ Parameterized Query หรือ Prepared Statement
- **XSS / Code Execution:** ใช้ `eval()`, `innerHTML`, `v-html`, `dangerouslySetInnerHTML` กับข้อมูลผู้ใช้โดยไม่ sanitize
- **Broken Auth & Access Control:** ข้าม middleware ตรวจ token/role, ตรวจสิทธิ์เฉพาะฝั่ง FE, เกิด IDOR (แก้ ID เข้าถึงข้อมูลผู้อื่นได้)

## 2. High
- **Sensitive Data Exposure:** พิมพ์ token, รหัสผ่าน, ข้อมูลส่วนบุคคล (PII/เลขบัญชี/บัตรประชาชน) ลง log หรือส่งออกใน error response
- **Missing Boundary Validation:** ไม่ตรวจ type, ขนาด, ขอบเขตค่า (เช่น ยอดติดลบ, array ใหญ่เกินเพดาน) หรือชนิดไฟล์อัปโหลดที่ขอบระบบ
- **Race Condition / Double Submit:** งานตัดเงิน/อนุมัติ/สร้างรายการสำคัญไม่มี lock, transaction, หรือ idempotency key ป้องกันกดซ้ำ
- **CSRF / Insecure CORS:** เปิด `Access-Control-Allow-Origin: *` ร่วมกับ credentials หรือไร้การป้องกัน CSRF ใน cookie auth

## 3. Medium & Low
- **Unhandled Error / Silent Catch:** `async/await` ไร้ `try/catch`, กลืน error เงียบ (`catch {}`), หรือโยน raw stack trace ออก API
- **Resource & Memory Leak:** เปิด connection, stream, timer (`setInterval`), event listener แล้วไม่ปิดเมื่อจบงาน/unmount
- **Unbounded Query / N+1:** ดึงข้อมูลไร้เพดาน (`limit`), ยิง query ในลูป (N+1), หรือไม่ตั้ง timeout ของการเรียก API ภายนอก
- **Hardcoded Config:** ฝัง URL, port, timeout หรือค่าเฉพาะสภาพแวดล้อมไว้ในโค้ดแทนการอ่านจาก config/env

