const fs = require('fs');
const content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

// Find all occurrences of navigation tabs or media
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('activeNav ===') || line.includes('media') || line.includes('Media')) {
    if (line.includes('activeNav ===') || line.includes('Media & Photos') || line.includes('mediaTab') || line.includes('selectedBusiness.media')) {
      console.log(`L${idx + 1}: ${line.trim()}`);
    }
  }
});
