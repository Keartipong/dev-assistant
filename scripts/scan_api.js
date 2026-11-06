#!/usr/bin/env node
/**
 * สแกนโครงสร้าง API ฝั่ง BE/FE ดึง route/endpoint และนับสถิติชื่อ key (camelCase vs snake_case)
 * วิธีใช้: node scripts/scan_api.js [--summary] [--no-cache] [target_dir]
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const isSummary = args.includes('--summary');
const noCache = args.includes('--no-cache');
const rootDir = args.find(a => !a.startsWith('--')) || '.';

const cacheDir = path.join(process.cwd(), '.cache');
const cacheFile = path.join(cacheDir, 'scan_api.json');

function walkApi(dir, depth = 0, list = []) {
  if (!fs.existsSync(dir) || depth > 4) return list;
  for (const entry of fs.readdirSync(dir)) {
    if (['node_modules', '.git', 'dist', 'build', '.cache', 'tests', 'scripts'].includes(entry)) continue;
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) walkApi(full, depth + 1, list);
    else if (/\.(js|ts|py|go|php|java)$/.test(entry)) list.push(full.replace(/\\/g, '/'));
  }
  return list;
}

const allCodeFiles = walkApi(rootDir);
const apiFiles = allCodeFiles.filter(f => /(api|routes|controllers|services|endpoints|http|client)/i.test(f));
const sig = `${apiFiles.length}:${apiFiles.slice(0, 30).join(',')}`;

if (!noCache && fs.existsSync(cacheFile)) {
  try {
    const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    if (cached._sig === sig) {
      console.log(JSON.stringify({ ...cached.data, cached: true }));
      process.exit(0);
    }
  } catch {}
}

let camelCount = 0;
let snakeCount = 0;
const endpoints = [];
const camelSamples = new Set();
const snakeSamples = new Set();

const routeRe = /\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
const keyRe = /['"]?([a-zA-Z0-9_]+)['"]?\s*:/g;
const ignoreKeys = new Set(['http', 'https', 'true', 'false', 'null', 'headers', 'params', 'data', 'method', 'url', 'status', 'message']);

for (const file of apiFiles.slice(0, 40)) {
  const txt = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = routeRe.exec(txt)) !== null) {
    if (endpoints.length < 12) endpoints.push(`${m[1].toUpperCase()} ${m[2]} (${file})`);
  }
  while ((m = keyRe.exec(txt)) !== null) {
    const k = m[1];
    if (ignoreKeys.has(k)) continue;
    if (/^[a-z]+(?:[A-Z][a-z0-9]+)+$/.test(k)) {
      camelCount++;
      if (camelSamples.size < 6) camelSamples.add(k);
    } else if (/^[a-z0-9]+(?:_[a-z0-9]+)+$/.test(k)) {
      snakeCount++;
      if (snakeSamples.size < 6) snakeSamples.add(k);
    }
  }
}

const total = camelCount + snakeCount;
let keyStyle = 'NONE_DETECTED';
if (total > 0) {
  const ratio = camelCount / total;
  keyStyle = (ratio >= 0.25 && ratio <= 0.75) ? 'MIXED_CONFLICT' : (camelCount > snakeCount ? 'camelCase' : 'snake_case');
}

const result = {
  scannedAt: new Date().toISOString().split('T')[0],
  apiFilesCount: apiFiles.length,
  samples: {
    beRoutesControllers: apiFiles.filter(f => /(route|controller|endpoint)/i.test(f)).slice(0, 5),
    beServices: apiFiles.filter(f => /service/i.test(f)).slice(0, 4),
    feClients: apiFiles.filter(f => /(src\/api|http|client)/i.test(f)).slice(0, 5)
  },
  sampleEndpoints: endpoints,
  keyStats: { camelCount, snakeCount, keyStyle, camelSamples: [...camelSamples], snakeSamples: [...snakeSamples] }
};

try {
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(cacheFile, JSON.stringify({ _sig: sig, data: result }), 'utf8');
} catch {}

console.log(isSummary ? JSON.stringify(result) : JSON.stringify(result, null, 2).split('\n').slice(0, 28).join('\n'));

