const fs = require('fs');
const content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('handleUpdateBusiness') || line.includes('isMediaUploaderOpen') || line.includes('ownerMediaPage')) {
    console.log(`L${idx + 1}: ${line.trim()}`);
  }
});
