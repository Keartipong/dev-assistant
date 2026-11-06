#!/usr/bin/env node
/**
 * สแกนหา Hardcoded Secrets, Token, SQL Injection เบื้องต้น และ XSS ในไฟล์เป้าหมาย (ผลลัพธ์ไม่เกิน 30 บรรทัด)
 * วิธีใช้: node scripts/scan_secrets.js [--summary] [--no-cache] [path1] [path2]
 */
const fs = require('fs');
const path = require('path');

const rawArgs = process.argv.slice(2);
const isSummary = rawArgs.includes('--summary');
const noCache = rawArgs.includes('--no-cache');
const targets = rawArgs.filter(a => !a.startsWith('--'));
const scanPaths = targets.length ? targets : ['src', 'backend', 'api', 'app'];

const cacheDir = path.join(process.cwd(), '.cache');
const cacheFile = path.join(cacheDir, 'scan_secrets.json');

const RULES = [
  { id: 'HARDCODED_SECRET', sev: 'Critical', re: /(api[_-]?key|secret|password|passwd|private[_-]?key|access[_-]?token)\s*[:=]\s*['"][A-Za-z0-9_\-/.+=]{8,}['"]/i },
  { id: 'JWT_OR_BEARER', sev: 'Critical', re: /eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/ },
  { id: 'SQL_STRING_CONCAT', sev: 'Critical', re: /(SELECT|INSERT|UPDATE|DELETE)\s+.*(\+\s*[a-zA-Z0-9_.]|\$\{[a-zA-Z0-9_.]+\})/i },
  { id: 'RAW_HTML_XSS', sev: 'High', re: /(v-html|innerHTML|dangerouslySetInnerHTML)\s*=/ },
  { id: 'SENSITIVE_LOG', sev: 'High', re: /console\.(log|info|debug)\s*\([^)]*(token|password|secret|citizen|card_no|bank_account)/i }
];

function walk(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  const st = fs.statSync(dir);
  if (st.isFile()) return [dir];
  for (const item of fs.readdirSync(dir)) {
    if (['node_modules', '.git', 'dist', 'build', '.cache', 'tests'].includes(item)) continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) walk(full, list);
    else if (/\.(js|ts|jsx|tsx|vue|py|go|php|java|env)$/.test(item)) list.push(full.replace(/\\/g, '/'));
  }
  return list;
}

const files = scanPaths.flatMap(p => walk(p));
const sig = files.slice(0, 100).map(f => `${f}:${Math.floor(fs.statSync(f).mtimeMs)}`).join('|');

if (!noCache && fs.existsSync(cacheFile)) {
  try {
    const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    if (cached._sig === sig) {
      const out = { ...cached.data, cached: true };
      console.log(isSummary ? JSON.stringify(out) : JSON.stringify(out, null, 2));
      process.exit(0);
    }
  } catch {}
}

const findings = [];
for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) return;
    for (const r of RULES) {
      if (r.re.test(trimmed) && findings.length < 15) {
        findings.push({ sev: r.sev, rule: r.id, loc: `${file}:${i + 1}`, code: trimmed.slice(0, 80) });
      }
    }
  });
}

const result = { scannedFiles: files.length, totalFindings: findings.length, findings };
try {
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(cacheFile, JSON.stringify({ _sig: sig, data: result }), 'utf8');
} catch {}

console.log(isSummary ? JSON.stringify(result) : JSON.stringify(result.findings.slice(0, 10)));

