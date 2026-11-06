#!/usr/bin/env node
/**
 * ตรวจภาษาและเฟรมเวิร์กจากไฟล์ config ของโปรเจกต์ พร้อมระบบแคชผลลัพธ์ (.cache/detect_stack.json)
 * วิธีใช้: node scripts/detect_stack.js [--summary] [--no-cache]
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const isSummary = args.includes('--summary');
const noCache = args.includes('--no-cache');
const cacheDir = path.join(__dirname, '..', '.cache');
const cacheFile = path.join(cacheDir, 'detect_stack.json');

const CONFIG_FILES = [
  'package.json', 'tsconfig.json', 'vite.config.js', 'vite.config.ts', 'vue.config.js',
  'next.config.js', 'next.config.mjs', 'nuxt.config.ts', 'angular.json',
  'tailwind.config.js', 'tailwind.config.cjs', 'tailwind.config.ts',
  'requirements.txt', 'pyproject.toml', 'Pipfile',
  'pom.xml', 'build.gradle', 'composer.json', 'go.mod', 'Cargo.toml', 'Gemfile'
];

function getConfigSignature() {
  return CONFIG_FILES.filter(f => fs.existsSync(f))
    .map(f => `${f}:${Math.floor(fs.statSync(f).mtimeMs)}`)
    .join('|');
}

const sig = getConfigSignature();
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

const result = {
  status: 'DETECTED',
  configs: CONFIG_FILES.filter(f => fs.existsSync(f)),
  languages: [],
  frameworks: [],
  ui: [],
  stateAndApi: [],
  testRunner: []
};

if (fs.existsSync('package.json')) {
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const match = (re) => Object.keys(deps).filter(k => re.test(k));
    result.languages.push(fs.existsSync('tsconfig.json') || deps.typescript ? 'TypeScript' : 'JavaScript');
    result.frameworks.push(...match(/^(vue|react|next|nuxt|@angular\/core|svelte|express|fastify|@nestjs\/core|koa|hapi)$/));
    result.ui.push(...match(/^(ant-design-vue|antd|tailwindcss|@mui\/material|vuetify|element-plus|bootstrap|@chakra-ui\/react)$/));
    result.stateAndApi.push(...match(/^(vuex|pinia|redux|@reduxjs\/toolkit|zustand|axios|@tanstack\/react-query|swr)$/));
    result.testRunner.push(...match(/^(vitest|jest|mocha|cypress|@playwright\/test)$/));
  } catch {}
}

if (fs.existsSync('requirements.txt') || fs.existsSync('pyproject.toml') || fs.existsSync('Pipfile')) {
  result.languages.push('Python');
  const pyText = ['requirements.txt', 'pyproject.toml'].filter(f => fs.existsSync(f)).map(f => fs.readFileSync(f, 'utf8')).join('\n');
  ['fastapi', 'django', 'flask', 'pytest', 'sqlalchemy'].forEach(fw => {
    if (new RegExp(`\\b${fw}\\b`, 'i').test(pyText)) result.frameworks.push(fw);
  });
}
if (fs.existsSync('go.mod')) result.languages.push('Go');
if (fs.existsSync('pom.xml') || fs.existsSync('build.gradle')) result.languages.push('Java/Kotlin');
if (fs.existsSync('composer.json')) result.languages.push('PHP');
if (fs.existsSync('Cargo.toml')) result.languages.push('Rust');
if (fs.existsSync('Gemfile')) result.languages.push('Ruby');

if (result.configs.length === 0) {
  result.status = 'UNKNOWN_STACK';
  result.action = 'ASK_1_QUESTION: ไม่พบไฟล์ config ของโปรเจกต์ กรุณาถามผู้ใช้ 1 คำถามว่าใช้ภาษาและเฟรมเวิร์กใด';
} else {
  try {
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(cacheFile, JSON.stringify({ _sig: sig, data: result }), 'utf8');
  } catch {}
}

console.log(isSummary ? JSON.stringify(result) : JSON.stringify(result, null, 2));

