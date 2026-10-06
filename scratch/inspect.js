const fs = require('fs');

function inspectFile(filePath) {
  console.log('=== Inspecting ' + filePath + ' ===');
  const code = fs.readFileSync(filePath, 'utf8');
  const lines = code.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('activeNav ===') || line.includes('setActiveNav(') || line.includes('Security') || line.includes('security')) {
      console.log(`${idx + 1}: ${line.trim()}`);
    }
  });
}

inspectFile('src/app/admin/page.tsx');
inspectFile('src/app/dashboard/page.tsx');
