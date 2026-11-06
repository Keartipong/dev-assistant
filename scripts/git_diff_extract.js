#!/usr/bin/env node
/**
 * ดึงเฉพาะรายการไฟล์และบรรทัดที่แก้ไขจาก git diff แบบย่อ (ไม่เกิน 30 บรรทัด) พร้อมแคช
 * วิธีใช้: node scripts/git_diff_extract.js [--summary] [target_file]
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const isSummary = args.includes('--summary');
const targetFile = args.find(a => !a.startsWith('--'));
const targetArg = targetFile ? `-- "${targetFile}"` : '';

try {
  const statusRaw = execSync(`git status --short ${targetArg}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  const diffRaw = execSync(`git diff --unified=0 ${targetArg}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  const stagedRaw = execSync(`git diff --staged --unified=0 ${targetArg}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

  const changedFiles = statusRaw ? statusRaw.split(/\r?\n/).slice(0, 15) : [];
  const combinedDiff = [diffRaw, stagedRaw].filter(Boolean).join('\n');
  const diffHunks = combinedDiff
    ? combinedDiff.split(/\r?\n/).filter(l => /^(diff --git|@@|\+[^+]|\-[^-])/.test(l)).slice(0, 20)
    : [];

  const result = {
    changedCount: changedFiles.length,
    files: changedFiles,
    hunksPreview: diffHunks
  };

  const cacheDir = path.join(__dirname, '..', '.cache');
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(path.join(cacheDir, 'git_diff_extract.json'), JSON.stringify(result), 'utf8');

  if (isSummary) {
    console.log(JSON.stringify(result));
  } else {
    console.log(JSON.stringify(result));
  }
} catch {
  console.log(JSON.stringify({ status: 'NO_GIT_OR_CLEAN', changedCount: 0, files: [], hunksPreview: [] }));
}

