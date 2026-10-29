const fs = require('fs');
const path = require('path');

function walk(dir) {
  let res = [];
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next') res = res.concat(walk(full));
    } else if (f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.css')) {
      res.push(full);
    }
  });
  return res;
}

const files = walk('al-maktabah/src');

const reports = files.map(fp => {
  const code = fs.readFileSync(fp, 'utf8');
  const lines = code.split('\n').length;
  const rel = path.relative('al-maktabah', fp).replace(/\\/g, '/');
  
  const hex = (code.match(/#[0-9a-fA-F]{3,8}/g) || []).length;
  const arbClass = (code.match(/\b[a-z]+-\[[^\]]+\]/g) || []);
  const arbColors = arbClass.filter(c => c.includes('#'));
  const arbPx = arbClass.filter(c => /\d+px/.test(c));
  
  const inlineTypes = (code.match(/(?:export\s+)?(?:interface|type)\s+([A-Z]\w*)/g) || [])
    .filter(t => !rel.includes('/types/'));
    
  const hasFetch = /fetch\(/.test(code);
  const hasStorage = /localStorage\./.test(code);
  const useStates = (code.match(/useState\(/g) || []).length;
  const useEffects = (code.match(/useEffect\(/g) || []).length;
  
  const isViewOrComp = rel.includes('/views/') || rel.includes('/components/') || rel.includes('/app/');
  const mixedConcerns = isViewOrComp && (hasFetch || hasStorage || useStates > 3 || (inlineTypes.length > 0 && lines > 150));

  return {
    rel,
    lines,
    hex,
    arbColorsCount: arbColors.length,
    arbColorsSample: [...new Set(arbColors)].slice(0, 4),
    arbPxCount: arbPx.length,
    arbPxSample: [...new Set(arbPx)].slice(0, 4),
    inlineTypes,
    hasFetch,
    hasStorage,
    useStates,
    useEffects,
    mixedConcerns
  };
});

console.log('=== 1. VIOLATIONS BY FILE LENGTH (> 500 lines) ===');
reports.filter(r => r.lines > 500).sort((a,b)=>b.lines - a.lines).forEach(r => {
  console.log(`- ${r.rel} | Length: ${r.lines} lines | Category: Critical Oversized`);
});

console.log('\n=== 2. MODULARITY AUDIT (200 - 500 lines) ===');
reports.filter(r => r.lines >= 200 && r.lines <= 500).sort((a,b)=>b.lines - a.lines).forEach(r => {
  console.log(`- ${r.rel} | Length: ${r.lines} lines | Category: Monolithic / High Risk`);
});

console.log('\n=== 3. TOP HARDCODED TOKENS (Hex & Arbitrary Pixel Classes) ===');
reports.filter(r => (r.arbColorsCount + r.arbPxCount) > 0)
  .sort((a,b)=>(b.arbColorsCount + b.arbPxCount) - (a.arbColorsCount + a.arbPxCount))
  .slice(0, 15).forEach(r => {
    console.log(`- ${r.rel} | Arbitrary Colors: ${r.arbColorsCount} | Arbitrary Px: ${r.arbPxCount} | Samples: ${r.arbColorsSample.concat(r.arbPxSample).join(', ')}`);
  });

console.log('\n=== 4. MIXED CONCERNS (Views & Components with Business Logic / Data Fetching) ===');
reports.filter(r => r.mixedConcerns).sort((a,b)=>b.lines - a.lines).forEach(r => {
  console.log(`- ${r.rel} | Lines: ${r.lines} | API Fetch: ${r.hasFetch} | LocalStorage: ${r.hasStorage} | useStates: ${r.useStates} | Inline Types: ${r.inlineTypes.length}`);
});

console.log('\n=== 5. INLINE TYPES REQUIRING ISOLATION ===');
reports.filter(r => r.inlineTypes.length > 0).forEach(r => {
  console.log(`- ${r.rel} | Declarations: ${r.inlineTypes.join(', ')}`);
});
