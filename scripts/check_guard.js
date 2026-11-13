#!/usr/bin/env node
/**
 * ตรวจจับ Fallback ที่ไม่ได้รับอนุญาต (multi-path key, ??, ||, catch default) และ BE N+1 / SELECT * ใน git diff หรือไฟล์เป้าหมาย
 * วิธีใช้: node scripts/check_guard.js [--summary] [--no-cache] [--all] [file1] [file2]
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rawArgs = process.argv.slice(2);
const isSummary = rawArgs.includes('--summary');
const noCache = rawArgs.includes('--no-cache');
const scanAll = rawArgs.includes('--all');
const targets = rawArgs.filter(a => !a.startsWith('--'));

const cacheDir = path.join(__dirname, '..', '.cache');
const cacheFile = path.join(cacheDir, 'check_guard.json');
const CODE_EXT_RE = /\.(js|ts|jsx|tsx|vue|mjs|cjs)$/;

const GENERIC_LEAVES = new Set([
  'value', 'length', 'size', 'id', 'name', 'type', 'data', 'rows', 'items', 'list',
  'status', 'code', 'message', 'error', 'undefined', 'null'
]);

function collectTargets() {
  const fileLineMap = new Map();
  const targetArg = targets.length ? `-- ${targets.map(f => `"${f}"`).join(' ')}` : '';

  if (!scanAll) {
    try {
      const statusOut = execSync(`git status --porcelain ${targetArg}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      if (statusOut) {
        for (const line of statusOut.split(/\r?\n/)) {
          const code = line.slice(0, 2);
          const file = line.slice(3).trim().replace(/^"|"$/g, '');
          if (code === '??' && CODE_EXT_RE.test(file) && fs.existsSync(file) && (targets.length || !file.startsWith('scripts/'))) {
            fileLineMap.set(file, 'ALL');
          }
        }
      }

      const diffText = [
        execSync(`git diff --unified=0 ${targetArg}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }),
        execSync(`git diff --staged --unified=0 ${targetArg}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
      ].filter(Boolean).join('\n');

      let curFile = null;
      let curLine = 0;
      for (const raw of diffText.split(/\r?\n/)) {
        const mFile = raw.match(/^\+\+\+ b\/(.+)$/);
        if (mFile) { curFile = mFile[1]; continue; }
        const mHunk = raw.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
        if (mHunk) { curLine = parseInt(mHunk[1], 10); continue; }
        if (curFile && raw.startsWith('+') && !raw.startsWith('+++')) {
          if (CODE_EXT_RE.test(curFile) && fs.existsSync(curFile) && (targets.length || !curFile.startsWith('scripts/'))) {
            if (!fileLineMap.has(curFile)) fileLineMap.set(curFile, new Set());
            const entry = fileLineMap.get(curFile);
            if (entry !== 'ALL') entry.add(curLine);
          }
          curLine++;
        }
      }
      if (fileLineMap.size > 0 || targets.length === 0) return fileLineMap;
    } catch {}
  }

  for (const t of targets) {
    const norm = t.replace(/\\/g, '/');
    if (fs.existsSync(norm) && fs.statSync(norm).isFile() && CODE_EXT_RE.test(norm)) {
      fileLineMap.set(norm, 'ALL');
    }
  }
  return fileLineMap;
}

const fileLineMap = collectTargets();
const sigParts = [];
for (const [f, setOrAll] of fileLineMap.entries()) {
  const mtime = fs.existsSync(f) ? Math.floor(fs.statSync(f).mtimeMs) : 0;
  const tag = setOrAll === 'ALL' ? 'ALL' : Array.from(setOrAll).slice(0, 15).join(',');
  sigParts.push(`${f}:${mtime}:${tag}`);
}
const sig = sigParts.join('|');

if (!noCache && sig && fs.existsSync(cacheFile)) {
  try {
    const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    if (cached._sig === sig) {
      console.log(JSON.stringify({ ...cached.data, cached: true }));
      process.exit(0);
    }
  } catch {}
}

const CHAIN_RE = /\b([a-zA-Z_$][\w$]*(?:\??\.[a-zA-Z_$][\w$]*)+)\b(?!\s*\()/g;
const BOOLEAN_PREDICATE_RE = /(?:===?|!==?|<=?|>=?|\.(?:test|has|includes|some|every|startsWith|endsWith)\s*\()/;
const ASSIGN_OR_RET_FALLBACK_RE = /(?:[^=!<>]=[^=]|=>|\breturn\b|:)\s*[^;]*(?:\?\?|\|\|)/;
const MULTI_CHAIN_FALLBACK_RE = /[a-zA-Z_$][\w$]*(?:\??\.[a-zA-Z_$][\w$]*)+(?![\w$\s]*\()[^;\n]*(?:\?\?|\|\|)[^;\n]*(?:[a-zA-Z_$][\w$]*(?:\??\.[a-zA-Z_$][\w$]*)+|\[\]|\{\}|""|false|true|null|\b\d+\b)/;
const IDENT_LITERAL_FALLBACK_RE = /\b(?!is[A-Z_]|has[A-Z_]|can[A-Z_]|should[A-Z_]|allow[A-Z_]|need[A-Z_]|show[A-Z_])[a-zA-Z_$][\w$]*\s*\|\|\s*(?:\[\]|\{\}|""|null|\b0\b)/;
const SILENT_CATCH_RE = /\bcatch\b[^{]*\{[^}]*(?:return\s+(?:\[\]|\{\}|null|false|''|"")|\.value\s*=\s*(?:\[\]|\{\}|null|false|''|""))/;
const LOOP_START_RE = /\b(?:for|while)\s*\(|\.(?:forEach|map)\s*\(/;
const DB_OR_HTTP_AWAIT_RE = /\bawait\s+(?:[a-zA-Z_$][\w$.]*\.(?:query|execute|find|findOne|findUnique|findMany|create|update|save|delete|get|post|put|patch)|fetch)\s*\(/;
const NULL_CHECK_IF_RE = /\bif\s*\([^)]*(?:!==?\s*(?:undefined|null)|\bundefined\s*!==?|\bnull\s*!==?)/;

function stripLiterals(s) {
  return s.replace(/`(?:\\.|[^`])*`|'(?:\\.|[^'])*'|"(?:\\.|[^"])*"|\/(?:\\.|[^/\n])+\/[gimsuy]*/g, '""');
}

function stripAssignmentLhs(line) {
  const m = line.match(/^\s*(?:const|let|var)?\s*([a-zA-Z_$][\w$.]*)\s*=(?!=)\s*(.*)$/);
  return m ? m[2] : line;
}

const issues = [];
const issueKeys = new Set();
const pushIssue = (sev, rule, loc, detail, dedupKey) => {
  const k = dedupKey ? dedupKey : `${rule}:${loc}:${detail}`;
  if (!issueKeys.has(k) && issues.length < 15) {
    issueKeys.add(k);
    issues.push({ sev, rule, loc, detail });
  }
};

for (const [file, targetSet] of fileLineMap.entries()) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const isTarget = (ln) => targetSet === 'ALL' || targetSet.has(ln);

  let braceDepth = 0;
  const loopDepths = [];

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1;
    const trimmed = lines[i].trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue;

    const opens = (trimmed.match(/\{/g) || []).length;
    const closes = (trimmed.match(/\}/g) || []).length;
    if (LOOP_START_RE.test(trimmed)) loopDepths.push(braceDepth + 1);
    braceDepth += opens - closes;
    while (loopDepths.length && braceDepth < loopDepths[loopDepths.length - 1]) loopDepths.pop();

    if (!isTarget(lineNo)) continue;

    const codeOnly = stripLiterals(trimmed);

    // 1. Detect ?? or || fallback on property chains/values
    const isOrFallback = ASSIGN_OR_RET_FALLBACK_RE.test(codeOnly) &&
      (MULTI_CHAIN_FALLBACK_RE.test(codeOnly) || IDENT_LITERAL_FALLBACK_RE.test(codeOnly)) &&
      !BOOLEAN_PREDICATE_RE.test(codeOnly.split('||')[0]);
    if (/\?\?/.test(codeOnly) || isOrFallback) {
      pushIssue('High', 'CHAINED_FALLBACK_OP', `${file}:${lineNo}`, trimmed.slice(0, 80));
    }

    // 2. Detect silent catch fallback
    const catchBlock = lines.slice(i, i + 4).map(l => l.trim()).join(' ');
    if (/\bcatch\b/.test(codeOnly) && SILENT_CATCH_RE.test(catchBlock)) {
      pushIssue('High', 'SILENT_CATCH_FALLBACK', `${file}:${lineNo}`, trimmed.slice(0, 80));
    }

    // 3. Detect BE N+1 inside loop
    if (loopDepths.length > 0 && DB_OR_HTTP_AWAIT_RE.test(trimmed)) {
      pushIssue('Critical', 'BE_N_PLUS_1_LOOP', `${file}:${lineNo}`, trimmed.slice(0, 80));
    }

    // 4. Detect BE SELECT *
    if (/\bSELECT\s+\*\s+FROM\b/i.test(trimmed)) {
      pushIssue('High', 'BE_SELECT_STAR', `${file}:${lineNo}`, trimmed.slice(0, 80));
    }

    // 5. Detect multi-path fallback for same leaf key (or same root+leaf in if-checks) within +-30 lines
    const rhs = stripAssignmentLhs(codeOnly);
    const isNullCheckIf = NULL_CHECK_IF_RE.test(codeOnly);
    const isComparison = /\s(?:===?|!==?)\s/.test(rhs) && !isNullCheckIf;
    const touchedChains = [];
    if (!isComparison) {
      let m;
      CHAIN_RE.lastIndex = 0;
      while ((m = CHAIN_RE.exec(rhs)) !== null) {
        const parts = m[1].split(/\??\./);
        const leaf = parts[parts.length - 1];
        if (leaf.length >= 2 && leaf !== 'value' && leaf !== 'length') {
          touchedChains.push({ root: parts[0], leaf, parent: parts.slice(0, -1).join('.') });
        }
      }
    }

    if (touchedChains.length > 0) {
      const start = Math.max(0, i - 30);
      const end = Math.min(lines.length - 1, i + 30);
      for (const tc of touchedChains) {
        const isGeneric = tc.leaf.length < 4 || GENERIC_LEAVES.has(tc.leaf);
        if (isGeneric && !isNullCheckIf) continue;

        const parents = new Set();
        for (let j = start; j <= end; j++) {
          const ctxTrim = stripLiterals(lines[j].trim());
          const ctxRhs = stripAssignmentLhs(ctxTrim);
          if (!ctxRhs || ctxRhs.startsWith('//')) continue;
          const ctxNullIf = NULL_CHECK_IF_RE.test(ctxTrim);
          if (isGeneric && !ctxNullIf) continue;
          if (/\s(?:===?|!==?)\s/.test(ctxRhs) && !ctxNullIf) continue;

          CHAIN_RE.lastIndex = 0;
          let cm;
          while ((cm = CHAIN_RE.exec(ctxRhs)) !== null) {
            const cParts = cm[1].split(/\??\./);
            const cLeaf = cParts[cParts.length - 1];
            const cRoot = cParts[0];
            if (cLeaf === tc.leaf && (!isGeneric || cRoot === tc.root)) {
              parents.add(cParts.slice(0, -1).join('.'));
            }
          }
        }
        if (parents.size >= 2) {
          pushIssue(
            'Critical',
            'MULTI_PATH_KEY_FALLBACK',
            `${file}:${lineNo}`,
            `key '${tc.leaf}' across [${Array.from(parents).slice(0, 3).join(' vs ')}]`,
            `MULTI_PATH:${file}:${tc.leaf}`
          );
        }
      }
    }
  }
}

const fallbackCount = issues.filter(i => i.rule.includes('FALLBACK')).length;
const perfCount = issues.length - fallbackCount;
const result = {
  status: issues.length > 0 ? 'BLOCKED' : 'PASS',
  checkedFiles: fileLineMap.size,
  fallbackCount,
  perfCount,
  action: issues.length > 0 ? 'ASK_FIRST_BLOCKED: ห้ามเขียน fallback ลงโค้ดก่อนถามผู้ใช้ — ให้ลบ fallback ที่ยังไม่ได้รับอนุญาตออกจากไฟล์ทันทีแล้วค่อยถามยืนยันผู้ใช้ (หรือแก้ N+1/SELECT *)' : 'OK',
  issues
};

try {
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(cacheFile, JSON.stringify({ _sig: sig, data: result }), 'utf8');
} catch {}

console.log(isSummary ? JSON.stringify(result) : JSON.stringify(result, null, 2).split('\n').slice(0, 28).join('\n'));
