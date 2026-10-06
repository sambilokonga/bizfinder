const fs = require('fs');
const content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');
const navs = content.match(/activeNav === ["'][a-zA-Z0-9_-]+["']/g);
console.log('Unique activeNav values:');
console.log(navs ? [...new Set(navs)] : 'none');

// Also search for "user" or "users" or "customers" or "team" tabs or lists
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('pagination') || l.includes('Pagination') || l.includes('PER_PAGE') || l.includes('per page') || l.includes('PER PAGE')) {
    console.log(`L${i+1}: ${l.trim()}`);
  }
});
