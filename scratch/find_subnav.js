const fs = require('fs');
const content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('renderSubnavTabs =') || l.includes('function renderSubnavTabs')) {
    console.log(`L${i+1}: ${l.trim()}`);
  }
});
