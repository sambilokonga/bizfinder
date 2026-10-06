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

const YOUTUBE_REGEX =
  /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?.*?(?:&|\?)v=|watch\?v=|embed\/|v\/|shorts\/|live\/))([a-zA-Z0-9_-]{11})/i;

function extractYoutubeVideoId(input) {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(YOUTUBE_REGEX);
  if (match && match[1] && match[1].length === 11) return match[1];
  return null;
}

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
    console.log(`Scanning ${businesses.length} businesses for YouTube videos...`);

    let updatedCount = 0;

    for (const biz of businesses) {
      let needsUpdate = false;
      let newYoutubeId = extractYoutubeVideoId(biz.youtubeVideoId);
      const media = Array.isArray(biz.media) ? [...biz.media] : [];

      // Check media items
      let updatedMedia = false;
      for (const m of media) {
        const vidId = extractYoutubeVideoId(m.url);
        if (vidId) {
          if (!newYoutubeId) newYoutubeId = vidId;
          const expectedThumb = `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`;
          if (m.type !== 'video' || m.thumbnailUrl !== expectedThumb) {
            m.type = 'video';
            m.thumbnailUrl = expectedThumb;
            updatedMedia = true;
          }
        }
      }

      const updateFields = {};
      if (newYoutubeId && biz.youtubeVideoId !== newYoutubeId) {
        updateFields.youtubeVideoId = newYoutubeId;
        needsUpdate = true;
      }
      if (updatedMedia) {
        updateFields.media = media;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await collection.updateOne({ _id: biz._id }, { $set: updateFields });
        console.log(`✓ Updated business [${biz.id}] "${biz.name}": youtubeVideoId=${newYoutubeId || biz.youtubeVideoId}`);
        updatedCount++;
      }
    }

    console.log(`Finished! Updated ${updatedCount} businesses.`);

    // Verify Addis Heritage
    const heritage = await collection.findOne({ name: /heritage/i });
    if (heritage) {
      console.log('Addis Heritage in DB now:', {
        id: heritage.id,
        name: heritage.name,
        youtubeVideoId: heritage.youtubeVideoId,
        media: heritage.media,
      });
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}
main();
