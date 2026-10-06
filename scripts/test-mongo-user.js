const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// 1. Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        process.env[key] = val;
      }
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;
const TARGET_EMAIL = 'mastwal1627@gmail.com';

async function run() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is missing');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas!');

    const userSchema = new mongoose.Schema({
      id: { type: String, required: true, unique: true },
      clerkId: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      role: { type: String, default: 'country_admin' },
      assignedCountry: { type: String, default: 'Ethiopia' },
      assignedCity: { type: String, default: 'Addis Ababa' },
      avatarUrl: { type: String, default: '' },
      savedBusinessIds: { type: [String], default: [] },
      isActive: { type: Boolean, default: true },
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model('User', userSchema);

    const doc = await User.findOneAndUpdate(
      { email: TARGET_EMAIL },
      {
        $setOnInsert: {
          id: `user-${Date.now()}`,
          clerkId: `clerk-mastwal-${Date.now()}`,
        },
        $set: {
          name: 'Mastwal (Ethiopia Main Country Admin)',
          email: TARGET_EMAIL,
          role: 'country_admin',
          assignedCountry: 'Ethiopia',
          assignedCity: 'Addis Ababa',
          isActive: true,
        }
      },
      { upsert: true, new: true }
    );

    console.log('✅ MongoDB User Record Updated/Created:');
    console.log(JSON.stringify(doc, null, 2));

    await mongoose.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('MongoDB operation failed:', err);
  }
}

run();
