const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

// Read .env.local manually
const envPath = path.resolve(process.cwd(), ".env.local");
let MONGODB_URI = "mongodb+srv://flowerabbeja:aastu2020@cluster0.e9t8lst.mongodb.net/businesses?retryWrites=true&w=majority";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  const match = envContent.match(/MONGODB_URI=(.+)/);
  if (match) {
    MONGODB_URI = match[1].trim();
  }
}

// 30 Ethiopian Cities and distribution for 500 branches
const CBE_DISTRIBUTION = {
  "Addis Ababa": { count: 152, subcities: ["Bole", "Kirkos", "Arada", "Yeka", "Lideta", "Nifas Silk-Lafto", "Kolfe Keranio", "Gullele", "Akaki Kality", "Addis Ketema", "Lemi Kura"], lat: 9.0320, lng: 38.7469 },
  "Hawassa": { count: 22, subcities: ["Menaharia", "Tabor", "Hayek Dar", "Misrak", "Mehal Ketema", "Bahil Adarash"], lat: 7.0621, lng: 38.4764 },
  "Bahir Dar": { count: 22, subcities: ["Gish Abay", "Fasilo", "Belay Zeleke", "Tana", "Shum Abo", "Shimbit"], lat: 11.5936, lng: 37.3908 },
  "Dire Dawa": { count: 20, subcities: ["Sabian", "Kezira", "Megala", "Gende Kore", "Dechatu", "B-Zone"], lat: 9.5931, lng: 41.8661 },
  "Gondar": { count: 18, subcities: ["Arada", "Maraki", "Azezo", "Fasil", "Jantekel", "Lideta"], lat: 12.6075, lng: 37.4521 },
  "Mekelle": { count: 18, subcities: ["Kedamay Weyane", "Hadnet", "Ayder", "Hawelti", "Semien", "Quiha"], lat: 13.4967, lng: 39.4753 },
  "Adama": { count: 20, subcities: ["Bole", "Dembela", "Posta", "Geda", "Boku", "Lugo"], lat: 8.5414, lng: 39.2689 },
  "Jimma": { count: 16, subcities: ["Bochore", "Hermata", "Jiren", "Mendera", "Seto Semero", "Bosa Kito"], lat: 7.6734, lng: 36.8344 },
  "Bishoftu": { count: 14, subcities: ["Hora", "Babogaya", "Bishoftu Centre", "Kality Area", "Kuriftu", "Koka Road"], lat: 8.7523, lng: 38.9785 },
  "Dessie": { count: 14, subcities: ["Piazza", "Hote", "Arada", "Robit", "Buanbuha", "Segno Gebeya"], lat: 11.1292, lng: 39.6386 },
  "Harar": { count: 12, subcities: ["Jugol (Old City)", "Aboker", "Shenkor", "Jin'Eala", "Amir Nur", "Deker"], lat: 9.3139, lng: 42.1182 },
  "Jigjiga": { count: 12, subcities: ["Dudweyne", "Kebele 02", "Kebele 06", "Taiwan Market", "University Area"], lat: 9.3541, lng: 42.7956 },
  "Shashemene": { count: 12, subcities: ["Abosto", "Kuyera", "Bulbula Way", "Arada", "Alelu", "Rasta Camp Area"], lat: 7.2014, lng: 38.5989 },
  "Dilla": { count: 10, subcities: ["Dilla Centre", "Harresaw", "Walleme", "Buno", "Bedessa Way"], lat: 6.4083, lng: 38.3083 },
  "Sodo": { count: 12, subcities: ["Merkato", "Mehal Ketema", "Golje", "Arada", "Offa Gandaba"], lat: 6.8583, lng: 37.7611 },
  "Arba Minch": { count: 10, subcities: ["Sikela", "Shecha", "Nechsar Gate", "Limat", "Airport Area"], lat: 6.0333, lng: 37.5500 },
  "Nekemte": { count: 12, subcities: ["Bake Jama", "Burka Jato", "Kaso", "Darge", "Kumsa Moroda"], lat: 9.0833, lng: 36.5500 },
  "Asella": { count: 10, subcities: ["Arada", "Gonde", "Chilalo Area", "Stadium", "Sire Road"], lat: 7.9500, lng: 39.1333 },
  "Debre Birhan": { count: 12, subcities: ["Tebassie", "Selassie", "Industrial Park", "Kebele 04", "Atse Zera Yacob"], lat: 9.6833, lng: 39.5333 },
  "Debre Markos": { count: 10, subcities: ["Nigist Saba", "Menelik Area", "Boran", "Hidase", "Abima"], lat: 10.3333, lng: 37.7333 },
  "Gambela": { count: 8, subcities: ["Kebele 01", "Kebele 03", "Kebele 05", "Baro Riverbank", "Airport Zone"], lat: 8.2500, lng: 34.5833 },
  "Assosa": { count: 8, subcities: ["Assosa Centre", "Kebele 02", "Bambasi Road", "Selam Kebele"], lat: 10.0667, lng: 34.5333 },
  "Semera": { count: 8, subcities: ["Semera City", "Logiya Gate", "Afar Regional Council", "University Area"], lat: 11.7917, lng: 41.0083 },
  "Robe": { count: 10, subcities: ["Bale Robe Centre", "Goba Gate", "Madda Walabu Area", "Sinana Junction"], lat: 7.1167, lng: 39.9833 },
  "Hosaena": { count: 10, subcities: ["Lichamba", "Gofer Meda", "Hadiya Cultural Centre", "Arada"], lat: 7.5500, lng: 37.8500 },
  "Welkite": { count: 8, subcities: ["Gubre", "Welkite Centre", "Gurar Way", "Edget Kebele"], lat: 8.2833, lng: 37.7833 },
  "Kombolcha": { count: 10, subcities: ["Industrial Park", "Airport Road", "Piassa", "Melka", "Worke"], lat: 11.0833, lng: 39.7333 },
  "Axum": { count: 8, subcities: ["Obelisk Plaza", "May Shum", "Hawelti", "Zion Kebele", "Airport Area"], lat: 14.1333, lng: 38.7167 },
  "Adigrat": { count: 8, subcities: ["Debre Damo Way", "Adigrat Centre", "Agazi", "May Da'ero"], lat: 14.2833, lng: 39.4667 },
  "Woldiya": { count: 8, subcities: ["Piassa", "Melka", "Woldiya University Area", "Gubalafto Gate"], lat: 11.8333, lng: 39.6000 },
};

const ETHIOPIA_30_CITY_ADMINS = [
  { city: "Addis Ababa", name: "Elena Vance", email: "addis.admin@bizfinder.et", phone: "+251 911 234 501" },
  { city: "Dire Dawa", name: "Abdi Mohammed", email: "diredawa.admin@bizfinder.et", phone: "+251 915 234 502" },
  { city: "Hawassa", name: "Kidus Assefa", email: "hawassa.admin@bizfinder.et", phone: "+251 916 234 503" },
  { city: "Bahir Dar", name: "Mulat Alemayehu", email: "bahirdar.admin@bizfinder.et", phone: "+251 918 234 504" },
  { city: "Gondar", name: "Yohannes Tesfaye", email: "gondar.admin@bizfinder.et", phone: "+251 918 234 505" },
  { city: "Mekelle", name: "Berhane Gebre", email: "mekelle.admin@bizfinder.et", phone: "+251 914 234 506" },
  { city: "Adama", name: "Gemechu Bekele", email: "adama.admin@bizfinder.et", phone: "+251 911 234 507" },
  { city: "Jimma", name: "Tariku Tadesse", email: "jimma.admin@bizfinder.et", phone: "+251 917 234 508" },
  { city: "Bishoftu", name: "Lensa Tolessa", email: "bishoftu.admin@bizfinder.et", phone: "+251 911 234 509" },
  { city: "Harar", name: "Mustafa Ahmed", email: "harar.admin@bizfinder.et", phone: "+251 915 234 510" },
  { city: "Jigjiga", name: "Guled Farah", email: "jigjiga.admin@bizfinder.et", phone: "+251 915 234 511" },
  { city: "Dessie", name: "Kassahun Melaku", email: "dessie.admin@bizfinder.et", phone: "+251 918 234 512" },
  { city: "Shashemene", name: "Solomon Desta", email: "shashemene.admin@bizfinder.et", phone: "+251 916 234 513" },
  { city: "Dilla", name: "Biruk Haile", email: "dilla.admin@bizfinder.et", phone: "+251 916 234 514" },
  { city: "Sodo", name: "Markos Mathewos", email: "sodo.admin@bizfinder.et", phone: "+251 916 234 515" },
  { city: "Arba Minch", name: "Daniel Giday", email: "arbaminch.admin@bizfinder.et", phone: "+251 916 234 516" },
  { city: "Nekemte", name: "Tolera Feyisa", email: "nekemte.admin@bizfinder.et", phone: "+251 917 234 517" },
  { city: "Asella", name: "Dereje Hunde", email: "asella.admin@bizfinder.et", phone: "+251 911 234 518" },
  { city: "Debre Birhan", name: "Getachew Wondimu", email: "debrebirhan.admin@bizfinder.et", phone: "+251 918 234 519" },
  { city: "Debre Markos", name: "Wondwossen Takele", email: "debremarkos.admin@bizfinder.et", phone: "+251 918 234 520" },
  { city: "Gambela", name: "Ochalla Ojulu", email: "gambela.admin@bizfinder.et", phone: "+251 917 234 521" },
  { city: "Assosa", name: "Hassan Omer", email: "assosa.admin@bizfinder.et", phone: "+251 918 234 522" },
  { city: "Semera", name: "Ali Mohammed", email: "semera.admin@bizfinder.et", phone: "+251 915 234 523" },
  { city: "Robe", name: "Jeylan Kedir", email: "robe.admin@bizfinder.et", phone: "+251 916 234 524" },
  { city: "Hosaena", name: "Petros Petros", email: "hosaena.admin@bizfinder.et", phone: "+251 916 234 525" },
  { city: "Welkite", name: "Tesfaye Shibru", email: "welkite.admin@bizfinder.et", phone: "+251 911 234 526" },
  { city: "Kombolcha", name: "Yasin Seid", email: "kombolcha.admin@bizfinder.et", phone: "+251 918 234 527" },
  { city: "Axum", name: "Hailemariam Tekle", email: "axum.admin@bizfinder.et", phone: "+251 914 234 528" },
  { city: "Adigrat", name: "Girmay Abraha", email: "adigrat.admin@bizfinder.et", phone: "+251 914 234 529" },
  { city: "Woldiya", name: "Mequanent Belay", email: "woldiya.admin@bizfinder.et", phone: "+251 918 234 530" },
];

async function run() {
  console.log(">>> Connecting to MongoDB Atlas...");
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log(">>> Connected successfully!");

  const db = client.db();
  const businesses = db.collection("businesses");
  const users = db.collection("users");

  console.log(">>> Generating 500 Commercial Bank of Ethiopia (CBE) branches...");
  const branchDocs = [];
  let globalIndex = 1;

  for (const [cityName, info] of Object.entries(CBE_DISTRIBUTION)) {
    const targetCount = info.count;
    const subcities = info.subcities;

    for (let i = 0; i < targetCount; i++) {
      const codeNum = 1000 + globalIndex;
      const subcity = subcities[i % subcities.length];
      const isHq = cityName === "Addis Ababa" && i === 0;

      let branchName = isHq
        ? "Commercial Bank of Ethiopia - CBE Headquarters (New Tower)"
        : `Commercial Bank of Ethiopia - ${cityName} ${subcity} Branch #${(i % 20) + 1}`;

      const slug = `cbe-${cityName.toLowerCase().replace(/\s+/g, "-")}-${subcity.toLowerCase().replace(/\s+/g, "-")}-${codeNum}`;
      const latOffset = ((i * 17) % 50 - 25) * 0.0015;
      const lngOffset = ((i * 23) % 50 - 25) * 0.0015;

      branchDocs.push({
        id: `cbe-branch-${codeNum}`,
        name: branchName,
        slug: slug,
        ownerId: "org-cbe-corporate",
        categoryId: "banking-finance",
        categoryName: "Banking & Finance",
        subcategoryId: "banks-atms",
        subcategoryName: "Banks & ATMs",
        countryId: "ethiopia",
        countryName: "Ethiopia",
        cityId: cityName.toLowerCase().replace(/\s+/g, "-"),
        cityName: cityName,
        districtId: subcity.toLowerCase().replace(/\s+/g, "-"),
        districtName: subcity,
        addressLine: `${subcity} Kebele ${(i % 10) + 1}, ${cityName}, Ethiopia`,
        street: `${subcity} Main Avenue`,
        building: isHq ? "CBE Headquarters Tower" : "CBE Commercial Building",
        postalCode: `${1000 + (globalIndex % 900)}`,
        businessLevel: isHq ? "International" : "Large",
        servicesAndMenu: "Personal & Commercial Accounts, CBE Birr Digital Wallet, CBE Noor Interest-Free Banking, Foreign Exchange, Swift Remittance",
        location: {
          type: "Point",
          coordinates: [Number((info.lng + lngOffset).toFixed(5)), Number((info.lat + latOffset).toFixed(5))],
        },
        telephone: `+251 ${cityName === "Addis Ababa" ? "11" : "25"} ${Math.floor(100 + (i % 899))} ${Math.floor(1000 + (i % 8999))}`,
        mobile: "+251 911 000 951",
        email: `branch.${codeNum}@cbe.com.et`,
        website: "https://www.combanketh.et",
        description: `Official Commercial Bank of Ethiopia (CBE) branch located in ${subcity}, ${cityName}. Offering full retail banking, 24/7 ATM, foreign currency exchange, loans, and digital CBE Birr support.`,
        shortDescription: `Official CBE branch in ${subcity}, ${cityName} with 24/7 ATM & Foreign Exchange.`,
        yearEstablished: isHq ? 1942 : 1965 + (i % 58),
        status: "active",
        isVerified: true,
        isFeatured: isHq || i % 25 === 0,
        ratingAvg: Number((4.5 + ((i % 5) * 0.1)).toFixed(1)),
        reviewCount: 42 + (i % 80),
        viewCount: 1650 + (i * 10),
        callCount: 150 + (i * 2),
        directionCount: 300 + (i * 4),
        logoUrl: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=400&q=80",
        coverUrl: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=1200&q=80",
        priceTier: "$$",
        amenities: [
          "24/7 ATM on-site",
          "Foreign Exchange & Remittance",
          "CBE Birr Mobile Banking",
          "CBE Noor (Interest-Free Banking)",
          "POS Terminal Services",
          "Swift International Transfers",
          "Wheelchair Accessible Entrance",
          "Customer Parking"
        ],
        openingHours: [
          { dayOfWeek: 1, openTime: "08:00", closeTime: "17:00", isClosed: false },
          { dayOfWeek: 2, openTime: "08:00", closeTime: "17:00", isClosed: false },
          { dayOfWeek: 3, openTime: "08:00", closeTime: "17:00", isClosed: false },
          { dayOfWeek: 4, openTime: "08:00", closeTime: "17:00", isClosed: false },
          { dayOfWeek: 5, openTime: "08:00", closeTime: "17:00", isClosed: false },
          { dayOfWeek: 6, openTime: "08:00", closeTime: "16:00", isClosed: false },
          { dayOfWeek: 0, openTime: "00:00", closeTime: "00:00", isClosed: true }
        ],
        tags: ["CBE", "Commercial Bank of Ethiopia", "Bank", "ATM", "Foreign Exchange", "CBE Birr"],
        verificationDetails: {
          verifiedAt: "2024-01-01",
          verifiedBy: "National Bank of Ethiopia",
          licenseNumber: `NBE/CBE/LIC/${codeNum}`,
          taxIdNumber: "TIN-0002847192",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      globalIndex++;
    }
  }

  console.log(`>>> Generated ${branchDocs.length} CBE branch listings.`);
  console.log(">>> Ingesting into MongoDB in batches of 100...");

  const batchSize = 100;
  for (let i = 0; i < branchDocs.length; i += batchSize) {
    const chunk = branchDocs.slice(i, i + batchSize);
    const bulkOps = chunk.map((b) => ({
      updateOne: {
        filter: { slug: b.slug },
        update: { $set: b },
        upsert: true,
      },
    }));
    await businesses.bulkWrite(bulkOps, { ordered: false });
    console.log(`  Uploaded ${Math.min(i + batchSize, branchDocs.length)} / ${branchDocs.length} branches...`);
  }

  console.log(">>> Upserting Ethiopia Country Main Admin...");
  await users.findOneAndUpdate(
    { email: "ethiopia.lead@bizfinder.et" },
    {
      $set: {
        clerkId: "usr_ethiopia_lead_cbe",
        id: "usr_ethiopia_lead_cbe",
        name: "Marcus Holloway (Ethiopia National Lead)",
        email: "ethiopia.lead@bizfinder.et",
        role: "country_admin",
        assignedCountry: "Ethiopia",
        isActive: true,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );

  console.log(">>> Upserting 30 City Admins across Ethiopia's 30 cities...");
  const adminOps = ETHIOPIA_30_CITY_ADMINS.map((adm, idx) => ({
    updateOne: {
      filter: { email: adm.email },
      update: {
        $set: {
          clerkId: `usr_city_admin_et_${idx + 1}`,
          id: `usr_city_admin_et_${idx + 1}`,
          name: adm.name,
          email: adm.email,
          role: "city_admin",
          assignedCountry: "Ethiopia",
          assignedCity: adm.city,
          isActive: true,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      upsert: true,
    },
  }));

  await users.bulkWrite(adminOps, { ordered: false });
  console.log(">>> All 30 City Admins successfully assigned!");

  const finalBranchCount = await businesses.countDocuments({
    name: { $regex: /Commercial Bank of Ethiopia/i },
  });
  const finalCityAdminCount = await users.countDocuments({
    role: "city_admin",
    assignedCountry: "Ethiopia",
  });

  console.log("\n================================================================================");
  console.log("  SUCCESS! 500 COMMERCIAL BANK OF ETHIOPIA BRANCHES INGESTED:");
  console.log(`  - Total CBE Branches in DB: ${finalBranchCount}`);
  console.log(`  - Ethiopia Country Main Admin: Marcus Holloway (ethiopia.lead@bizfinder.et)`);
  console.log(`  - Total City Admins Assigned: ${finalCityAdminCount} (30 Cities)`);
  console.log("================================================================================\n");

  await client.close();
}

run().catch((e) => {
  console.error("FATAL ERROR:", e);
  process.exit(1);
});
