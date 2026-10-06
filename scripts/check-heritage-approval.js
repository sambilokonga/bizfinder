const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (m) process.env[m[1]] = m[2] ? m[2].trim().replace(/^["']|["']$/g, '') : '';
  });
}
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const coll = mongoose.connection.collection('businesses');
  const doc = await coll.findOne({ name: /heritage/i });
  console.log('Heritage doc approval status:', {
    id: doc?.id,
    name: doc?.name,
    approvalStatus: doc?.approvalStatus,
    isApproved: doc?.isApproved,
    isPublished: doc?.isPublished,
    isVerified: doc?.isVerified,
    categoryId: doc?.categoryId,
    categoryName: doc?.categoryName,
    subcategoryId: doc?.subcategoryId,
    subcategoryName: doc?.subcategoryName,
    slug: doc?.slug
  });

  // Also check all distinct categoryId and subcategoryId in database
  const distinctCats = await coll.distinct('categoryId');
  console.log('Distinct categoryIds in DB:', distinctCats);
  const totalCount = await coll.countDocuments();
  console.log('Total businesses count in DB:', totalCount);

  // Check how many have approvalStatus
  const approvedCount = await coll.countDocuments({ $or: [{ approvalStatus: 'approved' }, { isApproved: true }, { approvalStatus: { $exists: false } }] });
  console.log('Publicly visible businesses count:', approvedCount);

  await mongoose.disconnect();
}
run();
