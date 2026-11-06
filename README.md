# dev-assistant

AI Skill มาตรฐาน Agent Skills สำหรับนักพัฒนาซอฟต์แวร์ (Developer) ที่รวมผู้ช่วยตรวจสอบความรอบคอบไว้ 5 โหมดในตัวเดียว
เน้นแก้โค้ดตรงจุดแบบประหยัด Token ด้วยโหมด `FAST` เป็นค่าเริ่มต้น พร้อมบังคับใช้มาตรฐาน UI (`.agents/docs/design-system.md`), มาตรฐาน API (`.agents/docs/api-conventions.md`) และตรวจความปลอดภัยขั้นต่ำให้อัตโนมัติ

---

## คุณสมบัติ: 5 โหมดการทำงาน (รวมความต่างระหว่าง FAST และ DEEP)

1. **`FAST` (ค่าเริ่มต้น เปิดตลอดเมื่อไม่ระบุแท็ก):**
   แก้โค้ดเฉพาะจุดที่สั่งอย่างรวดเร็วและประหยัด Token ที่สุด อ่านเฉพาะฟังก์ชันที่เกี่ยวข้อง ไม่แตะไฟล์นอกขอบเขต ตรวจความปลอดภัยขั้นต่ำเสมอ (ไม่ฝัง secrets, ไม่ต่อ string เป็น query, ไม่ข้าม auth/validation) และตรวจมาตรฐาน UI/API แบบเงียบ (แจ้งเฉพาะเมื่อเบี่ยงจากของเดิม) สรุปผลสั้นๆ `1-3 บรรทัด + diff`
   - **การสลับเข้า `DEEP` ชั่วคราว (`[DEEP]` หรือ `[DEEP+TEST]`):** เมื่อต้องการให้ตรวจละเอียดเฉพาะงานนั้น สามารถสั่ง `[DEEP]` (หรือพิมพ์คำว่า *"ตรวจละเอียด"* / *"ตรวจให้รอบคอบ"* / *"ตรวจทุกอย่าง"*) เพื่อให้ AI แก้ตามสั่งพร้อมรันการตรวจสอบระดับ `SENIOR DEV` เต็มรูปแบบ (อ่านไฟล์ที่เรียกใช้/ถูกเรียกใช้, โหลด `security-checklist.md`, ตรวจ edge case, รายงานผลเป็นตาราง) หรือใช้ `[DEEP+TEST]` เพื่อพ่วงโหมด `TESTER` ต่อท้าย เมื่องานนั้นเสร็จจะกลับสู่โหมด `FAST` อัตโนมัติ
2. **`SENIOR DEV` (`[SENIOR DEV]`):**
   ช่วยเขียนโค้ดตาม convention เดิมของโปรเจกต์ วิเคราะห์หาสาเหตุบัก (Root Cause) และรีวิวความปลอดภัยเชิงลึกตาม `references/security-checklist.md`
3. **`TESTER` (`[TESTER]`):**
   รับ Input 3 ส่วน (Requirement, โค้ด, เทสที่มี) เพื่อวิเคราะห์ช่องว่าง 4 มิติ ได้แก่ (1) Req ที่ยังไม่มีเทส (2) โค้ดที่เทสไม่ถึง (branch/error path) (3) Edge case ที่ขาด (4) จุดที่ Req กับโค้ดไม่ตรงกัน รวมถึงช่วยเขียนเอกสารจากโค้ดและตรวจเอกสารเทียบโค้ด
4. **`DESIGN` (`[DESIGN-SCAN]`, `[DESIGN-UPDATE]` และทำงานอัตโนมัติเมื่อแตะ UI):**
   สแกนและจำรูปแบบ UI ของโปรเจกต์ไว้ใน `.agents/docs/design-system.md` บังคับให้ทุกงานที่แตะ UI ทำตามรูปแบบเดิมเสมอ (ยกเว้นสั่งว่า *"เป็น design ใหม่"*)
5. **`API` (`[API-SCAN]`, `[API-UPDATE]` และทำงานอัตโนมัติเมื่อแตะ API ทั้ง BE/FE):**
   สแกนและจำมาตรฐาน API ทั้งฝั่ง Backend และ Frontend ไว้ใน `.agents/docs/api-conventions.md` บังคับใช้โครงสร้างเดิมเสมอ หากเรื่องใดยังไม่มีของเดิมจะออกแบบตามหลักประสิทธิภาพสูงสุดใน `references/api-rules.md`

---

## ติดตั้ง

> **หมายเหตุสำคัญ:**
> - กรุณาตรวจสอบพาธโฟลเดอร์สำหรับติดตั้ง Skill กับเอกสารของเครื่องมือ AI ที่คุณใช้งานอีกครั้ง (เช่น `~/.claude/skills/`, `.claude/skills/`, หรือโฟลเดอร์ที่เครื่องมือรองรับ)
> - หากติดตั้งผ่านคำสั่ง `curl | bash` หรือ `irm | iex` แนะนำให้เปิดอ่านโค้ดใน `install.sh` / `install.ps1` ก่อนรันเสมอเพื่อความปลอดภัย

### (ก) ติดตั้งทั้งเครื่อง (Global Installation)
```bash
git clone https://github.com/Keartipong/dev-assistant.git ~/.claude/skills/dev-assistant
```

### (ข) ติดตั้งเฉพาะโปรเจกต์ (Project-level Installation)
รันในโฟลเดอร์รากของโปรเจกต์:
```bash
# สำหรับ Antigravity / Agent Skills (.agents)
git clone https://github.com/Keartipong/dev-assistant.git .agents/skills/dev-assistant

# หรือสำหรับ Claude Code (.claude)
git clone https://github.com/Keartipong/dev-assistant.git .claude/skills/dev-assistant
```

### (ค) ติดตั้งหรืออัปเดตด้วยสคริปต์อัตโนมัติ
- **macOS / Linux (`install.sh`):**
  ```bash
  # ติดตั้งหรืออัปเดตไปที่ .agents/skills/dev-assistant (เฉพาะโปรเจกต์)
  bash install.sh .agents/skills/dev-assistant

  # หรือติดตั้งไปที่ค่าเริ่มต้นทั้งเครื่อง (~/.claude/skills/dev-assistant)
  bash install.sh
  ```
- **Windows PowerShell (`install.ps1`):**
  ```powershell
  # ติดตั้งหรืออัปเดตไปที่ .agents\skills\dev-assistant (เฉพาะโปรเจกต์)
  .\install.ps1 -TargetDir ".agents\skills\dev-assistant"

  # หรือติดตั้งไปที่ค่าเริ่มต้นทั้งเครื่อง (~/.claude/skills/dev-assistant)
  .\install.ps1
  ```

### (ง) อัปเดตเป็นเวอร์ชันล่าสุด (Update)
```bash
# กรณีติดตั้งไว้ในโปรเจกต์ (.agents/skills/dev-assistant)
git -C .agents/skills/dev-assistant pull --ff-only

# กรณีติดตั้งไว้ทั้งเครื่อง (~/.claude/skills/dev-assistant)
git -C ~/.claude/skills/dev-assistant pull --ff-only

# กรณีโฟลเดอร์ไม่มี .git (เช่น คัดลอกไฟล์มาวาง) ให้รันสคริปต์เพื่อดึงอัปเดตทับได้ทันที:
bash .agents/skills/dev-assistant/install.sh .agents/skills/dev-assistant
# หรือบน Windows PowerShell:
.\.agents\skills\dev-assistant\install.ps1 -TargetDir ".agents\skills\dev-assistant"
```

### (จ) ถอนการติดตั้ง
ลบโฟลเดอร์ที่ติดตั้งออกโดยตรง:
```bash
# macOS / Linux
rm -rf .agents/skills/dev-assistant ~/.claude/skills/dev-assistant

# Windows PowerShell
Remove-Item -Recurse -Force ".agents\skills\dev-assistant"
```

### (ฉ) สำหรับผู้ใช้ Claude.ai หรือแอปพลิเคชันเดสก์ท็อป
1. บีบอัดไฟล์ในโฟลเดอร์ `dev-assistant` (ประกอบด้วย `SKILL.md`, `references/`, `scripts/`) เป็นไฟล์ `.zip`
2. เปิดหน้า **Settings** (หรือ **Project Knowledge / Customizations / Skills**) ใน Claude.ai หรือแอปที่ใช้งาน
3. อัปโหลดไฟล์ `.zip` เพื่อเปิดใช้งาน Skill

---

## ความต้องการของระบบ (System Requirements)

- **Git:** `git >= 2.20` (สำหรับการติดตั้ง อัปเดต และใช้สคริปต์ดึง `git diff`)
- **Node.js Runtime:** `Node.js >= 18.0.0` (สำหรับรันสคริปต์อัตโนมัติใน `scripts/*.js` โดยใช้เฉพาะ Built-in Modules มาตรฐาน ไม่ต้อง `npm install` แพ็กเกจเสริม)

---

## วิธีใช้

ใส่แท็กโหมดไว้ต้นข้อความคำสั่ง (หรือเว้นแท็กเพื่อใช้โหมด `FAST` อัตโนมัติ):

| แท็กคำสั่ง | การทำงาน | ตัวอย่างคำสั่งใช้งานจริง |
| :--- | :--- | :--- |
| *(ไม่ใส่แท็ก = `FAST`)* | แก้โค้ดเฉพาะจุดตามสั่ง เร็วและประหยัด Token ที่สุด | `แก้ฟังก์ชัน calculateDiscount ใน src/utils/price.ts ให้ปัดเศษทศนิยม 2 ตำแหน่ง` |
| `[DEEP]` | แก้ตามสั่ง + ตรวจละเอียดระดับ Senior Dev ชั่วคราว 1 งาน | `[DEEP] แก้ logic การตัดสต็อกใน src/services/orderService.ts และตรวจละเอียดว่ามีจุดเสี่ยง race condition ไหม` |
| `[DEEP+TEST]` | รัน `[DEEP]` แล้วต่อด้วยโหมด `TESTER` ตรวจความครบถ้วนของเทส | `[DEEP+TEST] เพิ่มเงื่อนไขเช็ควันหมดอายุคูปองใน src/services/coupon.ts พร้อมตรวจเทสใน tests/coupon.spec.ts` |
| `[SENIOR DEV]` | เขียนโค้ดตาม convention เดิม หาสาเหตุบัก และรีวิวช่องโหว่ความปลอดภัย | `[SENIOR DEV] รีวิวความปลอดภัยและหาสาเหตุบัก memory leak ในไฟล์ src/workers/syncWorker.ts` |
| `[TESTER]` | เทียบ Requirement-Code-Test 4 มิติ หรือเขียน/ตรวจเอกสารเทียบโค้ด | `[TESTER] เทียบ Requirement ด้านล่างกับโค้ด src/auth/login.ts และเทส tests/login.spec.ts ว่าขาดเคสไหนบ้าง` |
| `[BOTH]` | รัน `SENIOR DEV` แล้วให้ `TESTER` ตรวจซ้ำต่อเนื่องในคำตอบเดียว | `[BOTH] เขียนฟังก์ชันโอนแต้มสะสมใน src/services/point.ts และตรวจเทียบกับ Requirement ที่แนบมา` |
| `[DESIGN-SCAN]` | สแกนโปรเจกต์ครั้งแรกเพื่อสร้างไฟล์ความจำ `.agents/docs/design-system.md` | `[DESIGN-SCAN] สแกนรูปแบบ UI ของโปรเจกต์นี้แล้วสร้างไฟล์ .agents/docs/design-system.md` |
| `[DESIGN-UPDATE]` | อัปเดต `.agents/docs/design-system.md` แบบเพิ่ม/แก้ โดยไม่ลบของเดิมเอง | `[DESIGN-UPDATE] สแกนการเปลี่ยนแปลง UI ล่าสุดแล้วอัปเดต .agents/docs/design-system.md` |
| `[API-SCAN]` | สแกนโปรเจกต์ครั้งแรกเพื่อสร้างไฟล์ความจำ `.agents/docs/api-conventions.md` | `[API-SCAN] สแกนมาตรฐาน API ทั้งฝั่ง BE และ FE แล้วสร้างไฟล์ .agents/docs/api-conventions.md` |
| `[API-UPDATE]` | อัปเดต `.agents/docs/api-conventions.md` แบบเพิ่ม/แก้ โดยถามยืนยันจุดที่ขัดกัน | `[API-UPDATE] อัปเดตมาตรฐาน API ใน .agents/docs/api-conventions.md จากโมดูลชำระเงินที่เพิ่งเพิ่มใหม่` |

---

## วิธีทำงานของ `.agents/docs/design-system.md` และ `.agents/docs/api-conventions.md`

- **ตำแหน่งจัดเก็บ:** ไฟล์ทั้งสองถูกสร้างและเก็บไว้ในโฟลเดอร์ `.agents/docs/` **ภายในโปรเจกต์ของผู้ใช้** (ไม่ได้อยู่ใน repo ของ Skill นี้) และไฟล์แคชของสคริปต์จะถูกเก็บไว้ใน `.agents/skills/dev-assistant/.cache/` เพื่อให้ทุกอย่างรวมอยู่ใน `.agents/` ที่เดียว ไม่รกโฟลเดอร์รากของโปรเจกต์
- **การสร้างและอัปเดต:**
  - สั่ง `[DESIGN-SCAN]` หรือ `[API-SCAN]` ในครั้งแรกเพื่อให้สคริปต์ (`scripts/scan_design.js` / `scripts/scan_api.js`) ดึงข้อมูลโครงสร้างจริงและสุ่มอ่านไฟล์ตัวแทน 3-5 ไฟล์ แล้วสรุปเป็นรูปแบบ `key: value` กระชับ (ไม่เกิน 60 บรรทัด)
  - สั่ง `[DESIGN-UPDATE]` หรือ `[API-UPDATE]` เมื่อโปรเจกต์มีการขยับขยาย โดย Skill จะอัปเดตแบบ **"เพิ่ม/แก้"** เท่านั้น ห้ามลบของเดิมเอง และหากพบหลายสไตล์ปนกันจะขึ้นสถานะ `ขัดกัน-รอยืนยัน` เพื่อให้ผู้ใช้ตัดสินใจ
- **การบังคับใช้อัตโนมัติ:** ทุกครั้งที่สั่งงานที่แตะ UI หรือ API (ไม่ว่าจะอยู่ในโหมด `FAST` หรือโหมดอื่น) Skill จะโหลดเฉพาะไฟล์ความจำที่เกี่ยวข้องขึ้นมาตรวจสอบโดยอัตโนมัติ

---

## กลไกประหยัด Token

1. **Architecture แบบ Router (`SKILL.md` ≤ 60 บรรทัด):** `SKILL.md` ทำหน้าที่เป็นตารางนำทาง (Selective Loading Router) เท่านั้น ไม่โหลดรายละเอียดโหมดอื่นเข้า Context จนกว่าจะถูกเรียกใช้
2. **Selective Reference Loading:** แยกกฎและแม่แบบไว้ใน `references/` (แต่ละไฟล์ ≤ 80 บรรทัด มีสารบัญบรรทัดแรก เขียนแบบ Telegraphic) และโหลดเฉพาะไฟล์ที่งานนั้นต้องใช้จริง
3. **Scripts First & Session Caching:** ใช้สคริปต์ใน `scripts/` ตรวจ Stack, สแกน Secrets, ดึง `git diff`, และสแกนโครงสร้าง UI/API แทนการให้ AI อ่านไฟล์ทั้งโปรเจกต์ พร้อมแคชผลลง `.cache/` และพิมพ์ผลลัพธ์แบบย่อ (`--summary`)
4. **Targeted Read & Diff-Only Output:** ค้นหาพิกัดก่อนอ่านเฉพาะฟังก์ชันที่เกี่ยวข้อง และตอบกลับเฉพาะข้อความสรุปสั้นๆ พร้อม `diff` เฉพาะจุดที่แก้ ไม่ลอกโค้ดทั้งไฟล์ซ้ำ

---

## การรันเคสทดสอบ (Test Cases)

ดูชุดทดสอบครบทั้ง 5 โหมด (ระดับง่าย / ปานกลาง / มีกับดัก) พร้อมข้อมูลจำลองและผลลัพธ์ที่คาดหวังได้ที่ไฟล์ [`tests/cases.md`](tests/cases.md)

---

## License

เผยแพร่ภายใต้สัญญาอนุญาต [MIT License](LICENSE)

