export interface CuratedSectorItem {
  name: string;
  cat: string;
  catId: string;
  year: number;
  isHeritage?: boolean;
  isVerified?: boolean;
  isPendingVerif?: boolean;
  isPendingConfirm?: boolean;
  isRejected?: boolean;
  isSuspended?: boolean;
  isFuture?: boolean;
  launchDate?: string;
  reason?: string;
  desc?: string;
}

export const CURATED_CITY_SECTORS: Record<string, CuratedSectorItem[]> = {
  nairobi: [
    { name: "The Norfolk Hotel", cat: "Hotels & Lodging", catId: "cat-hospitality", year: 1904, isHeritage: true, desc: "Pioneer luxury hotel established in 1904, a foundational heritage landmark of Nairobi." },
    { name: "Carnivore Restaurant", cat: "Food & Dining", catId: "cat-dining", year: 1980, isHeritage: true, desc: "World-famous open-air charcoal barbecue institution operating since 1980 in Lang'ata." },
    { name: "Java House — Westlands", cat: "Food & Dining", catId: "cat-dining", year: 1999, isVerified: true, desc: "East Africa's premier coffee house chain and artisan roastery flagship." },
    { name: "Aga Khan University Hospital", cat: "Health & Medical", catId: "cat-health", year: 1958, isVerified: true, desc: "East Africa's leading tertiary teaching and specialized cardiology hospital." },
    { name: "Safaricom PLC Global HQ", cat: "Technology & Software", catId: "cat-tech", year: 2000, isVerified: true, desc: "Leading telecommunications operator and creator of the M-Pesa mobile money revolution." },
    { name: "Sarit Centre Shopping Mall", cat: "Shopping & Retail", catId: "cat-retail", year: 1983, isVerified: true, desc: "Kenya's pioneer shopping mall with 130+ retail stores and international brands." },
    { name: "Equity Bank Kenya HQ", cat: "Financial & Legal", catId: "cat-finance", year: 1984, isVerified: true, desc: "Pan-African commercial financial services and SME empowerment banking institution." },
    { name: "Toyota Kenya Commercial Care", cat: "Automotive & Transport", catId: "cat-auto", year: 2012, isVerified: true, desc: "Authorized automotive diagnostic, fleet service, and parts distribution facility." },
    { name: "Mama Ngina Street Curio Market", cat: "Shopping & Retail", catId: "cat-retail", year: 2024, isPendingVerif: true, desc: "Artisan cooperative collective displaying handcrafted Maasai beadwork and wood carvings." },
    { name: "Westlands Organic Produce Guild", cat: "Food & Dining", catId: "cat-dining", year: 2024, isPendingVerif: true, desc: "Direct-from-farm certified organic vegetables and artisanal dairy collective." },
    { name: "Nairobi International Convention Pavilion", cat: "Hotels & Lodging", catId: "cat-hospitality", year: 2025, isPendingConfirm: true, desc: "State-of-the-art 6,000-seat multi-tier summit facility awaiting municipal governance sign-off." },
    { name: "Silicon Savannah FinTech Gateway", cat: "Financial & Legal", catId: "cat-finance", year: 2025, isPendingConfirm: true, desc: "Cross-border payment infrastructure switch submitted for Stage 1 municipal verification." },
    { name: "Embakasi Wholesale Dispensary", cat: "Health & Medical", catId: "cat-health", year: 2022, isRejected: true, reason: "Pharmacy and Poisons Board operating license renewal certificate required." },
    { name: "Eastleigh Textile Arcade Stall #44", cat: "Shopping & Retail", catId: "cat-retail", year: 2020, isRejected: true, reason: "Physical GPS entrance coordinates misaligned with Nairobi City County cadastral map." },
    { name: "Alchemist Nairobi Evening Lounge", cat: "Food & Dining", catId: "cat-dining", year: 2022, isSuspended: true, reason: "County acoustic sound barrier regulatory review in progress." },
    { name: "Konza Technopolis City Innovation Tower", cat: "Technology & Software", catId: "cat-tech", year: 2026, isFuture: true, launchDate: "Q4 2026", desc: "18-story smart city innovation tower and pan-African robotics accelerator." },
    { name: "Nairobi Commuter Rail Underground Galleria", cat: "Shopping & Retail", catId: "cat-retail", year: 2027, isFuture: true, launchDate: "March 2027", desc: "Subterranean multi-modal transit concourse with 140 retail storefronts." },
    { name: "Athi River Green Hydrogen Fleet Depot", cat: "Automotive & Transport", catId: "cat-auto", year: 2027, isFuture: true, launchDate: "Q2 2027", desc: "Commercial hydrogen refuelling and long-haul electric logistics hub." }
  ],
  "new york": [
    { name: "The Plaza Hotel", cat: "Hotels & Lodging", catId: "cat-hospitality", year: 1907, isHeritage: true, desc: "Legendary luxury landmark hotel overlooking Central Park South since 1907." },
    { name: "Katz's Delicatessen", cat: "Food & Dining", catId: "cat-dining", year: 1888, isHeritage: true, desc: "New York's oldest and most iconic Jewish delicatessen, serving pastrami since 1888." },
    { name: "Strand Bookstore (18 Miles of Books)", cat: "Shopping & Retail", catId: "cat-retail", year: 1927, isHeritage: true, desc: "Historic independent bookstore founded in 1927 carrying 2.5 million books." },
    { name: "Le Bernardin Seafood", cat: "Food & Dining", catId: "cat-dining", year: 1986, isVerified: true, desc: "World-acclaimed three-Michelin-starred French seafood temple by Chef Eric Ripert." },
    { name: "Mount Sinai Hospital Central", cat: "Health & Medical", catId: "cat-health", year: 1852, isVerified: true, desc: "Premier academic medical center acclaimed for cardiology, oncology, and neurology." },
    { name: "Google NYC Chelsea Innovation Campus", cat: "Technology & Software", catId: "cat-tech", year: 2006, isVerified: true, desc: "Major engineering and product design headquarters in the heart of Chelsea." },
    { name: "JPMorgan Chase World Headquarters", cat: "Financial & Legal", catId: "cat-finance", year: 1799, isVerified: true, desc: "Global financial services institution headquartered on Park Avenue." },
    { name: "Manhattan Motorcars Premier Care", cat: "Automotive & Transport", catId: "cat-auto", year: 1995, isVerified: true, desc: "Certified luxury automotive sales, diagnostic inspection, and maintenance facility." },
    { name: "Chelsea Arts & Antiques Flea Market", cat: "Shopping & Retail", catId: "cat-retail", year: 2024, isPendingVerif: true, desc: "Artisan marketplace hosting 60+ mid-century furniture and vintage dealers." },
    { name: "Lower East Side Artisan Bakery Collective", cat: "Food & Dining", catId: "cat-dining", year: 2024, isPendingVerif: true, desc: "Neighborhood cooperative producing naturally fermented sourdough and heritage bagels." },
    { name: "Midtown Quantum Computing Hub", cat: "Technology & Software", catId: "cat-tech", year: 2025, isPendingConfirm: true, desc: "Collaborative high-performance quantum lab awaiting municipal registration endorsement." },
    { name: "Wall Street Digital Clearing Gateway", cat: "Financial & Legal", catId: "cat-finance", year: 2025, isPendingConfirm: true, desc: "Next-generation distributed ledger settlement network submitted for city validation." },
    { name: "Bowery Organic Apothecary", cat: "Health & Medical", catId: "cat-health", year: 2023, isRejected: true, reason: "NYC Department of Health retail pharmacy credentialing endorsement pending." },
    { name: "SoHo Pop-Up Gallery #12", cat: "Shopping & Retail", catId: "cat-retail", year: 2021, isRejected: true, reason: "Certificate of Occupancy discrepancy on historical landmark register." },
    { name: "Meatpacking District Rooftop Lounge", cat: "Food & Dining", catId: "cat-dining", year: 2023, isSuspended: true, reason: "Municipal noise code compliance hold under administrative review." },
    { name: "One World Observatory Horizon Center", cat: "Technology & Software", catId: "cat-tech", year: 2026, isFuture: true, launchDate: "Q3 2026", desc: "Interactive sky-deck aerospace exhibit and immersive digital media theatre." },
    { name: "Hudson Yards Phase 2 Innovation Galleria", cat: "Shopping & Retail", catId: "cat-retail", year: 2027, isFuture: true, launchDate: "Spring 2027", desc: "Multi-level sustainable retail and high-tech corporate campus." },
    { name: "JFK Airport Zero-Emission Fleet Charging Port", cat: "Automotive & Transport", catId: "cat-auto", year: 2027, isFuture: true, launchDate: "Q2 2027", desc: "Commercial heavy freight EV charging terminal and clean hydrogen depot." }
  ],
  london: [
    { name: "Harrods Knightsbridge", cat: "Shopping & Retail", catId: "cat-retail", year: 1849, isHeritage: true, desc: "World's most famous luxury department store featuring 330 departments across 7 floors." },
    { name: "The Ritz London", cat: "Hotels & Lodging", catId: "cat-hospitality", year: 1906, isHeritage: true, desc: "Exemplar of Edwardian luxury hospitality and traditional afternoon tea since 1906." },
    { name: "Borough Market Merchants", cat: "Food & Dining", catId: "cat-dining", year: 1014, isHeritage: true, desc: "London's historic gourmet wholesale and street food market with roots back to 1014." },
    { name: "Dishoom — Covent Garden", cat: "Food & Dining", catId: "cat-dining", year: 2010, isVerified: true, desc: "Iconic Bombay-style cafe celebrated for all-day dining and authentic Parsi breakfast." },
    { name: "St Thomas' Hospital Westminster", cat: "Health & Medical", catId: "cat-health", year: 1106, isVerified: true, desc: "World-renowned NHS foundation trust hospital directly overlooking the Houses of Parliament." },
    { name: "Barclays Bank — Canary Wharf", cat: "Financial & Legal", catId: "cat-finance", year: 1690, isVerified: true, desc: "Global banking institution headquartered in London's financial district." },
    { name: "Silicon Roundabout Tech Labs", cat: "Technology & Software", catId: "cat-tech", year: 2011, isVerified: true, desc: "Pioneer tech co-working and seed venture accelerator in Old Street." },
    { name: "Mayfair Prestige Automotive Specialists", cat: "Automotive & Transport", catId: "cat-auto", year: 2004, isVerified: true, desc: "Specialist service center for bespoke British luxury vehicles and supercars." },
    { name: "Brick Lane Artisan Craft Guild", cat: "Shopping & Retail", catId: "cat-retail", year: 2024, isPendingVerif: true, desc: "Independent community of textile artists, leatherworkers, and jewelry makers." },
    { name: "Camden Vintage Vinyl & Fashion Exchange", cat: "Shopping & Retail", catId: "cat-retail", year: 2024, isPendingVerif: true, desc: "Rare records and collectible retro clothing store in the heart of Camden Town." },
    { name: "King's Cross AI Innovation Pavilion", cat: "Technology & Software", catId: "cat-tech", year: 2025, isPendingConfirm: true, desc: "Deep-tech artificial intelligence research center submitted for municipal approval." },
    { name: "City of London Digital Asset Exchange", cat: "Financial & Legal", catId: "cat-finance", year: 2025, isPendingConfirm: true, desc: "Institutional cryptographic clearing and settlement system awaiting Stage 1 clearance." },
    { name: "Shoreditch Pop-Up Espresso Bar", cat: "Food & Dining", catId: "cat-dining", year: 2022, isRejected: true, reason: "Hackney Council street trading license and food hygiene score verification required." },
    { name: "Notting Hill Antiques Vault", cat: "Shopping & Retail", catId: "cat-retail", year: 2020, isRejected: true, reason: "Discrepancy in municipal commercial register boundary and lease plan." },
    { name: "Soho Basement Jazz & Cocktail Club", cat: "Food & Dining", catId: "cat-dining", year: 2023, isSuspended: true, reason: "Westminster City Council licensing review following acoustic monitoring." },
    { name: "Battersea Clean Energy & Innovation Hub", cat: "Technology & Software", catId: "cat-tech", year: 2026, isFuture: true, launchDate: "Q4 2026", desc: "Iconic turbine hall transformation into climate-tech incubator and retail galleria." },
    { name: "Old Street High-Speed Subterranean Arcade", cat: "Shopping & Retail", catId: "cat-retail", year: 2027, isFuture: true, launchDate: "March 2027", desc: "Interconnected underground retail and digital creative studio promenade." }
  ],
  paris: [
    { name: "Café de Flore — Saint-Germain", cat: "Food & Dining", catId: "cat-dining", year: 1887, isHeritage: true, desc: "Celebrated Parisian literary cafe frequented by philosophers and writers since 1887." },
    { name: "Galeries Lafayette Haussmann", cat: "Shopping & Retail", catId: "cat-retail", year: 1893, isHeritage: true, desc: "Iconic neo-byzantine domed department store hosting international luxury fashion houses." },
    { name: "Le Jules Verne — Tour Eiffel", cat: "Food & Dining", catId: "cat-dining", year: 1983, isVerified: true, desc: "Michelin-starred gastronomic restaurant perched on the second level of the Eiffel Tower." },
    { name: "Hôtel Plaza Athénée", cat: "Hotels & Lodging", catId: "cat-hospitality", year: 1913, isVerified: true, desc: "Palace-grade hotel on Avenue Montaigne celebrated for Haute Couture Parisian elegance." },
    { name: "Hôpital de la Pitié-Salpêtrière", cat: "Health & Medical", catId: "cat-health", year: 1656, isVerified: true, desc: "Historic teaching hospital acclaimed for specialized clinical research and surgery." },
    { name: "BNP Paribas Boulevard des Italiens", cat: "Financial & Legal", catId: "cat-finance", year: 1848, isVerified: true, desc: "Flagship corporate banking and international trade finance center." },
    { name: "Station F Paris Startup Campus", cat: "Technology & Software", catId: "cat-tech", year: 2017, isVerified: true, desc: "World's largest startup campus hosting 1,000+ early-stage tech enterprises." },
    { name: "Champs-Élysées Automotive Salon", cat: "Automotive & Transport", catId: "cat-auto", year: 2008, isVerified: true, desc: "Flagship mobility center presenting next-generation electric vehicles." },
    { name: "Le Marais Vintage Haute Couture", cat: "Shopping & Retail", catId: "cat-retail", year: 2024, isPendingVerif: true, desc: "Curated atelier specializing in archived designer garments and French silk accessories." },
    { name: "Belleville Artisan Pottery Workshop", cat: "Shopping & Retail", catId: "cat-retail", year: 2024, isPendingVerif: true, desc: "Local ceramicists studio producing hand-thrown stoneware and porcelain pieces." },
    { name: "Paris French Tech AI Pavilion", cat: "Technology & Software", catId: "cat-tech", year: 2025, isPendingConfirm: true, desc: "European sovereign AI research institute submitted for municipal endorsement." },
    { name: "Bourse Digital Commerce Gateway", cat: "Financial & Legal", catId: "cat-finance", year: 2025, isPendingConfirm: true, desc: "Cross-border electronic settlement switch awaiting city verification." },
    { name: "Montmartre Souvenir Atelier", cat: "Shopping & Retail", catId: "cat-retail", year: 2022, isRejected: true, reason: "Mairie de Paris commerce de proximité zoning compliance registration required." },
    { name: "Canal Saint-Martin Organic Dispensary", cat: "Health & Medical", catId: "cat-health", year: 2021, isRejected: true, reason: "Physical storefront entrance GPS coordinates displaced 380m." },
    { name: "Pigalle Underground Electronic Lounge", cat: "Food & Dining", catId: "cat-dining", year: 2023, isSuspended: true, reason: "Acoustic insulation inspection notice pending with Préfecture de Police." },
    { name: "Grand Paris Express Saint-Denis Concourse", cat: "Shopping & Retail", catId: "cat-retail", year: 2026, isFuture: true, launchDate: "Q4 2026", desc: "Olympic legacy high-speed rail multi-level commercial hub." },
    { name: "Seine Eco-Vessel Clean Hydrogen Terminal", cat: "Automotive & Transport", catId: "cat-auto", year: 2027, isFuture: true, launchDate: "Q2 2027", desc: "Zero-emission river freight and electric passenger shuttle charging base." }
  ],
  tokyo: [
    { name: "Tsukiji Outer Market Food Hall", cat: "Food & Dining", catId: "cat-dining", year: 1935, isHeritage: true, desc: "Historic culinary marketplace serving fresh sashimi, tamagoyaki, and street food since 1935." },
    { name: "Akihabara Electric Town Megastore", cat: "Technology & Software", catId: "cat-tech", year: 1950, isHeritage: true, desc: "World-famous epicenter for consumer robotics, electronics, gaming, and hobbyist culture." },
    { name: "The Peninsula Tokyo — Marunouchi", cat: "Hotels & Lodging", catId: "cat-hospitality", year: 2007, isVerified: true, desc: "Luxury five-star hotel situated directly opposite the Imperial Palace gardens." },
    { name: "Ginza Six Luxury Concourse", cat: "Shopping & Retail", catId: "cat-retail", year: 2017, isVerified: true, desc: "Ginza's premier luxury complex featuring 240+ international flagship boutiques." },
    { name: "The University of Tokyo Hospital", cat: "Health & Medical", catId: "cat-health", year: 1858, isVerified: true, desc: "Japan's premier university medical institution pioneer in advanced regenerative medicine." },
    { name: "Mitsubishi UFJ Financial Center", cat: "Financial & Legal", catId: "cat-finance", year: 1880, isVerified: true, desc: "Japan's largest financial group providing international commercial and digital banking." },
    { name: "Toyota Mega Web Mobility Center", cat: "Automotive & Transport", catId: "cat-auto", year: 1999, isVerified: true, desc: "Pioneer mobility exhibition, autonomous driving testing, and specialized fleet service." },
    { name: "Shibuya Bit Valley AI Incubation Studio", cat: "Technology & Software", catId: "cat-tech", year: 2019, isVerified: true, desc: "Cutting-edge incubator for venture-backed machine learning and VR applications." },
    { name: "Shinjuku Omoide Yokocho Yakitori Bar", cat: "Food & Dining", catId: "cat-dining", year: 2024, isPendingVerif: true, desc: "Traditional nostalgic alleyway counter serving charcoal-grilled skewers and local sake." },
    { name: "Asakusa Traditional Kimono & Craft Studio", cat: "Shopping & Retail", catId: "cat-retail", year: 2024, isPendingVerif: true, desc: "Artisanal workshop handcrafting Edo-style textiles and traditional accessories." },
    { name: "Tokyo Bay Quantum Computing Lab", cat: "Technology & Software", catId: "cat-tech", year: 2025, isPendingConfirm: true, desc: "Advanced quantum processor center awaiting municipal governance sign-off." },
    { name: "Nihonbashi FinTech Innovation Switch", cat: "Financial & Legal", catId: "cat-finance", year: 2025, isPendingConfirm: true, desc: "High-speed digital asset remittance platform submitted for Stage 1 endorsement." },
    { name: "Roppongi Contemporary Art Emporium", cat: "Shopping & Retail", catId: "cat-retail", year: 2022, isRejected: true, reason: "Tokyo Fire Department disaster prevention certification renewal needed." },
    { name: "Harajuku Street Fashion Boutique #8", cat: "Shopping & Retail", catId: "cat-retail", year: 2021, isRejected: true, reason: "Municipal business registration number mismatch with Shibuya Ward records." },
    { name: "Roppongi Hills Late Night Jazz Salon", cat: "Food & Dining", catId: "cat-dining", year: 2023, isSuspended: true, reason: "Minato Ward commercial noise ordinance compliance hold." },
    { name: "Tokyo Torch Tower Sky Concourse", cat: "Shopping & Retail", catId: "cat-retail", year: 2027, isFuture: true, launchDate: "March 2027", desc: "Japan's tallest skyscraper featuring 390m observation deck and international corporate center." },
    { name: "Odaiba Autonomous Transit & Robotics Port", cat: "Automotive & Transport", catId: "cat-auto", year: 2027, isFuture: true, launchDate: "Q1 2027", desc: "Self-driving logistics fleet hub and electric urban air mobility terminal." }
  ],
  dubai: [
    { name: "Al Fahidi Heritage Souq & Spices", cat: "Shopping & Retail", catId: "cat-retail", year: 1890, isHeritage: true, desc: "Historic creekside trade market renowned for saffron, oud perfumes, and Arabic textiles." },
    { name: "Burj Al Arab Jumeirah", cat: "Hotels & Lodging", catId: "cat-hospitality", year: 1999, isHeritage: true, desc: "Global icon of Arabian luxury, sail-shaped landmark hotel on a private island." },
    { name: "The Dubai Mall Downtown", cat: "Shopping & Retail", catId: "cat-retail", year: 2008, isVerified: true, desc: "World's most visited retail and entertainment destination with 1,200+ stores." },
    { name: "At The Top — Burj Khalifa", cat: "Tourism & Recreation", catId: "cat-hospitality", year: 2010, isVerified: true, desc: "Observation decks and luxury lounges atop the world's tallest architectural structure." },
    { name: "Emirates NBD Global Banking Center", cat: "Financial & Legal", catId: "cat-finance", year: 1963, isVerified: true, desc: "Premier banking group in the Middle East providing regional commercial and digital finance." },
    { name: "American Hospital Dubai Oud Metha", cat: "Health & Medical", catId: "cat-health", year: 1996, isVerified: true, desc: "Joint Commission International accredited private healthcare and surgical center." },
    { name: "Al-Futtaim Motors Commercial Hub", cat: "Automotive & Transport", catId: "cat-auto", year: 1955, isVerified: true, desc: "UAE's largest automotive distributor and commercial fleet support complex." },
    { name: "Dubai Internet City Tech Incubator", cat: "Technology & Software", catId: "cat-tech", year: 1999, isVerified: true, desc: "MENA region's leading technology innovation park and digital corporate community." },
    { name: "Deira Gold & Perfume Arcade", cat: "Shopping & Retail", catId: "cat-retail", year: 2024, isPendingVerif: true, desc: "Traditional gold traders guild with certified bullion and artisanal jewelry." },
    { name: "Al Quoz Creative Arts & Coffee Warehouse", cat: "Food & Dining", catId: "cat-dining", year: 2024, isPendingVerif: true, desc: "Industrial design hub housing independent art galleries and specialty micro-roasters." },
    { name: "Dubai AI & Web3 Campus Pavilion", cat: "Technology & Software", catId: "cat-tech", year: 2025, isPendingConfirm: true, desc: "Next-gen venture incubator in DIFC awaiting municipal governance endorsement." },
    { name: "DIFC Digital Sovereign Asset Switch", cat: "Financial & Legal", catId: "cat-finance", year: 2025, isPendingConfirm: true, desc: "Institutional virtual asset clearing framework submitted for Stage 1 sign-off." },
    { name: "Jumeirah Beachfront Pop-up Kiosk #14", cat: "Shopping & Retail", catId: "cat-retail", year: 2023, isRejected: true, reason: "Dubai Department of Economy and Tourism commercial permit endorsement required." },
    { name: "Business Bay Trade Services Office", cat: "Financial & Legal", catId: "cat-finance", year: 2021, isRejected: true, reason: "Ejari tenancy contract address mismatch with municipal cadastral number." },
    { name: "Dubai Marina Waterfront Evening Lounge", cat: "Food & Dining", catId: "cat-dining", year: 2023, isSuspended: true, reason: "Dubai Municipality noise decibel compliance hold." },
    { name: "Dubai Creek Tower Observation Plaza", cat: "Shopping & Retail", catId: "cat-retail", year: 2026, isFuture: true, launchDate: "Q4 2026", desc: "Iconic observation tower and 360-degree digital viewing concourse." },
    { name: "Vertiport Sky Transit Terminal Downtown", cat: "Automotive & Transport", catId: "cat-auto", year: 2027, isFuture: true, launchDate: "Q2 2027", desc: "Commercial electric air taxi passenger terminal connecting Dubai Airport and Marina." }
  ],
  lagos: [
    { name: "Balogun Market Textiles Hub", cat: "Shopping & Retail", catId: "cat-retail", year: 1850, isHeritage: true, desc: "West Africa's most prominent open-air fabric, lace, and trade marketplace since 1850." },
    { name: "Eko Hotel & Suites Victoria Island", cat: "Hotels & Lodging", catId: "cat-hospitality", year: 1977, isHeritage: true, desc: "Nigeria's foremost convention hotel, hospitality center, and international expo pavilion." },
    { name: "The Place Restaurant — Ikeja & VI", cat: "Food & Dining", catId: "cat-dining", year: 2004, isVerified: true, desc: "Beloved casual dining restaurant chain famous for Nigerian jollof rice and grilled meats." },
    { name: "Lekki Conservation Centre Canopy", cat: "Tourism & Recreation", catId: "cat-hospitality", year: 1977, isVerified: true, desc: "Urban biodiversity reserve featuring Africa's longest elevated canopy walkway." },
    { name: "Access Bank Headquarters Victoria Island", cat: "Financial & Legal", catId: "cat-finance", year: 1989, isVerified: true, desc: "One of Africa's largest retail banks by customer base and digital payment pioneer." },
    { name: "Computer Village Ikeja Electronics Hub", cat: "Technology & Software", catId: "cat-tech", year: 1988, isVerified: true, desc: "Largest Information and Communications Technology marketplace in Sub-Saharan Africa." },
    { name: "Lagoon Hospital Ikoyi", cat: "Health & Medical", catId: "cat-health", year: 1986, isVerified: true, desc: "First hospital in Sub-Saharan Africa to receive gold seal international accreditation." },
    { name: "Elizade Motors Toyota Center", cat: "Automotive & Transport", catId: "cat-auto", year: 1971, isVerified: true, desc: "Leading automotive sales, authorized replacement parts, and fleet management group." },
    { name: "Lekki Arts & Craft Market Guild", cat: "Shopping & Retail", catId: "cat-retail", year: 2024, isPendingVerif: true, desc: "Traditional leatherworkers and bronze sculptors bazaar in Lekki Peninsula." },
    { name: "Surulere Fashion Designers Collective", cat: "Shopping & Retail", catId: "cat-retail", year: 2024, isPendingVerif: true, desc: "Contemporary Afro-fusion tailoring house and ready-to-wear showroom." },
    { name: "Yaba Silicon Lagoon Tech Hub", cat: "Technology & Software", catId: "cat-tech", year: 2025, isPendingConfirm: true, desc: "Startup software accelerator submitted for Lagos State Innovation Council approval." },
    { name: "Lagos Inter-Bank Settlement Switch", cat: "Financial & Legal", catId: "cat-finance", year: 2025, isPendingConfirm: true, desc: "Real-time mobile instant settlement gateway awaiting municipal verification." },
    { name: "Ikeja Hardware Wholesale Depot", cat: "Shopping & Retail", catId: "cat-retail", year: 2022, isRejected: true, reason: "Lagos State Physical Planning permit and LASAA signage endorsement required." },
    { name: "Ojo Commercial Storefront #19", cat: "Shopping & Retail", catId: "cat-retail", year: 2021, isRejected: true, reason: "Storefront GPS coordinate displaced 420m on the municipal register." },
    { name: "Victoria Island Coastal Club & Bar", cat: "Food & Dining", catId: "cat-dining", year: 2023, isSuspended: true, reason: "Lagos State Environmental Protection Agency noise abatement order hold." },
    { name: "Eko Atlantic Smart City Mega Mall", cat: "Shopping & Retail", catId: "cat-retail", year: 2026, isFuture: true, launchDate: "Q4 2026", desc: "Oceanfront luxury retail destination with 300 international brands." },
    { name: "Lekki Free Zone Clean Energy Terminal", cat: "Automotive & Transport", catId: "cat-auto", year: 2027, isFuture: true, launchDate: "Q1 2027", desc: "Integrated industrial charging depot and hydrogen commercial transport hub." }
  ],
  johannesburg: [
    { name: "Sandton City Shopping Centre", cat: "Shopping & Retail", catId: "cat-retail", year: 1973, isHeritage: true, desc: "South Africa's premier luxury shopping destination with over 300 flagship stores." },
    { name: "Gold Reef City Mining Heritage", cat: "Tourism & Recreation", catId: "cat-hospitality", year: 1887, isHeritage: true, desc: "Authentic Victorian gold mine heritage complex, museum, and entertainment center." },
    { name: "The Leonardo — Sky Bar & Hotel", cat: "Hotels & Lodging", catId: "cat-hospitality", year: 2019, isVerified: true, desc: "Africa's landmark 55-story luxury tower featuring sky dining and hotel suites." },
    { name: "Standard Bank HQ Rosebank", cat: "Financial & Legal", catId: "cat-finance", year: 1862, isVerified: true, desc: "Africa's largest commercial financial institution by assets, established 1862." },
    { name: "Netcare Milpark Hospital", cat: "Health & Medical", catId: "cat-health", year: 1991, isVerified: true, desc: "Level 1 trauma and critical cardiac care hospital in central Johannesburg." },
    { name: "Tshimologong Digital Innovation Precinct", cat: "Technology & Software", catId: "cat-tech", year: 2016, isVerified: true, desc: "High-tech university-affiliated software incubator and hardware testing lab." },
    { name: "The Grillhouse Rosebank", cat: "Food & Dining", catId: "cat-dining", year: 1995, isVerified: true, desc: "Iconic classic steakhouse serving prime-aged cuts and South African reserve wines." },
    { name: "Barons Volkswagen Commercial Center", cat: "Automotive & Transport", catId: "cat-auto", year: 1978, isVerified: true, desc: "Certified vehicle repair, genuine parts distribution, and commercial fleet services." },
    { name: "Soweto Vilakazi Street Cafe", cat: "Food & Dining", catId: "cat-dining", year: 2024, isPendingVerif: true, desc: "Cultural coffee house and local heritage gallery on world-famous Vilakazi Street." },
    { name: "Rosebank Sunday Craft Market", cat: "Shopping & Retail", catId: "cat-retail", year: 2024, isPendingVerif: true, desc: "Pan-African marketplace featuring ceramics, beadwork, and artisanal textiles." },
    { name: "Braamfontein Tech Innovation Labs", cat: "Technology & Software", catId: "cat-tech", year: 2025, isPendingConfirm: true, desc: "Youth coding academy and AI research incubator awaiting municipal approval." },
    { name: "JSE Digital Asset Remittance Switch", cat: "Financial & Legal", catId: "cat-finance", year: 2025, isPendingConfirm: true, desc: "Regulated distributed clearing network submitted for Stage 1 municipal sign-off." },
    { name: "Newtown Artisan Workshop", cat: "Shopping & Retail", catId: "cat-retail", year: 2022, isRejected: true, reason: "City of Joburg environmental health and trade permit renewal needed." },
    { name: "Kempton Park Commercial Storefront", cat: "Shopping & Retail", catId: "cat-retail", year: 2021, isRejected: true, reason: "Building inspector plan discrepancy in municipal zoning register." },
    { name: "Maboneng Rooftop Evening Lounge", cat: "Food & Dining", catId: "cat-dining", year: 2023, isSuspended: true, reason: "Municipal emergency exit safety certificate compliance hold." },
    { name: "Gautrain Aerotropolis Expansion Hub", cat: "Automotive & Transport", catId: "cat-auto", year: 2026, isFuture: true, launchDate: "Q3 2026", desc: "High-speed rail linked commercial concourse with air freight logistics facilities." },
    { name: "Sandton Eco-Transit Underground Mall", cat: "Shopping & Retail", catId: "cat-retail", year: 2027, isFuture: true, launchDate: "March 2027", desc: "Subterranean pedestrian shopping link connecting Sandton Station and Nelson Mandela Square." }
  ],
  cairo: [
    { name: "Khan el-Khalili Historic Bazaar", cat: "Shopping & Retail", catId: "cat-retail", year: 1382, isHeritage: true, desc: "Medieval Islamic market quarter famous for copperware, amber, and spices since 1382." },
    { name: "Cairo Tower Revolving Restaurant", cat: "Food & Dining", catId: "cat-dining", year: 1961, isHeritage: true, desc: "Landmark 187m tower offering 360-degree panoramic Nile and Giza Pyramid dining." },
    { name: "Egyptian Museum Antiquities Center", cat: "Tourism & Recreation", catId: "cat-hospitality", year: 1902, isHeritage: true, desc: "Historic museum in Tahrir Square housing thousands of ancient Egyptian antiquities." },
    { name: "Four Seasons Cairo — Nile Plaza", cat: "Hotels & Lodging", catId: "cat-hospitality", year: 2000, isVerified: true, desc: "Luxury five-star hotel situated in Garden City with expansive Nile views." },
    { name: "Al Salam International Hospital", cat: "Health & Medical", catId: "cat-health", year: 1982, isVerified: true, desc: "Leading multi-specialty healthcare facility serving Egypt and the MENA region." },
    { name: "National Bank of Egypt Central Branch", cat: "Financial & Legal", catId: "cat-finance", year: 1898, isVerified: true, desc: "Egypt's oldest and largest commercial banking institution founded in 1898." },
    { name: "The Greek Campus Tech Innovation Park", cat: "Technology & Software", catId: "cat-tech", year: 2013, isVerified: true, desc: "Egypt's first technology and creative cluster located in downtown Cairo." },
    { name: "Cairo Festival City Mall", cat: "Shopping & Retail", catId: "cat-retail", year: 2017, isVerified: true, desc: "Modern shopping and entertainment hub with 300 international retail brands." },
    { name: "Zamalek Artisan Pottery Studio", cat: "Shopping & Retail", catId: "cat-retail", year: 2024, isPendingVerif: true, desc: "Handmade pottery and Egyptian ceramic workshop on picturesque Gezira Island." },
    { name: "Heliopolis Heritage Bakery & Patisserie", cat: "Food & Dining", catId: "cat-dining", year: 2024, isPendingVerif: true, desc: "Traditional Eastern Mediterranean pastries and Egyptian flatbread bakery." },
    { name: "New Administrative Capital Smart City Pavilion", cat: "Technology & Software", catId: "cat-tech", year: 2025, isPendingConfirm: true, desc: "Next-generation smart government operations center submitted for city confirmation." },
    { name: "Nile Digital Payments & Fintech Gateway", cat: "Financial & Legal", catId: "cat-finance", year: 2025, isPendingConfirm: true, desc: "Centralized electronic clearing platform awaiting municipal endorsement." },
    { name: "Downtown Cairo Bookseller Arcade", cat: "Shopping & Retail", catId: "cat-retail", year: 2022, isRejected: true, reason: "Ministry of Culture heritage storefront display permit renewal required." },
    { name: "Giza Pyramids Viewpoint Souvenir Shop", cat: "Shopping & Retail", catId: "cat-retail", year: 2021, isRejected: true, reason: "Licensed tourism retail credentials verification required by Giza Governorate." },
    { name: "Maadi Corniche Evening Lounge", cat: "Food & Dining", catId: "cat-dining", year: 2023, isSuspended: true, reason: "Cairo Governorate municipal noise regulation inspection hold." },
    { name: "Grand Egyptian Museum Promenade Concourse", cat: "Tourism & Recreation", catId: "cat-hospitality", year: 2026, isFuture: true, launchDate: "Q4 2026", desc: "Premier cultural tourism complex with 80 international artisan retailers." },
    { name: "New Cairo Mono-Rail Commercial Concourse", cat: "Shopping & Retail", catId: "cat-retail", year: 2027, isFuture: true, launchDate: "Q1 2027", desc: "Integrated transit mall with solar power and autonomous electric shuttle links." }
  ]
};
