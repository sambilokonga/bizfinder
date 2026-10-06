import { connectToDatabase } from "./mongodb";
import {
  BusinessModel,
  CategoryModel,
  LocationModel,
  ReviewModel,
  UserModel,
  ClaimModel,
  PaymentModel,
} from "./models";
import { SEED_CATEGORIES } from "./seed-data/categories";
import { SEED_LOCATIONS } from "./seed-data/locations";
import { SEED_BUSINESSES, SEED_REVIEWS } from "./seed-data/businesses";
import { SEED_USERS } from "./seed-data/users";
import { SEED_CLAIMS } from "./seed-data/claims";
import { SEED_PAYMENTS } from "./seed-data/payments";

export interface SeedResult {
  success: boolean;
  message: string;
  database: string;
  durationMs: number;
  stats: {
    categories: number;
    locations: number;
    businesses: number;
    reviews: number;
    users: number;
    claims: number;
    payments: number;
  };
  indexes: {
    businessIndexes: string[];
  };
}

export async function runDatabaseSeed(options: { dropExisting?: boolean } = { dropExisting: true }): Promise<SeedResult> {
  const startTime = Date.now();
  console.log("[Seed Engine] Starting database seeding process...");

  const mongoose = await connectToDatabase();
  if (!mongoose) {
    throw new Error("Could not connect to MongoDB database.");
  }

  const dbName = mongoose.connection.name;
  console.log(`[Seed Engine] Connected to database '${dbName}'. Preparing collections...`);

  if (options.dropExisting) {
    console.log("[Seed Engine] Dropping existing collections for clean seed...");
    await Promise.allSettled([
      CategoryModel.collection.drop(),
      LocationModel.collection.drop(),
      BusinessModel.collection.drop(),
      ReviewModel.collection.drop(),
      UserModel.collection.drop(),
      ClaimModel.collection.drop(),
      PaymentModel.collection.drop(),
    ]);
    console.log("[Seed Engine] Collections cleared.");
  }

  // 1. Seed Categories
  console.log(`[Seed Engine] Inserting ${SEED_CATEGORIES.length} Categories...`);
  const categoryDocs = SEED_CATEGORIES.map((cat) => ({
    id: cat.id,
    parentId: cat.parentId || null,
    name: cat.name,
    slug: cat.slug,
    icon: cat.icon || "Layers",
    level: cat.level,
    featured: Boolean(cat.featured),
  }));
  await CategoryModel.insertMany(categoryDocs, { ordered: false });
  await CategoryModel.syncIndexes();
  const categoryCount = await CategoryModel.countDocuments();
  console.log(`[Seed Engine] Categories seeded: ${categoryCount}`);

  // 2. Seed Locations
  console.log(`[Seed Engine] Inserting ${SEED_LOCATIONS.length} Locations...`);
  const locationDocs = SEED_LOCATIONS.map((loc) => ({
    id: loc.id,
    parentId: loc.parentId || null,
    name: loc.name,
    type: loc.type,
    latitude: loc.latitude,
    longitude: loc.longitude,
    countryCode: loc.countryCode,
  }));
  await LocationModel.insertMany(locationDocs, { ordered: false });
  await LocationModel.syncIndexes();
  const locationCount = await LocationModel.countDocuments();
  console.log(`[Seed Engine] Locations seeded: ${locationCount}`);

  // 3. Seed Businesses
  console.log(`[Seed Engine] Inserting ${SEED_BUSINESSES.length} Businesses...`);
  const businessDocs = SEED_BUSINESSES.map((biz) => ({
    id: biz.id,
    name: biz.name,
    slug: biz.slug,
    ownerId: biz.ownerId || null,
    categoryId: biz.categoryId,
    categoryName: biz.categoryName,
    subcategoryId: biz.subcategoryId,
    subcategoryName: biz.subcategoryName,
    subSubcategoryId: biz.subSubcategoryId,
    subSubcategoryName: biz.subSubcategoryName,
    countryId: biz.countryId,
    countryName: biz.countryName,
    cityId: biz.cityId,
    cityName: biz.cityName,
    subcityId: biz.subcityId,
    districtId: biz.districtId,
    districtName: biz.districtName,
    addressLine: biz.addressLine,
    street: biz.street,
    building: biz.building,
    postalCode: biz.postalCode,
    location: {
      type: "Point",
      coordinates: [biz.longitude, biz.latitude], // [longitude, latitude] GeoJSON format
    },
    telephone: biz.telephone,
    mobile: biz.mobile,
    whatsapp: biz.whatsapp,
    email: biz.email,
    website: biz.website,
    description: biz.description,
    shortDescription: biz.shortDescription,
    yearEstablished: biz.yearEstablished,
    status: biz.status || "open",
    isVerified: Boolean(biz.isVerified),
    isFeatured: Boolean(biz.isFeatured),
    ratingAvg: biz.ratingAvg || 0,
    reviewCount: biz.reviewCount || 0,
    viewCount: biz.viewCount || 0,
    callCount: biz.callCount || 0,
    directionCount: biz.directionCount || 0,
    logoUrl: biz.logoUrl || "",
    coverUrl: biz.coverUrl || "",
    youtubeVideoId: biz.youtubeVideoId,
    media: biz.media || [],
    openingHours: biz.openingHours || [],
    attributes: biz.attributes || {},
    services: biz.services || [],
  }));
  await BusinessModel.insertMany(businessDocs, { ordered: false });
  await BusinessModel.syncIndexes();
  const businessCount = await BusinessModel.countDocuments();
  console.log(`[Seed Engine] Businesses seeded: ${businessCount}`);

  // 4. Seed Reviews
  console.log(`[Seed Engine] Inserting ${SEED_REVIEWS.length} Reviews...`);
  const reviewDocs = SEED_REVIEWS.map((rev) => ({
    id: rev.id,
    businessId: rev.businessId,
    userId: rev.userId,
    userName: rev.userName,
    userAvatar: rev.userAvatar,
    rating: rev.rating,
    comment: rev.comment,
    photos: rev.photos || [],
    likesCount: rev.likesCount || 0,
    reply: rev.reply
      ? {
          ownerId: rev.reply.ownerId,
          ownerName: rev.reply.ownerName,
          comment: rev.reply.comment,
          createdAt: new Date(rev.reply.createdAt),
        }
      : undefined,
    isFlagged: false,
    createdAt: new Date(rev.createdAt),
  }));
  await ReviewModel.insertMany(reviewDocs, { ordered: false });
  await ReviewModel.syncIndexes();
  const reviewCount = await ReviewModel.countDocuments();
  console.log(`[Seed Engine] Reviews seeded: ${reviewCount}`);

  // 5. Seed Users
  console.log(`[Seed Engine] Inserting ${SEED_USERS.length} Users...`);
  const userDocs = SEED_USERS.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    avatarUrl: u.avatarUrl,
    claimedBusinessIds: u.claimedBusinessIds || [],
    createdAt: new Date(u.createdAt),
  }));
  await UserModel.insertMany(userDocs, { ordered: false });
  await UserModel.syncIndexes();
  const userCount = await UserModel.countDocuments();
  console.log(`[Seed Engine] Users seeded: ${userCount}`);

  // 6. Seed Claims
  console.log(`[Seed Engine] Inserting ${SEED_CLAIMS.length} Claims...`);
  const claimDocs = SEED_CLAIMS.map((c) => ({
    id: c.id,
    businessId: c.businessId,
    businessName: c.businessName,
    userId: c.userId,
    userEmail: c.userEmail,
    userName: c.userName,
    userPhone: c.userPhone,
    businessRole: c.businessRole,
    status: c.status,
    notes: c.notes,
    createdAt: new Date(c.createdAt),
  }));
  await ClaimModel.insertMany(claimDocs, { ordered: false });
  await ClaimModel.syncIndexes();
  const claimCount = await ClaimModel.countDocuments();
  console.log(`[Seed Engine] Claims seeded: ${claimCount}`);

  // 7. Seed Payments
  console.log(`[Seed Engine] Inserting ${SEED_PAYMENTS.length} Payments...`);
  const paymentDocs = SEED_PAYMENTS.map((p) => ({
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  }));
  await PaymentModel.insertMany(paymentDocs, { ordered: false });
  await PaymentModel.syncIndexes();
  const paymentCount = await PaymentModel.countDocuments();
  console.log(`[Seed Engine] Payments seeded: ${paymentCount}`);

  // Check indexes
  const bizIndexesRaw = await BusinessModel.collection.indexes();
  const bizIndexNames = bizIndexesRaw.map((idx) => idx.name || JSON.stringify(idx.key));

  const durationMs = Date.now() - startTime;
  console.log(`[Seed Engine] Seeding successfully completed in ${durationMs}ms!`);

  return {
    success: true,
    message: "Database successfully seeded.",
    database: dbName,
    durationMs,
    stats: {
      categories: categoryCount,
      locations: locationCount,
      businesses: businessCount,
      reviews: reviewCount,
      users: userCount,
      claims: claimCount,
      payments: paymentCount,
    },
    indexes: {
      businessIndexes: bizIndexNames,
    },
  };
}
