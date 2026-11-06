# สารบัญ: [1. กฎเขียนไฟล์ความจำ UI](#1-กฎเขียนไฟล์ความจำ-ui) | [2. แม่แบบ docs/design-system.md](#2-แม่แบบ-docsdesign-systemmd)

> ยึดกฎกลางใน `SKILL.md#Rules`

## 1. กฎเขียนไฟล์ความจำ UI
- บันทึกที่ `docs/design-system.md` ในโปรเจกต์ผู้ใช้
- รูปแบบ `key: value` ย่อ ความยาวรวม **ไม่เกิน 60 บรรทัด**
- อ้างอิง `path` ไฟล์ตัวอย่างแทนการวางโค้ดยาว
- หากพบหลายสไตล์ปนกัน ให้ใส่ในหมวด `conflicts` สถานะ `ขัดกัน-รอยืนยัน` ห้ามเลือกเอง

## 2. แม่แบบ docs/design-system.md
```markdown
# Project Design System
updated_at: YYYY-MM-DD

## 1. สีและธีม (colors_theme)
primary: [ค่าสี / CSS var / class เช่น #00509E, bg-blue-800]
secondary: [ค่าสี / class]
semantic: success=[ค่าสี], warning=[ค่าสี], danger=[ค่าสี]
surface_bg: page=[ค่าสี/class], card=[ค่าสี/class]
theme_ref: [path เช่น tailwind.config.js, src/assets/theme.css]

## 2. ตัวอักษร (typography)
font_family: [เช่น Sarabun, Inter]
page_title: [class/size เช่น text-xl font-bold text-gray-900]
section_title: [class/size เช่น text-lg font-semibold]
body_text: [class/size เช่น text-sm text-gray-700]

## 3. ระยะห่างและโครงสร้าง (spacing_layout)
breakpoints: [เช่น sm=640px, md=768px, lg=1024px, xl=1280px]
container: [เช่น p-6 bg-white rounded-lg shadow-sm]
grid_gap: [เช่น gap-4, space-y-4]
layout_ref: [path เช่น src/components/layout/MainLayout.vue]

## 4. รายการ Component และวิธีใช้ (components)
button: [component/class และวิธีใช้] | ref: [path]
input_select: [component/class และ validation] | ref: [path]
table: [component/props บังคับ เช่น pagination, loading] | ref: [path]
modal_dialog: [component/วิธีเรียกใช้] | ref: [path]

## 5. รูปแบบหน้าหลัก (page_patterns)
list_page: [โครงสร้าง filter + action + table] | ref: [path]
form_page: [โครงสร้างกลุ่มฟิลด์ + ปุ่มบันทึก/ยกเลิก] | ref: [path]
detail_page: [โครงสร้างส่วนหัว + การ์ดข้อมูล] | ref: [path]

## 6. รูปแบบ Error / Loading / Empty State (feedback_states)
loading: [เช่น Skeleton / Spin component] | ref: [path]
error: [เช่น Toast / Notification / Inline text] | ref: [path]
empty: [เช่น Empty state component] | ref: [path]

## 7. การตั้งชื่อ (naming_convention)
pages_views: [เช่น kebab-case.vue ใน src/views/]
components: [เช่น PascalCase.vue ใน src/components/]
styles: [เช่น Tailwind utility + scoped CSS]

## 8. รายการขัดกัน-รอยืนยัน (conflicts)
- [ไม่มี หรือ ระบุหัวข้อ: สไตล์ A (path) vs สไตล์ B (path) | สถานะ: ขัดกัน-รอยืนยัน]
```

