const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      process.env[match[1]] = match[2] ? match[2].trim().replace(/^["']|["']$/g, '') : '';
    }
  });
}
const mongoose = require('mongoose');

async function main() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.log('No MONGODB_URI in env');
      return;
    }
    await mongoose.connect(uri);
    const collection = mongoose.connection.collection('businesses');
    const businesses = await collection.find({}).toArray();
    console.log(`Total businesses in DB: ${businesses.length}`);
    const found = businesses.filter(b => b.name && b.name.toLowerCase().includes('heritage'));
    console.log('Matches:', JSON.stringify(found.map(b => ({
      id: b.id,
      name: b.name,
      youtubeVideoId: b.youtubeVideoId,
      media: b.media,
    })), null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}
main();
