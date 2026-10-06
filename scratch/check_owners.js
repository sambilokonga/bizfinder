const mongoose = require('mongoose');
const uri = 'mongodb+srv://flowerabbeja:aastu2020@cluster0.e9t8lst.mongodb.net/businesses?retryWrites=true&w=majority';
async function main() {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const owners = await mongoose.connection.db.collection('businesses').aggregate([
    { $group: { _id: '$ownerId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 15 }
  ]).toArray();
  console.log('Owners:', JSON.stringify(owners, null, 2));
  await mongoose.disconnect();
}
main().catch(console.error);
