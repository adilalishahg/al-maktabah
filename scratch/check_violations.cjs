const fs = require('fs');
const path = require('path');

function walk(dir) {
  let res = [];
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next') res = res.concat(walk(full));
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      res.push(full);
    }
  });
  return res;
}

const files = walk('al-maktabah/src');
let totalViolations = 0;
const report = [];

files.forEach(f => {
  if (f.includes('scratch') || f.includes('tests')) return;
  const rel = path.relative('al-maktabah', f).replace(/\\/g, '/');
  if (rel === 'src/lib/tokens.ts') return;
  
  const code = fs.readFileSync(f, 'utf8');
  const fileViolations = [];
  code.split('\n').forEach((l, i) => {
    if (/#([0-9a-fA-F]{3,8})|\[\d+px\]/.test(l)) {
      fileViolations.push({ line: i + 1, content: l.trim() });
    }
  });
  
  if (fileViolations.length > 0) {
    totalViolations += fileViolations.length;
    report.push({ file: rel, count: fileViolations.length, violations: fileViolations });
  }
});

console.log('TOTAL REMAINING ARBITRARY TOKEN VIOLATIONS ACROSS CODEBASE:', totalViolations);
if (report.length > 0) {
  report.forEach(r => {
    console.log(`- ${r.file}: ${r.count} violations`);
    r.violations.slice(0, 3).forEach(v => console.log(`   L${v.line}: ${v.content}`));
  });
}

