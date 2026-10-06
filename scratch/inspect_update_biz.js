const fs = require('fs');
const content = fs.readFileSync('src/lib/db/queries/businesses.ts', 'utf8');

const idx = content.indexOf('export async function updateBusiness');
if (idx !== -1) {
  console.log(content.slice(idx, idx + 800));
} else {
  console.log('updateBusiness not found directly');
}
