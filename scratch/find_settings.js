const fs = require('fs');
const content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('activeNav === "settings"') || l.includes('DashboardSettingsView')) {
    console.log(`L${i+1}: ${l.trim()}`);
  }
});
