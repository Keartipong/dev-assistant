#!/usr/bin/env node
/**
 * สแกนโครงสร้าง UI, สี/ฟอนต์จาก CSS/Tailwind config และคัดไฟล์ตัวอย่างตัวแทน (สำหรับ [DESIGN-SCAN]/[DESIGN-UPDATE])
 * วิธีใช้: node scripts/scan_design.js [--summary] [--no-cache] [target_dir]
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const isSummary = args.includes('--summary');
const noCache = args.includes('--no-cache');
const rootDir = args.find(a => !a.startsWith('--')) || 'src';

const cacheDir = path.join(__dirname, '..', '.cache');
const cacheFile = path.join(cacheDir, 'scan_design.json');

function walkUi(dir, depth = 0, list = []) {
  if (!fs.existsSync(dir) || depth > 4) return list;
  for (const entry of fs.readdirSync(dir)) {
    if (['node_modules', '.git', 'dist', 'build', '.cache', '.agents'].includes(entry)) continue;
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) walkUi(full, depth + 1, list);
    else if (/\.(vue|tsx|jsx|css|scss|less)$/.test(entry)) list.push(full.replace(/\\/g, '/'));
  }
  return list;
}

const uiFiles = walkUi(rootDir);
const sig = `${uiFiles.length}:${uiFiles.slice(0, 30).join(',')}`;

if (!noCache && fs.existsSync(cacheFile)) {
  try {
    const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    if (cached._sig === sig) {
      console.log(JSON.stringify({ ...cached.data, cached: true }));
      process.exit(0);
    }
  } catch {}
}

let uiLibs = [];
if (fs.existsSync('package.json')) {
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    uiLibs = Object.keys(deps).filter(k => /ant-design|antd|tailwind|mui|vuetify|element|chakra|bootstrap|radix|shadcn|sweetalert/i.test(k));
  } catch {}
}

const twFile = ['tailwind.config.js', 'tailwind.config.ts', 'tailwind.config.cjs'].find(f => fs.existsSync(f)) || null;
const colorsFound = new Set();
const fontsFound = new Set();

const styleFiles = [...(twFile ? [twFile] : []), ...uiFiles.filter(f => /\.(css|scss)$/.test(f)).slice(0, 5)];
for (const sf of styleFiles) {
  const txt = fs.readFileSync(sf, 'utf8');
  (txt.match(/#[0-9a-fA-F]{6}\b|--[a-zA-Z0-9-]+:\s*#[0-9a-fA-F]{3,6}/g) || []).slice(0, 10).forEach(c => colorsFound.add(c));
  (txt.match(/font-family\s*:\s*([^;}\n]+)|fontFamily\s*:\s*\{([^}]+)\}/g) || []).slice(0, 5).forEach(f => fontsFound.add(f.replace(/\s+/g, ' ').trim().slice(0, 60)));
}

const pick = (re) => uiFiles.filter(f => re.test(f)).slice(0, 4);
const result = {
  scannedAt: new Date().toISOString().split('T')[0],
  uiLibs,
  tailwindConfig: twFile,
  tokensDetected: { colors: Array.from(colorsFound).slice(0, 8), fonts: Array.from(fontsFound).slice(0, 4) },
  counts: { totalUiFiles: uiFiles.length },
  representativeSamples: {
    layouts: pick(/layout|header|sidebar|nav/i),
    pagesList: pick(/list|index|table/i),
    pagesForm: pick(/form|create|edit|modal/i),
    pagesDetail: pick(/detail|view|profile/i),
    components: uiFiles.filter(f => /components\//i.test(f)).slice(0, 5)
  }
};

try {
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(cacheFile, JSON.stringify({ _sig: sig, data: result }), 'utf8');
} catch {}

console.log(isSummary ? JSON.stringify(result) : JSON.stringify(result, null, 2).split('\n').slice(0, 28).join('\n'));

