const fs = require('fs');
const path = require('path');
const https = require('https');

// 1. Load .env.local manually without external dotenv dependency
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

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const TARGET_EMAIL = 'mastwal1627@gmail.com';

console.log('--- 🔐 BizFinder Clerk Admin Role Assignment Test ---');
console.log('Target Email:', TARGET_EMAIL);
console.log('Clerk Secret Key Present:', !!CLERK_SECRET_KEY && !CLERK_SECRET_KEY.includes('placeholder'));

if (!CLERK_SECRET_KEY) {
  console.error('CLERK_SECRET_KEY not found in .env.local');
  process.exit(1);
}

// Helper to make Clerk API calls using Node standard https
function clerkRequest(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.clerk.com',
      port: 443,
      path: '/v1' + endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };

    const req = https.request(options, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(resBody);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: parsed });
          } else {
            resolve({ status: res.statusCode, error: parsed });
          }
        } catch (e) {
          resolve({ status: res.statusCode, text: resBody });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  try {
    console.log('\n1. 🔍 Searching for user in Clerk Dashboard by email...');
    const searchRes = await clerkRequest('GET', `/users?email_address=${encodeURIComponent(TARGET_EMAIL)}`);
    
    const targetMetadata = {
      role: 'country_admin',
      assignedCountry: 'Ethiopia',
      assignedCity: 'Addis Ababa',
      countryFlag: '🇪🇹',
      jurisdiction: 'National Lead — Ethiopia (Main Country Admin)',
      permissions: [
        'all.country',
        'city_admin.manage',
        'business.approve',
        'business.verify',
        'business.delete',
        'review.moderate',
        'country.analytics.read'
      ],
      syncedAt: new Date().toISOString(),
      app: 'BizFinder'
    };

    let clerkUser = null;

    if (searchRes.data && searchRes.data.length > 0) {
      clerkUser = searchRes.data[0];
      console.log(`✅ Found existing Clerk User! ID: ${clerkUser.id}`);
      console.log(`Current Name: ${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`);
      
      console.log('\n2. 🔄 Updating publicMetadata in Clerk Dashboard...');
      const updateRes = await clerkRequest('PATCH', `/users/${clerkUser.id}/metadata`, {
        public_metadata: targetMetadata
      });

      if (updateRes.error) {
        console.error('❌ Failed to update Clerk metadata:', updateRes.error);
      } else {
        console.log('✅ Successfully updated publicMetadata in Clerk Dashboard!');
        console.log('Updated Metadata:', JSON.stringify(updateRes.data.public_metadata, null, 2));
      }
    } else {
      console.log('ℹ️ User not found in Clerk. Creating new Clerk user with Country Main Admin metadata...');
      const createRes = await clerkRequest('POST', '/users', {
        email_address: [TARGET_EMAIL],
        first_name: 'Mastwal',
        last_name: 'Lead Admin',
        public_metadata: targetMetadata,
        skip_password_requirement: true
      });

      if (createRes.error) {
        console.error('❌ Failed to create Clerk user:', createRes.error);
      } else {
        clerkUser = createRes.data;
        console.log(`✅ User successfully created in Clerk Dashboard! ID: ${clerkUser.id}`);
        console.log('Assigned Metadata:', JSON.stringify(clerkUser.public_metadata, null, 2));
      }
    }

    console.log('\n======================================================');
    console.log('🎉 CLERK INTEGRATION TEST COMPLETE!');
    console.log(`Email: ${TARGET_EMAIL}`);
    console.log(`Role: ${targetMetadata.role} (Ethiopia Country Main Admin)`);
    console.log(`Jurisdiction: ${targetMetadata.jurisdiction}`);
    console.log('You can now log in or check dashboard.clerk.com -> Users to verify!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('Test execution failed:', err);
  }
}

run();
